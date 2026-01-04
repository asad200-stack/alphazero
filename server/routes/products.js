const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { verifyToken } = require('./auth');

// Configure multer for file uploads
// Use persistent data directory (Railway Volume) if available
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, '..');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(dataDir, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload multiple images
const uploadMultiple = upload.array('images', 10); // Max 10 images

// Get all products (public - no auth needed)
router.get('/', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single product with images
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get all images for this product
    db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC', [req.params.id], (err, images) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // If no images in product_images table, use the old image field
      if (images.length === 0 && product.image) {
        product.images = [{ id: 0, image_path: product.image, display_order: 0 }];
      } else {
        product.images = images;
      }
      
      res.json(product);
    });
  });
});

// Create product (protected - admin only)
router.post('/', verifyToken, (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    next()
  })
}, (req, res) => {
  const { name, name_ar, description, description_ar, price, discount_price, discount_percentage, category_id, in_stock } = req.body;
  
  let imagePath = '';
  if (req.files && req.files.length > 0) {
    imagePath = `/uploads/${req.files[0].filename}`; // First image as main image
  }

  const finalPrice = parseFloat(price);
  // Only set discount_price if it's provided and valid
  let finalDiscountPrice = null;
  if (discount_price && discount_price !== '' && discount_price !== '0') {
    const parsed = parseFloat(discount_price);
    if (!isNaN(parsed) && parsed > 0 && parsed < finalPrice) {
      finalDiscountPrice = parsed;
    }
  }
  const finalDiscountPercentage = discount_percentage ? parseFloat(discount_percentage) : null;

  const inStockValue = in_stock !== undefined ? (in_stock === '1' || in_stock === 1 ? 1 : 0) : 1;
  
  db.run(
    `INSERT INTO products (name, name_ar, description, description_ar, price, discount_price, discount_percentage, image, category_id, in_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, name_ar || name, description, description_ar || description, finalPrice, finalDiscountPrice, finalDiscountPercentage, imagePath, category_id || null, inStockValue],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const productId = this.lastID;
      
      // Insert multiple images
      if (req.files && req.files.length > 0) {
        const imageInserts = req.files.map((file, index) => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO product_images (product_id, image_path, display_order) VALUES (?, ?, ?)',
              [productId, `/uploads/${file.filename}`, index],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });
        
        Promise.all(imageInserts)
          .then(() => {
            res.json({ id: productId, message: 'Product created successfully' });
          })
          .catch((err) => {
            res.status(500).json({ error: err.message });
          });
      } else {
        res.json({ id: productId, message: 'Product created successfully' });
      }
    }
  );
});

// Update product (protected - admin only)
router.put('/:id', verifyToken, (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    next()
  })
}, (req, res) => {
  const { name, name_ar, description, description_ar, price, discount_price, discount_percentage, category_id, in_stock, deleted_images } = req.body;
  
  // Get existing product
  db.get('SELECT image FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let imagePath = product.image;
    if (req.files && req.files.length > 0) {
      imagePath = `/uploads/${req.files[0].filename}`; // First image as main
    }

    const finalPrice = parseFloat(price);
    // Only set discount_price if it's provided and valid
    let finalDiscountPrice = null;
    if (discount_price && discount_price !== '' && discount_price !== '0') {
      const parsed = parseFloat(discount_price);
      if (!isNaN(parsed) && parsed > 0 && parsed < finalPrice) {
        finalDiscountPrice = parsed;
      }
    }
    const finalDiscountPercentage = discount_percentage ? parseFloat(discount_percentage) : null;
    const inStockValue = in_stock !== undefined ? (in_stock === '1' || in_stock === 1 ? 1 : 0) : 1;

    db.run(
      `UPDATE products 
       SET name = ?, name_ar = ?, description = ?, description_ar = ?, 
           price = ?, discount_price = ?, discount_percentage = ?, 
           image = ?, category_id = ?, in_stock = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, name_ar || name, description, description_ar || description, 
       finalPrice, finalDiscountPrice, finalDiscountPercentage, imagePath, category_id || null, inStockValue, req.params.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Delete removed images
        if (deleted_images) {
          console.log('Received deleted_images:', deleted_images);
          try {
            const deletedIds = typeof deleted_images === 'string' ? JSON.parse(deleted_images) : deleted_images;
            console.log('Parsed deleted image IDs:', deletedIds);
            const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, '..');
            
            if (Array.isArray(deletedIds) && deletedIds.length > 0) {
              deletedIds.forEach(imageId => {
                console.log('Deleting image with ID:', imageId);
                db.get('SELECT image_path FROM product_images WHERE id = ?', [imageId], (err, img) => {
                  if (err) {
                    console.error('Error fetching image:', err);
                  } else if (img) {
                    const imgPath = path.join(dataDir, img.image_path);
                    console.log('Deleting image file:', imgPath);
                    if (fs.existsSync(imgPath)) {
                      try {
                        fs.unlinkSync(imgPath);
                        console.log('Image file deleted successfully');
                      } catch (unlinkErr) {
                        console.error('Error deleting image file:', unlinkErr);
                      }
                    } else {
                      console.log('Image file not found:', imgPath);
                    }
                  } else {
                    console.log('Image not found in database for ID:', imageId);
                  }
                });
                
                db.run('DELETE FROM product_images WHERE id = ?', [imageId], (err) => {
                  if (err) {
                    console.error('Error deleting image from database:', err);
                  } else {
                    console.log('Image deleted from database:', imageId);
                  }
                });
              });
            }
          } catch (parseErr) {
            console.error('Error parsing deleted_images:', parseErr);
          }
        }
        
        // Add new images
        if (req.files && req.files.length > 0) {
          db.all('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [req.params.id], (err, result) => {
            const currentCount = result[0]?.count || 0;
            const imageInserts = req.files.map((file, index) => {
              return new Promise((resolve, reject) => {
                db.run(
                  'INSERT INTO product_images (product_id, image_path, display_order) VALUES (?, ?, ?)',
                  [req.params.id, `/uploads/${file.filename}`, currentCount + index],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });
            
            Promise.all(imageInserts)
              .then(() => {
                res.json({ message: 'Product updated successfully' });
              })
              .catch((err) => {
                res.status(500).json({ error: err.message });
              });
          });
        } else {
          res.json({ message: 'Product updated successfully' });
        }
      }
    );
  });
});

// Delete product image (protected - admin only)
router.delete('/:id/images/:imageId', verifyToken, (req, res) => {
  db.get('SELECT image_path FROM product_images WHERE id = ? AND product_id = ?', [req.params.imageId, req.params.id], (err, image) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete image file
    const imagePath = path.join(__dirname, '..', image.image_path);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Delete from database
    db.run('DELETE FROM product_images WHERE id = ?', [req.params.imageId], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Image deleted successfully' });
    });
  });
});

// Delete product (protected - admin only)
router.delete('/:id', verifyToken, (req, res) => {
  // Get all images for this product
  db.all('SELECT image_path FROM product_images WHERE product_id = ?', [req.params.id], (err, images) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Delete all image files
    images.forEach(img => {
      const imagePath = path.join(__dirname, '..', img.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
    
    // Get product main image
    db.get('SELECT image FROM products WHERE id = ?', [req.params.id], (err, product) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Delete main image file
      if (product.image) {
        const imagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete product (cascade will delete product_images)
      db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product deleted successfully' });
      });
    });
  });
});

module.exports = router;

