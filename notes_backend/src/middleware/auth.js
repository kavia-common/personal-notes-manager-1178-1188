const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

// PUBLIC_INTERFACE
function authenticate(req, res, next) {
  // Check Authorization: Bearer <token>
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const tokenMatch = header.match(/^Bearer (.+)$/);
  if (!tokenMatch) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }
  const token = tokenMatch[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = { id: decoded.userId };
    next();
  });
}

module.exports = {
  authenticate
};
