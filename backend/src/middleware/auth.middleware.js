const jwt = require('jsonwebtoken');

function verifyToken(secret) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const token = auth.slice(7);
    try {
      req.user = jwt.verify(token, secret);
      next();
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
  };
}

const requireCustomer = verifyToken(process.env.JWT_ACCESS_SECRET);

const requireStaff = (req, res, next) => {
  verifyToken(process.env.JWT_ACCESS_SECRET)(req, res, () => {
    if (!req.user.staffId) {
      return res.status(403).json({ success: false, error: 'Staff access required' });
    }
    next();
  });
};

const requireAdmin = (req, res, next) => {
  verifyToken(process.env.JWT_ACCESS_SECRET)(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  });
};

module.exports = { requireCustomer, requireStaff, requireAdmin };
