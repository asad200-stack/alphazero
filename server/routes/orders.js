const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Generate unique order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Create a new order
router.post('/', (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    shipping_city,
    shipping_postal_code,
    payment_method,
    items,
    total_amount,
    notes
  } = req.body;
  
  // Validation
  if (!customer_name || !customer_phone || !shipping_address || !payment_method || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const orderNumber = generateOrderNumber();
  const paymentStatus = payment_method === 'cash_on_delivery' ? 'pending' : 'pending';
  const orderStatus = 'pending';
  
  // Insert order
  db.run(
    `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_postal_code, payment_method, payment_status, order_status, total_amount, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderNumber, customer_name, customer_email || null, customer_phone, shipping_address, shipping_city || null, shipping_postal_code || null, payment_method, paymentStatus, orderStatus, total_amount, notes || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const orderId = this.lastID;
      
      // Insert order items
      const itemPromises = items.map(item => {
        return new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO order_items (order_id, product_id, product_name, product_name_ar, quantity, price, total)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderId, item.product_id, item.product_name, item.product_name_ar || null, item.quantity, item.price, item.total],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });
      
      Promise.all(itemPromises)
        .then(() => {
          res.json({ 
            order_id: orderId,
            order_number: orderNumber,
            message: 'Order created successfully' 
          });
        })
        .catch((err) => {
          res.status(500).json({ error: err.message });
        });
    }
  );
});

// Get all orders (admin only)
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT o.*, 
     (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o
     ORDER BY o.created_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get order by ID
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT * FROM orders WHERE id = ?`,
    [id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      db.all(
        `SELECT oi.*, p.image as product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ ...order, items });
        }
      );
    }
  );
});

// Get order by order number (public)
router.get('/track/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  
  db.get(
    `SELECT * FROM orders WHERE order_number = ?`,
    [orderNumber],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      db.all(
        `SELECT oi.*, p.image as product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ ...order, items });
        }
      );
    }
  );
});

// Get order items by order ID (public - for order success page)
router.get('/:id/items', (req, res) => {
  const { id } = req.params;
  
  db.all(
    `SELECT oi.*, p.image as product_image
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [id],
    (err, items) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(items);
    }
  );
});

// Update order status (admin only)
router.put('/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { order_status, payment_status } = req.body;
  
  const updates = [];
  const values = [];
  
  if (order_status) {
    updates.push('order_status = ?');
    values.push(order_status);
  }
  
  if (payment_status) {
    updates.push('payment_status = ?');
    values.push(payment_status);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  db.run(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Order updated successfully' });
    }
  );
});

// Get order statistics (admin only)
router.get('/stats/summary', verifyToken, (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
      SUM(CASE WHEN order_status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
      SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
      SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
      SUM(total_amount) as total_revenue,
      SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue
     FROM orders`,
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    }
  );
});

module.exports = router;

