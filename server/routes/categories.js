const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { verifyToken } = require('./auth');

// Configure multer for category images
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, '..');
const uploadsDir = path.join(dataDir, 'uploads');
const categoriesDir = path.join(uploadsDir, 'categories');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoriesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
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

// Helper to delete old images
const deleteOldImage = (imagePath) => {
  if (imagePath && imagePath.startsWith('/uploads/categories/')) {
    const fullPath = path.join(dataDir, imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// Get all enabled categories (public)
router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM categories WHERE enabled = 1 ORDER BY display_order ASC, id ASC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get all categories (admin - includes disabled)
router.get('/admin', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM categories ORDER BY display_order ASC, id ASC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get single category
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(row);
  });
});

// Create category (admin only)
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  const {
    name,
    name_ar,
    description,
    description_ar,
    display_order,
    enabled
  } = req.body;

  const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

  db.run(
    `INSERT INTO categories (name, name_ar, description, description_ar, image, display_order, enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name || null,
      name_ar || null,
      description || null,
      description_ar || null,
      image,
      display_order || 0,
      enabled !== undefined ? enabled : 1
    ],
    function(err) {
      if (err) {
        // Clean up uploaded file if DB insert fails
        if (image) deleteOldImage(image);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Category created successfully' });
    }
  );
});

// Update category (admin only)
router.put('/:id', verifyToken, upload.single('image'), (req, res) => {
  const {
    name,
    name_ar,
    description,
    description_ar,
    display_order,
    enabled
  } = req.body;

  // Get existing category to check for old image
  db.get('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, existingCategory) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Prepare image path
    let image = existingCategory.image;

    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image
      if (existingCategory.image) {
        deleteOldImage(existingCategory.image);
      }
      image = `/uploads/categories/${req.file.filename}`;
    }

    // Update category
    db.run(
      `UPDATE categories SET
        name = ?, name_ar = ?,
        description = ?, description_ar = ?,
        image = ?,
        display_order = ?, enabled = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name !== undefined ? name : existingCategory.name,
        name_ar !== undefined ? name_ar : existingCategory.name_ar,
        description !== undefined ? description : existingCategory.description,
        description_ar !== undefined ? description_ar : existingCategory.description_ar,
        image,
        display_order !== undefined ? display_order : existingCategory.display_order,
        enabled !== undefined ? (enabled === '1' || enabled === 1 || enabled === true ? 1 : 0) : existingCategory.enabled,
        req.params.id
      ],
      function(err) {
        if (err) {
          // Clean up newly uploaded file if DB update fails
          if (req.file) deleteOldImage(image);
          return res.status(500).json({ error: err.message });
        }
        // Return updated category
        db.get('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, updatedCategory) => {
          if (err) {
            return res.json({ message: 'Category updated successfully' });
          }
          res.json({ message: 'Category updated successfully', category: updatedCategory });
        });
      }
    );
  });
});

// Delete category (admin only)
router.delete('/:id', verifyToken, (req, res) => {
  // Get category to delete image
  db.get('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, category) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete associated image
    deleteOldImage(category.image);

    // Delete category
    db.run('DELETE FROM categories WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Category deleted successfully' });
    });
  });
});

// Update display order (admin only)
router.put('/order/update', verifyToken, (req, res) => {
  const { orders } = req.body; // Array of { id, display_order }
  
  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: 'Invalid orders format' });
  }

  const promises = orders.map(({ id, display_order }) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE categories SET display_order = ? WHERE id = ?',
        [display_order, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json({ message: 'Display order updated successfully' });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;



