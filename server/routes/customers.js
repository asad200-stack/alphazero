const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { verifyToken } = require('./auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register new customer
router.post('/register', (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Check if email already exists
  db.get('SELECT id FROM customers WHERE email = ?', [email], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Insert customer
    db.run(
      `INSERT INTO customers (email, password, first_name, last_name, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, first_name || null, last_name || null, phone || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Generate token
        const token = jwt.sign(
          { id: this.lastID, email, role: 'customer' },
          JWT_SECRET,
          { expiresIn: '30d' }
        );
        
        res.json({
          token,
          customer: {
            id: this.lastID,
            email,
            first_name,
            last_name,
            phone
          }
        });
      }
    );
  });
});

// Customer login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  db.get('SELECT * FROM customers WHERE email = ?', [email], (err, customer) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!customer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    if (bcrypt.compareSync(password, customer.password)) {
      const token = jwt.sign(
        { id: customer.id, email: customer.email, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      res.json({
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Get customer profile (protected)
router.get('/profile', verifyToken, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  db.get('SELECT id, email, first_name, last_name, phone, created_at FROM customers WHERE id = ?', [req.user.id], (err, customer) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  });
});

// Update customer profile (protected)
router.put('/profile', verifyToken, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { first_name, last_name, phone } = req.body;
  
  db.run(
    `UPDATE customers 
     SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [first_name || null, last_name || null, phone || null, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Get customer orders (protected)
router.get('/orders', verifyToken, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Get customer email
  db.get('SELECT email FROM customers WHERE id = ?', [req.user.id], (err, customer) => {
    if (err || !customer) {
      return res.status(500).json({ error: 'Customer not found' });
    }
    
    // Get orders by email
    db.all(
      `SELECT o.*, 
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.customer_email = ?
       ORDER BY o.created_at DESC`,
      [customer.email],
      (err, orders) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(orders);
      }
    );
  });
});

// Get customer addresses (protected)
router.get('/addresses', verifyToken, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  db.all(
    'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
    [req.user.id],
    (err, addresses) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(addresses);
    }
  );
});

// Add customer address (protected)
router.post('/addresses', verifyToken, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { address_type, full_name, phone, address, city, postal_code, is_default } = req.body;
  
  if (!full_name || !phone || !address) {
    return res.status(400).json({ error: 'Full name, phone, and address are required' });
  }
  
  // If this is set as default, unset other defaults
  if (is_default) {
    db.run('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.user.id]);
  }
  
  db.run(
    `INSERT INTO customer_addresses (customer_id, address_type, full_name, phone, address, city, postal_code, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, address_type || 'home', full_name, phone, address, city || null, postal_code || null, is_default ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Address added successfully' });
    }
  );
});

// Update customer address (protected)
router.put('/addresses/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { address_type, full_name, phone, address, city, postal_code, is_default } = req.body;
  
  // Verify address belongs to customer
  db.get('SELECT customer_id FROM customer_addresses WHERE id = ?', [req.params.id], (err, addr) => {
    if (err || !addr || addr.customer_id !== req.user.id) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    // If this is set as default, unset other defaults
    if (is_default) {
      db.run('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ? AND id != ?', [req.user.id, req.params.id]);
    }
    
    db.run(
      `UPDATE customer_addresses 
       SET address_type = ?, full_name = ?, phone = ?, address = ?, city = ?, postal_code = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND customer_id = ?`,
      [address_type || 'home', full_name, phone, address, city || null, postal_code || null, is_default ? 1 : 0, req.params.id, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Address updated successfully' });
      }
    );
  });
});

// Delete customer address (protected)
router.delete('/addresses/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  db.run('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Address deleted successfully' });
  });
});

module.exports = router;

