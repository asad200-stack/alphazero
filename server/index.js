const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
// Render automatically sets PORT, so we use it or default to 5000
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Add error handling for JSON parsing
app.use(express.json({ 
  limit: '10mb',
  strict: false, // Allow non-array/object JSON
  type: 'application/json' // Only parse application/json
}));

// Error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON parsing error:', err.message);
    console.error('Request URL:', req.url);
    console.error('Content-Type:', req.headers['content-type']);
    return res.status(400).json({ error: 'Invalid JSON in request body: ' + err.message });
  }
  next();
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Use persistent data directory for uploads (Railway Volume), otherwise use local
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || __dirname;
const uploadsDir = path.join(dataDir, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Import routes
const productsRoutes = require('./routes/products');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const bannersRoutes = require('./routes/banners');
const categoriesRoutes = require('./routes/categories');
const themesRoutes = require('./routes/themes');
const reviewsRoutes = require('./routes/reviews');
const ordersRoutes = require('./routes/orders');

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/orders', ordersRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


