const { Pool } = require('pg');

// Database connection using environment variables
const pool = new Pool({
  host: process.env.NOTES_DATABASE_HOST,
  port: process.env.NOTES_DATABASE_PORT,
  user: process.env.NOTES_DATABASE_USER,
  password: process.env.NOTES_DATABASE_PASSWORD,
  database: process.env.NOTES_DATABASE_NAME,
  ssl: process.env.NOTES_DATABASE_SSL === 'true',
  max: 10,
  idleTimeoutMillis: 30000,
});

// PUBLIC_INTERFACE
const query = (text, params) => pool.query(text, params);

module.exports = {
  query
};
