const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserStats
} = require('../controllers/authController');
const { 
  authenticateUser, 
  adminOnly 
} = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateUser);

// GET /api/auth/profile - Get current user profile
router.get('/profile', getProfile);

// PUT /api/auth/profile - Update current user profile
router.put('/profile', updateProfile);

// Admin-only routes
// GET /api/auth/users - Get all users
router.get('/users', adminOnly, getAllUsers);

// GET /api/auth/users/stats - Get user statistics
router.get('/users/stats', adminOnly, getUserStats);

// PUT /api/auth/users/:userId/role - Update user role
router.put('/users/:userId/role', adminOnly, updateUserRole);

// PUT /api/auth/users/:userId/status - Toggle user active status
router.put('/users/:userId/status', adminOnly, toggleUserStatus);

// DELETE /api/auth/users/:userId - Delete user
router.delete('/users/:userId', adminOnly, deleteUser);

module.exports = router;