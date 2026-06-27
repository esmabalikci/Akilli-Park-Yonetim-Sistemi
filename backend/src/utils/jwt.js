const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'apays-dev-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(user) {
  return jwt.sign(
    {
      userId: user.Id || user.id,
      email: user.Email || user.email,
      role: user.Role || user.role || 'User',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken, JWT_SECRET };
