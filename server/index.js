const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

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
const reviewsRoutes = require('./routes/reviews');
const ordersRoutes = require('./routes/orders');
const customersRoutes = require('./routes/customers');
const shippingRoutes = require('./routes/shipping');

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/shipping', shippingRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  
  // Log static files setup
  console.log('📁 Serving static files from:', distPath);
  console.log('📁 Directory exists:', fs.existsSync(distPath));
  
  // Serve static files first (JS, CSS, images, etc.)
  // This middleware will serve files if they exist, otherwise call next()
  app.use(express.static(distPath, {
    index: false // Don't auto-serve index.html, we'll handle it manually
  }));
  
  // Log requests for debugging
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      console.log(`📄 Request: ${req.method} ${req.path}`);
    }
    next();
  });
  
  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Serve index.html for SPA routing
    const indexPath = path.resolve(distPath, 'index.html');
    console.log(`📄 Serving index.html for: ${req.path}`);
    
    if (fs.existsSync(indexPath)) {
      // Read and log first few lines of index.html for debugging
      const htmlContent = fs.readFileSync(indexPath, 'utf8');
      const firstLines = htmlContent.split('\n').slice(0, 15).join('\n');
      console.log(`📄 index.html preview:\n${firstLines}`);
      
      res.sendFile(indexPath);
    } else {
      console.error(`❌ index.html not found at: ${indexPath}`);
      res.status(500).send('Frontend build not found');
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


