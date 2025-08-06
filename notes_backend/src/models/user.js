const db = require('./db');
const bcrypt = require('bcrypt');

// PUBLIC_INTERFACE
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
}

// PUBLIC_INTERFACE
async function findUserByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

// PUBLIC_INTERFACE
async function findUserById(id) {
  const result = await db.query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
