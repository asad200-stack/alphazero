const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use persistent data directory if available (Railway Volume), otherwise use local
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || __dirname;
const dbPath = path.join(dataDir, 'database.sqlite');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    price REAL NOT NULL,
    discount_price REAL,
    discount_percentage REAL,
    image TEXT,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`);
  
  // Add category_id column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE products ADD COLUMN category_id INTEGER`, (err) => {
    // Ignore error if column already exists
  });

  // Product Images table (for multiple images)
  db.run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Banners table
  db.run(`CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    title_ar TEXT,
    subtitle TEXT,
    subtitle_ar TEXT,
    button_text TEXT,
    button_text_ar TEXT,
    button_link TEXT,
    button_text_2 TEXT,
    button_text_2_ar TEXT,
    button_link_2 TEXT,
    image_desktop TEXT,
    image_tablet TEXT,
    image_mobile TEXT,
    display_order INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table (for admin)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Default admin user (username: web, password: web12345)
  // Password hash for 'web12345': $2a$10$VM5uOmyinV0qiuZeXLZP..i.M6oXKkvsixulot5NwzGHEmTdyS.pG
  db.run(`INSERT OR REPLACE INTO users (username, password, role) 
    VALUES ('web', '$2a$10$VM5uOmyinV0qiuZeXLZP..i.M6oXKkvsixulot5NwzGHEmTdyS.pG', 'admin')`);

  // Themes table
  db.run(`CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    template_type TEXT NOT NULL,
    preview_image TEXT,
    is_active INTEGER DEFAULT 0,
    config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default themes
  db.run(`INSERT OR IGNORE INTO themes (name, name_ar, description, description_ar, template_type, is_active, config) VALUES 
    ('Clothing Store', 'متجر الملابس', 'Perfect for fashion and clothing stores', 'مثالي لمتاجر الأزياء والملابس', 'clothing', 1, '{"primaryColor":"#E91E63","secondaryColor":"#C2185B","fontFamily":"Inter","buttonStyle":"rounded","showBanner":true,"showFeatured":true,"showOffers":true,"showBestSellers":true}'),
    ('Beauty & Cosmetics', 'مستحضرات التجميل', 'Designed for beauty and cosmetics stores', 'مصمم لمتاجر مستحضرات التجميل', 'beauty', 0, '{"primaryColor":"#9C27B0","secondaryColor":"#7B1FA2","fontFamily":"Poppins","buttonStyle":"rounded-full","showBanner":true,"showFeatured":true,"showOffers":true,"showBestSellers":true}'),
    ('Electronics', 'الإلكترونيات', 'Perfect for electronics and tech stores', 'مثالي لمتاجر الإلكترونيات والتقنية', 'electronics', 0, '{"primaryColor":"#2196F3","secondaryColor":"#1976D2","fontFamily":"Roboto","buttonStyle":"square","showBanner":true,"showFeatured":true,"showOffers":true,"showBestSellers":true}'),
    ('General Store', 'المتجر العام', 'Versatile theme for any store', 'ثيم متعدد الاستخدامات لأي متجر', 'general', 0, '{"primaryColor":"#3B82F6","secondaryColor":"#1E40AF","fontFamily":"Inter","buttonStyle":"rounded","showBanner":true,"showFeatured":true,"showOffers":true,"showBestSellers":true}')`);

  // Default settings
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('store_name', 'متجري الإلكتروني'),
    ('store_name_en', 'My Store'),
    ('logo', ''),
    ('primary_color', '#3B82F6'),
    ('secondary_color', '#1E40AF'),
    ('whatsapp_number', ''),
    ('phone_number', ''),
    ('instagram_url', ''),
    ('store_url', ''),
    ('banner_text', 'عروض خاصة - خصومات تصل إلى 50%'),
    ('banner_text_en', 'Special Offers - Up to 50% Off'),
    ('banner_enabled', 'true'),
    ('default_language', 'ar'),
    ('holiday_theme', 'none'),
    ('active_theme', 'clothing')`);
});

module.exports = db;

