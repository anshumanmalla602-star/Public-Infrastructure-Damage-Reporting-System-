
const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'neondb',
  user: process.env.DB_USER || 'neondb_owner',
  password: process.env.DB_PASSWORD,

  // Enable SSL for the hosted Neon PostgreSQL database
  ssl: process.env.DB_HOST
    ? { rejectUnauthorized: false }
    : false,
});

pool.connect()
  .then((client) => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
  });

module.exports = pool;
