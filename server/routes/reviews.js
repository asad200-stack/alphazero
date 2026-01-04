const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Get reviews for a product
router.get('/product/:productId', (req, res) => {
  const { productId } = req.params;
  
  db.all(
    `SELECT * FROM reviews 
     WHERE product_id = ? AND approved = 1 
     ORDER BY created_at DESC`,
    [productId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get review statistics for a product
router.get('/product/:productId/stats', (req, res) => {
  const { productId } = req.params;
  
  db.get(
    `SELECT 
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
     FROM reviews 
     WHERE product_id = ? AND approved = 1`,
    [productId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        total_reviews: row.total_reviews || 0,
        average_rating: row.average_rating ? parseFloat(row.average_rating).toFixed(1) : 0,
        rating_distribution: {
          5: row.five_star || 0,
          4: row.four_star || 0,
          3: row.three_star || 0,
          2: row.two_star || 0,
          1: row.one_star || 0
        }
      });
    }
  );
});

// Create a new review
router.post('/', (req, res) => {
  const { product_id, customer_name, customer_email, rating, review_text } = req.body;
  
  if (!product_id || !customer_name || !rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  db.run(
    `INSERT INTO reviews (product_id, customer_name, customer_email, rating, review_text, approved)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [product_id, customer_name, customer_email || null, rating, review_text || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Review submitted successfully. It will be published after approval.' });
    }
  );
});

// Get all reviews (admin only)
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT r.*, p.name as product_name, p.name_ar as product_name_ar
     FROM reviews r
     LEFT JOIN products p ON r.product_id = p.id
     ORDER BY r.created_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Update review approval status (admin only)
router.put('/:id/approve', verifyToken, (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  
  db.run(
    `UPDATE reviews SET approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [approved ? 1 : 0, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Review updated successfully' });
    }
  );
});

// Delete review (admin only)
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM reviews WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Review deleted successfully' });
  });
});

module.exports = router;

