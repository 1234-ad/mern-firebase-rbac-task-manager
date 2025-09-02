const User = require('../models/User');
const { auth } = require('../config/firebase');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid })
      .select('-__v')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json({
      user: {
        ...user,
        permissions: req.user.permissions
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: error.message 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { displayName, profile } = req.body;
    const allowedUpdates = ['displayName', 'profile'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        message: 'No valid updates provided' 
      });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.firebaseUid },
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      isActive,
      search 
    } = req.query;

    let filter = {};

    // Apply filters
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Search functionality
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be user, manager, or admin' 
      });
    }

    // Prevent self-role modification
    if (userId === req.user.firebaseUid) {
      return res.status(400).json({ 
        message: 'Cannot modify your own role' 
      });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      { role },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      message: 'Error updating user role',
      error: error.message 
    });
  }
};

// Deactivate/activate user (admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-status modification
    if (userId === req.user.firebaseUid) {
      return res.status(400).json({ 
        message: 'Cannot modify your own account status' 
      });
    }

    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      message: 'Error updating user status',
      error: error.message 
    });
  }
};

// Delete user account (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.user.firebaseUid) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account' 
      });
    }

    // Delete from MongoDB
    const user = await User.findOneAndDelete({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally delete from Firebase Auth (uncomment if needed)
    // try {
    //   await auth.deleteUser(userId);
    // } catch (firebaseError) {
    //   console.error('Firebase user deletion error:', firebaseError);
    // }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Error deleting user',
      error: error.message 
    });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          managers: { $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] } },
          users: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
        }
      }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('displayName email role createdAt')
      .lean();

    res.json({
      stats: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        admins: 0,
        managers: 0,
        users: 0
      },
      recentUsers
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching user statistics',
      error: error.message 
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserStats
};