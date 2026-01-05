// Log startup immediately
console.log('🚀 Starting server...');
console.log('📂 Process working directory:', process.cwd());
console.log('📂 __dirname:', __dirname);

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
// Railway automatically sets PORT, so we use it or default to 8080
const PORT = process.env.PORT || 8080;

console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', PORT);

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
const distPath = path.join(__dirname, '../client/dist');
console.log('📁 Static files path:', distPath);
console.log('📁 Directory exists:', fs.existsSync(distPath));
console.log('📁 NODE_ENV:', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
  // List files in dist directory for debugging
  if (fs.existsSync(distPath)) {
    try {
      const files = fs.readdirSync(distPath);
      console.log('📁 Files in dist:', files);
      if (fs.existsSync(path.join(distPath, 'assets'))) {
        const assets = fs.readdirSync(path.join(distPath, 'assets'));
        console.log('📁 Assets:', assets.slice(0, 5), '...');
      }
    } catch (err) {
      console.error('❌ Error reading dist:', err.message);
    }
  }
  
  // Serve static assets (JS, CSS, images, etc.) - must come before catch-all
  console.log('✅ Setting up static file serving from:', distPath);
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    index: false, // Don't serve index.html for directory requests
    fallthrough: true // Continue to next middleware if file not found
  }));
  
  // Serve index.html for all non-API, non-asset routes (SPA fallback)
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip asset requests (they should be handled by express.static above)
    // If express.static couldn't find the file, it calls next() and we serve index.html
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('📄 SPA fallback for:', req.path, '-> Serving index.html');
      res.sendFile(path.resolve(indexPath));
    } else {
      console.error('❌ index.html not found at:', indexPath);
      res.status(500).send(`
        <html>
          <body>
            <h1>Frontend Build Not Found</h1>
            <p>Expected path: ${indexPath}</p>
            <p>Current directory: ${__dirname}</p>
            <p>NODE_ENV: ${process.env.NODE_ENV}</p>
          </body>
        </html>
      `);
    }
  });
} else {
  // In development, just log that we're not serving static files
  console.log('⚠️  Not in production mode, static files not served');
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep server running
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Current directory: ${__dirname}`);
  console.log(`📂 Dist path: ${path.join(__dirname, '../client/dist')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});


