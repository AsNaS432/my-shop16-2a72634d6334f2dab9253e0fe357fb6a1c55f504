const path = require('path');
const envPath = path.join(__dirname, '.env');

console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'myshop',
  password: process.env.DB_PASSWORD || '12345',
  port: process.env.DB_PORT || 5433,
});

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('Failed to connect to PostgreSQL database:', err);
    process.exit(1);
  });


pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if orders table exists and has the correct columns
    const ordersTableCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);

    const existingColumns = ordersTableCheck.rows.map(row => row.column_name);
    
    // Create orders table if it does not exist
    if (!existingColumns.includes('products')) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          products JSONB NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          delivery_method VARCHAR(50) NOT NULL,
          address TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Auth endpoints
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    
    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex'),
      { expiresIn: '1h' }
    );
    
    res.json({ user: result.rows[0], token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, result.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex'),
      { expiresIn: '1h' }
    );
    
    res.json({ 
      user: { id: result.rows[0].id, email: result.rows[0].email },
      token 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { user_id, user_email, products, phone_number, delivery_method, address } = req.body;

    if (!user_id || !user_email || !products || !phone_number || !delivery_method || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await pool.query(
      'INSERT INTO orders (user_id, user_email, products, phone_number, delivery_method, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, user_email, JSON.stringify(products), phone_number, delivery_method, address]
    );

    res.status(201).json({ order: result.rows[0] });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    if (result.rows.length === 0) {
      console.warn('Products table is empty');
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    if (err.code === '42P01') { // Relation does not exist error
      console.error('The "products" table does not exist in the database');
    }
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: err.message 
    });
  }
});


app.get('/api/test-products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
