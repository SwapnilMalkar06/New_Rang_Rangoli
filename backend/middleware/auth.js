const jwt = require('jsonwebtoken');

// A placeholder secret keys for local dev
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_rang_rangoli_2026';

/**
 * Middleware to verify user token and authenticate requests
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check Auth header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode/Verify token (in production, fetch user from DB and attach to req.user)
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attaching user payload to request
      req.user = decoded; // Should contain { id, role, email, ... }
      
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token validation failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token token is missing'
    });
  }
};

/**
 * Middleware to restrict access to Admins only
 */
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Requires administrator credentials'
    });
  }
};
