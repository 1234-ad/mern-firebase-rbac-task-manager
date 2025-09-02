const { auth } = require('../config/firebase');
const User = require('../models/User');

// Verify Firebase token and authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided or invalid format.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Find or create user in database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        role: 'user' // Default role
      });
      await user.save();
    } else {
      // Update last login
      await user.updateLastLogin();
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Account is deactivated. Contact administrator.' 
      });
    }

    // Attach user info to request
    req.user = user;
    req.firebaseUser = decodedToken;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ 
        message: 'Token revoked. Please login again.' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Invalid token. Authentication failed.' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        message: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorize('admin');

// Manager or Admin middleware
const managerOrAdmin = authorize('manager', 'admin');

module.exports = {
  authenticateUser,
  authorize,
  requirePermission,
  adminOnly,
  managerOrAdmin
};