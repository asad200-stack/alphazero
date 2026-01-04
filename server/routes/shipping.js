const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Get all shipping zones (public)
router.get('/zones', (req, res) => {
  db.all(
    'SELECT * FROM shipping_zones WHERE enabled = 1 ORDER BY name ASC',
    (err, zones) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(zones);
    }
  );
});

// Get shipping rates for a zone (public)
router.get('/zones/:zoneId/rates', (req, res) => {
  const { zoneId } = req.params;
  
  db.all(
    'SELECT * FROM shipping_rates WHERE zone_id = ? AND enabled = 1 ORDER BY shipping_cost ASC',
    [zoneId],
    (err, rates) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rates);
    }
  );
});

// Calculate shipping cost (public)
router.post('/calculate', (req, res) => {
  const { zone_id, order_amount } = req.body;
  
  if (!zone_id) {
    return res.status(400).json({ error: 'Zone ID is required' });
  }
  
  // Get the cheapest available rate for this zone that meets minimum order amount
  db.get(
    `SELECT * FROM shipping_rates 
     WHERE zone_id = ? AND enabled = 1 
     AND (min_order_amount = 0 OR min_order_amount <= ?)
     ORDER BY shipping_cost ASC
     LIMIT 1`,
    [zone_id, order_amount || 0],
    (err, rate) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!rate) {
        return res.json({ shipping_cost: 0, message: 'No shipping rate available' });
      }
      res.json({
        shipping_cost: rate.shipping_cost,
        estimated_days: rate.estimated_days,
        rate_name: rate.name
      });
    }
  );
});

// Get all shipping zones (admin)
router.get('/admin/zones', verifyToken, (req, res) => {
  db.all('SELECT * FROM shipping_zones ORDER BY name ASC', (err, zones) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(zones);
  });
});

// Create shipping zone (admin)
router.post('/admin/zones', verifyToken, (req, res) => {
  const { name, name_ar, description, enabled } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Zone name is required' });
  }
  
  db.run(
    `INSERT INTO shipping_zones (name, name_ar, description, enabled)
     VALUES (?, ?, ?, ?)`,
    [name, name_ar || null, description || null, enabled !== undefined ? enabled : 1],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Shipping zone created successfully' });
    }
  );
});

// Update shipping zone (admin)
router.put('/admin/zones/:id', verifyToken, (req, res) => {
  const { name, name_ar, description, enabled } = req.body;
  
  db.run(
    `UPDATE shipping_zones 
     SET name = ?, name_ar = ?, description = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, name_ar || null, description || null, enabled !== undefined ? enabled : 1, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Shipping zone updated successfully' });
    }
  );
});

// Delete shipping zone (admin)
router.delete('/admin/zones/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM shipping_zones WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Shipping zone deleted successfully' });
  });
});

// Get all shipping rates (admin)
router.get('/admin/rates', verifyToken, (req, res) => {
  db.all(
    `SELECT sr.*, sz.name as zone_name, sz.name_ar as zone_name_ar
     FROM shipping_rates sr
     LEFT JOIN shipping_zones sz ON sr.zone_id = sz.id
     ORDER BY sz.name, sr.shipping_cost ASC`,
    (err, rates) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rates);
    }
  );
});

// Create shipping rate (admin)
router.post('/admin/rates', verifyToken, (req, res) => {
  const { zone_id, name, name_ar, min_order_amount, shipping_cost, estimated_days, enabled } = req.body;
  
  if (!zone_id || !name || shipping_cost === undefined) {
    return res.status(400).json({ error: 'Zone ID, name, and shipping cost are required' });
  }
  
  db.run(
    `INSERT INTO shipping_rates (zone_id, name, name_ar, min_order_amount, shipping_cost, estimated_days, enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [zone_id, name, name_ar || null, min_order_amount || 0, shipping_cost, estimated_days || null, enabled !== undefined ? enabled : 1],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Shipping rate created successfully' });
    }
  );
});

// Update shipping rate (admin)
router.put('/admin/rates/:id', verifyToken, (req, res) => {
  const { name, name_ar, min_order_amount, shipping_cost, estimated_days, enabled } = req.body;
  
  db.run(
    `UPDATE shipping_rates 
     SET name = ?, name_ar = ?, min_order_amount = ?, shipping_cost = ?, estimated_days = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, name_ar || null, min_order_amount || 0, shipping_cost, estimated_days || null, enabled !== undefined ? enabled : 1, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Shipping rate updated successfully' });
    }
  );
});

// Delete shipping rate (admin)
router.delete('/admin/rates/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM shipping_rates WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Shipping rate deleted successfully' });
  });
});

module.exports = router;

