const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Oturum gerekli. Lütfen giriş yapın.',
    });
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || 'User',
    };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş oturum. Tekrar giriş yapın.',
    });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice(7));
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role || 'User',
      };
    } catch {
      req.user = null;
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için yönetici yetkisi gerekli.',
    });
  }
  next();
}

function requireSelfOrAdmin(paramName = 'userId') {
  return (req, res, next) => {
    const targetId = parseInt(
      req.params[paramName] || req.query[paramName] || req.body?.[paramName],
      10
    );
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Oturum gerekli.' });
    }
    if (req.user.role === 'Admin' || req.user.userId === targetId) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Bu kaynağa erişim yetkiniz yok.',
    });
  };
}

module.exports = { authenticate, optionalAuth, requireAdmin, requireSelfOrAdmin };
