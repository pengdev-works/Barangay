const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Connected to Neon PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('DB Query:', { text: text.substring(0, 80), duration: `${duration}ms`, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('DB Query Error:', err.message);
    throw err;
  }
};

module.exports = { pool, query };
