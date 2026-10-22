const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const tokenParts = token.split(' ');
    const actualToken = tokenParts[0] === 'Bearer' ? tokenParts[1] : tokenParts[0];

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const authority = (req, res, next) => {
  if (req.user && (req.user.role === 'authority' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Authority access required' });
  }
};

module.exports = { auth, admin, authority };