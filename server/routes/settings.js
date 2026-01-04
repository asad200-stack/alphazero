const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { verifyToken } = require('./auth');

// Configure multer for logo upload
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
    cb(null, 'logo' + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all settings
router.get('/', (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

// Get single setting
router.get('/:key', (req, res) => {
  db.get('SELECT value FROM settings WHERE key = ?', [req.params.key], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: req.params.key, value: row.value });
  });
});

// Update settings (protected - admin only)
router.put('/', verifyToken, (req, res, next) => {
  // Check content type
  const contentType = req.headers['content-type'] || '';
  console.log('Settings PUT request - Content-Type:', contentType);
  console.log('Settings PUT request - Body type:', typeof req.body);
  console.log('Settings PUT request - Body keys:', Object.keys(req.body || {}));
  console.log('Settings PUT request - Body:', JSON.stringify(req.body).substring(0, 200));
  console.log('Settings PUT request - Method:', req.method);
  console.log('Settings PUT request - URL:', req.url);
  
  // If body is empty and it's not multipart, it might be a parsing issue
  if (!contentType.includes('multipart/form-data') && (!req.body || Object.keys(req.body).length === 0)) {
    console.warn('Empty body detected for non-multipart request - this might be a parsing issue');
    // Don't return error yet - let's see if it's just empty data
  }
  
  if (contentType.includes('multipart/form-data')) {
    // Use multer for multipart requests
    upload.single('logo')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err)
        // Only return error for real issues (file size, type)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum 2MB allowed.' })
        }
        if (err.message && err.message.includes('Only image files')) {
          return res.status(400).json({ error: err.message })
        }
        // For missing file or parsing errors, log but continue
        console.warn('Multer warning (continuing):', err.message || err.code)
      }
      console.log('After multer - Body keys:', Object.keys(req.body || {}));
      console.log('After multer - File:', req.file ? req.file.filename : 'none');
      next()
    })
  } else {
    // JSON request, skip multer
    console.log('Non-multipart request, skipping multer');
    // Body should be parsed by express.json() middleware
    // If body is empty, it might be a parsing issue, but let's continue anyway
    // as some valid requests might have empty bodies
    next()
  }
}, (req, res) => {
  const updates = req.body || {};
  
  console.log('Processing updates - Raw body:', JSON.stringify(updates).substring(0, 300));
  console.log('Processing updates - Keys:', Object.keys(updates));
  
  // Ensure updates is an object and has data
  if (typeof updates !== 'object' || Array.isArray(updates)) {
    console.error('Invalid updates type:', typeof updates, Array.isArray(updates));
    return res.status(400).json({ error: 'Invalid request body' })
  }
  
  // Filter out empty values and undefined, but keep 0 and false
  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    const value = updates[key];
    // Keep the value if it's not undefined, null, or empty string
    // But keep 0, false, and other falsy values that are valid
    if (value !== undefined && value !== null && value !== '') {
      filteredUpdates[key] = value;
    }
  });
  
  console.log('Filtered updates - Keys:', Object.keys(filteredUpdates));
  console.log('Filtered updates - Values:', JSON.stringify(filteredUpdates).substring(0, 500));
  
  // Check if filtered updates object is empty
  if (Object.keys(filteredUpdates).length === 0) {
    console.error('Empty filtered updates object');
    console.error('Original updates:', JSON.stringify(updates));
    console.error('Original updates keys:', Object.keys(updates));
    console.error('Has file:', !!req.file);
    console.error('Content-Type:', req.headers['content-type']);
    
    // If we have a file, add it to filteredUpdates
    if (req.file) {
      filteredUpdates.logo = `/uploads/${req.file.filename}`;
      console.log('Added logo to filteredUpdates:', filteredUpdates.logo);
    }
    
    // Only return error if there's no file and no updates at all
    if (!req.file && Object.keys(updates).length === 0) {
      console.error('No file and no updates - returning 400');
      return res.status(400).json({ error: 'No data provided to update' })
    }
    
    // If we still have no updates after adding logo, return error
    if (Object.keys(filteredUpdates).length === 0) {
      console.error('Still no updates after processing - returning 400');
      return res.status(400).json({ error: 'No valid data provided to update' })
    }
  }
  
  // Handle logo upload
  if (req.file) {
    // Delete old logo if exists
    const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, '..');
    db.get('SELECT value FROM settings WHERE key = ?', ['logo'], (err, row) => {
      if (row && row.value) {
        const oldLogoPath = path.join(dataDir, row.value);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    });
    
    filteredUpdates.logo = `/uploads/${req.file.filename}`;
  }

  // Update each setting
  const promises = Object.keys(filteredUpdates).map(key => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, filteredUpdates[key]],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json({ message: 'Settings updated successfully' });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;


