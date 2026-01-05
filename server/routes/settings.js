const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { verifyToken } = require('./auth');

// Configure multer for file uploads
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
    const prefix = file.fieldname === 'logo' ? 'logo' : file.fieldname === 'banner' ? 'banner' : 'file';
    cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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

// Upload single file (for logo or banner)
const uploadSingle = upload.single('file');

// Get all settings (public)
router.get('/', (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Convert array of {key, value} to object
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  });
});

// Update settings (protected - admin only)
router.put('/', verifyToken, (req, res, next) => {
  // Check if request has files (FormData) or JSON
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('multipart/form-data')) {
    // Handle file upload using multer - support both logo and banner
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  } else {
    // JSON request, no files
    next();
  }
}, (req, res) => {
  const updates = {};
  
  // Handle file uploads
  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      updates.logo = `/uploads/${req.files.logo[0].filename}`;
    }
    if (req.files.banner && req.files.banner[0]) {
      updates.banner_image = `/uploads/${req.files.banner[0].filename}`;
    }
  }
  
  // Handle regular form fields (from FormData or JSON body)
  const fields = ['store_name', 'store_name_en', 'primary_color', 'secondary_color', 
                  'whatsapp_number', 'phone_number', 'instagram_url', 'store_url',
                  'banner_enabled', 'default_language', 'holiday_theme', 'banner_image'];
  
  fields.forEach(field => {
    if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
      updates[field] = req.body[field];
    }
  });
  
  // Update database
  const updatePromises = Object.keys(updates).map(key => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, updates[key]],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
  
  Promise.all(updatePromises)
    .then(() => {
      res.json({ message: 'Settings updated successfully', updates });
    })
    .catch((err) => {
      console.error('Error updating settings:', err);
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
