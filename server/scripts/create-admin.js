const bcrypt = require('bcryptjs');
const db = require('../database');

// Create admin user with hashed password
const createAdmin = async () => {
  const username = 'admin';
  const password = 'admin123';
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT OR REPLACE INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, 'admin'],
    (err) => {
      if (err) {
        console.error('Error creating admin:', err);
      } else {
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
      }
      process.exit(0);
    }
  );
};

createAdmin();


