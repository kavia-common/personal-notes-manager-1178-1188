const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// PUBLIC_INTERFACE
async function register(req, res) {
  /** Register a user. 
      POST /auth/register { email, password }
  */
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }
  const exists = await userModel.findUserByEmail(email);
  if (exists) {
    return res.status(409).json({ error: 'User already exists.' });
  }
  const user = await userModel.createUser(email, password);
  return res.status(201).json({ id: user.id, email: user.email, created_at: user.created_at });
}

// PUBLIC_INTERFACE
async function login(req, res) {
  /** Login a user. 
      POST /auth/login { email, password }
      Returns JWT on success.
  */
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return res.status(200).json({ token });
}

// PUBLIC_INTERFACE
async function me(req, res) {
  /** Get current user info (id, email) - authenticated */
  const user = await userModel.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ id: user.id, email: user.email, created_at: user.created_at });
}

module.exports = {
  register,
  login,
  me,
};
