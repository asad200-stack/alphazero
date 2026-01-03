const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Get all themes
router.get('/', (req, res) => {
  db.all('SELECT * FROM themes ORDER BY is_active DESC, id ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse config JSON for each theme
    const themes = rows.map(theme => ({
      ...theme,
      config: theme.config ? JSON.parse(theme.config) : {}
    }));
    res.json(themes);
  });
});

// Get active theme
router.get('/active', (req, res) => {
  db.get('SELECT * FROM themes WHERE is_active = 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      // Return default theme if none is active
      return res.json({
        id: 1,
        name: 'General Store',
        name_ar: 'المتجر العام',
        template_type: 'general',
        is_active: 1,
        config: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          fontFamily: 'Inter',
          buttonStyle: 'rounded',
          showBanner: true,
          showFeatured: true,
          showOffers: true,
          showBestSellers: true
        }
      });
    }
    res.json({
      ...row,
      config: row.config ? JSON.parse(row.config) : {}
    });
  });
});

// Activate theme (protected - admin only)
router.post('/:id/activate', verifyToken, (req, res) => {
  const { id } = req.params;
  
  // First, deactivate all themes
  db.run('UPDATE themes SET is_active = 0', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Then activate the selected theme
    db.run(
      'UPDATE themes SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Update settings with active theme
        db.run(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['active_theme', id],
          (err) => {
            if (err) {
              console.error('Error updating active_theme setting:', err);
            }
          }
        );
        
        res.json({ message: 'Theme activated successfully' });
      }
    );
  });
});

// Update theme config (protected - admin only)
router.put('/:id/config', verifyToken, (req, res) => {
  const { id } = req.params;
  const { config } = req.body;
  
  db.run(
    'UPDATE themes SET config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(config), id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Theme config updated successfully' });
    }
  );
});

module.exports = router;

