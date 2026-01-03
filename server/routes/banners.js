const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { verifyToken } = require('./auth');

// Configure multer for banner images
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, '..');
const uploadsDir = path.join(dataDir, 'uploads');
const bannersDir = path.join(uploadsDir, 'banners');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannersDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all banners (public)
router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM banners WHERE enabled = 1 ORDER BY display_order ASC, id ASC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get all banners (admin - includes disabled)
router.get('/admin', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM banners ORDER BY display_order ASC, id ASC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get single banner
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM banners WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json(row);
  });
});

// Create banner (admin only)
router.post('/', verifyToken, upload.fields([
  { name: 'image_desktop', maxCount: 1 },
  { name: 'image_tablet', maxCount: 1 },
  { name: 'image_mobile', maxCount: 1 }
]), (req, res) => {
  const {
    title,
    title_ar,
    subtitle,
    subtitle_ar,
    button_text,
    button_text_ar,
    button_link,
    button_text_2,
    button_text_2_ar,
    button_link_2,
    display_order,
    enabled
  } = req.body;

  const imageDesktop = req.files?.image_desktop?.[0] ? `/uploads/banners/${req.files.image_desktop[0].filename}` : null;
  const imageTablet = req.files?.image_tablet?.[0] ? `/uploads/banners/${req.files.image_tablet[0].filename}` : null;
  const imageMobile = req.files?.image_mobile?.[0] ? `/uploads/banners/${req.files.image_mobile[0].filename}` : null;

  db.run(
    `INSERT INTO banners (
      title, title_ar, subtitle, subtitle_ar,
      button_text, button_text_ar, button_link,
      button_text_2, button_text_2_ar, button_link_2,
      image_desktop, image_tablet, image_mobile,
      display_order, enabled
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title || null,
      title_ar || null,
      subtitle || null,
      subtitle_ar || null,
      button_text || null,
      button_text_ar || null,
      button_link || null,
      button_text_2 || null,
      button_text_2_ar || null,
      button_link_2 || null,
      imageDesktop,
      imageTablet,
      imageMobile,
      display_order || 0,
      enabled !== undefined ? enabled : 1
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Banner created successfully' });
    }
  );
});

// Update banner (admin only)
router.put('/:id', verifyToken, upload.fields([
  { name: 'image_desktop', maxCount: 1 },
  { name: 'image_tablet', maxCount: 1 },
  { name: 'image_mobile', maxCount: 1 }
]), (req, res) => {
  // Log request for debugging
  console.log('Banner update request:', {
    id: req.params.id,
    body: req.body,
    files: req.files
  })
  const {
    title,
    title_ar,
    subtitle,
    subtitle_ar,
    button_text,
    button_text_ar,
    button_link,
    button_text_2,
    button_text_2_ar,
    button_link_2,
    display_order,
    enabled
  } = req.body;

  // Get existing banner to check for old images
  db.get('SELECT * FROM banners WHERE id = ?', [req.params.id], (err, existingBanner) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!existingBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    // Prepare image paths
    let imageDesktop = existingBanner.image_desktop;
    let imageTablet = existingBanner.image_tablet;
    let imageMobile = existingBanner.image_mobile;

    // Update images if new ones are uploaded
    if (req.files?.image_desktop?.[0]) {
      // Delete old desktop image
      if (existingBanner.image_desktop) {
        const oldPath = path.join(dataDir, existingBanner.image_desktop);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imageDesktop = `/uploads/banners/${req.files.image_desktop[0].filename}`;
    }

    if (req.files?.image_tablet?.[0]) {
      // Delete old tablet image
      if (existingBanner.image_tablet) {
        const oldPath = path.join(dataDir, existingBanner.image_tablet);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imageTablet = `/uploads/banners/${req.files.image_tablet[0].filename}`;
    }

    if (req.files?.image_mobile?.[0]) {
      // Delete old mobile image
      if (existingBanner.image_mobile) {
        const oldPath = path.join(dataDir, existingBanner.image_mobile);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imageMobile = `/uploads/banners/${req.files.image_mobile[0].filename}`;
    }

    // Update banner
    db.run(
      `UPDATE banners SET
        title = ?, title_ar = ?,
        subtitle = ?, subtitle_ar = ?,
        button_text = ?, button_text_ar = ?, button_link = ?,
        button_text_2 = ?, button_text_2_ar = ?, button_link_2 = ?,
        image_desktop = ?, image_tablet = ?, image_mobile = ?,
        display_order = ?, enabled = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        title !== undefined ? title : existingBanner.title,
        title_ar !== undefined ? title_ar : existingBanner.title_ar,
        subtitle !== undefined ? subtitle : existingBanner.subtitle,
        subtitle_ar !== undefined ? subtitle_ar : existingBanner.subtitle_ar,
        button_text !== undefined ? button_text : existingBanner.button_text,
        button_text_ar !== undefined ? button_text_ar : existingBanner.button_text_ar,
        button_link !== undefined ? button_link : existingBanner.button_link,
        button_text_2 !== undefined ? button_text_2 : existingBanner.button_text_2,
        button_text_2_ar !== undefined ? button_text_2_ar : existingBanner.button_text_2_ar,
        button_link_2 !== undefined ? button_link_2 : existingBanner.button_link_2,
        imageDesktop,
        imageTablet,
        imageMobile,
        display_order !== undefined ? display_order : existingBanner.display_order,
        enabled !== undefined ? (enabled === '1' || enabled === 1 || enabled === true ? 1 : 0) : existingBanner.enabled,
        req.params.id
      ],
      function(err) {
        if (err) {
          console.error('Database error updating banner:', err)
          return res.status(500).json({ error: err.message });
        }
        console.log('Banner updated successfully:', req.params.id)
        // Return updated banner
        db.get('SELECT * FROM banners WHERE id = ?', [req.params.id], (err, updatedBanner) => {
          if (err) {
            return res.json({ message: 'Banner updated successfully' });
          }
          res.json({ message: 'Banner updated successfully', banner: updatedBanner });
        });
      }
    );
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
        'UPDATE banners SET display_order = ? WHERE id = ?',
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

// Delete banner (admin only)
router.delete('/:id', verifyToken, (req, res) => {
  // Get banner to delete images
  db.get('SELECT * FROM banners WHERE id = ?', [req.params.id], (err, banner) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    // Delete images
    [banner.image_desktop, banner.image_tablet, banner.image_mobile].forEach(imagePath => {
      if (imagePath) {
        const fullPath = path.join(dataDir, imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    });

    // Delete banner
    db.run('DELETE FROM banners WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Banner deleted successfully' });
    });
  });
});

module.exports = router;

