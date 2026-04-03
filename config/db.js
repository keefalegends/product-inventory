const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.RDS_HOSTNAME,
  port:     process.env.RDS_PORT     || 5432,
  database: process.env.RDS_DB_NAME,
  user:     process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  console.log('✅ Connected to RDS PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ RDS connection error:', err.message);
});

module.exports = pool;
