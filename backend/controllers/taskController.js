const Task = require('../models/Task');
const User = require('../models/User');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        message: 'Title and description are required' 
      });
    }

    // If assignedTo is provided, verify the user exists
    if (assignedTo && assignedTo !== req.user.firebaseUid) {
      const assignedUser = await User.findOne({ firebaseUid: assignedTo });
      if (!assignedUser) {
        return res.status(400).json({ 
          message: 'Assigned user not found' 
        });
      }
    }

    const task = new Task({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: req.user.firebaseUid,
      assignedTo: assignedTo || req.user.firebaseUid,
      tags: tags || []
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      message: 'Error creating task',
      error: error.message 
    });
  }
};

// Get all tasks (with role-based filtering)
const getTasks = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assignedTo, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter based on user role
    let filter = { isArchived: false };

    // Role-based access control
    if (req.user.role === 'user') {
      // Users can only see tasks assigned to them or created by them
      filter.$or = [
        { assignedTo: req.user.firebaseUid },
        { createdBy: req.user.firebaseUid }
      ];
    } else if (req.user.role === 'manager') {
      // Managers can see all tasks (no additional filter needed)
    } else if (req.user.role === 'admin') {
      // Admins can see all tasks (no additional filter needed)
    }

    // Apply additional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTasks: total,
        hasNext: skip + tasks.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks',
      error: error.message 
    });
  }
};

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access permissions
    const hasAccess = 
      req.user.role === 'admin' ||
      req.user.role === 'manager' ||
      task.assignedTo === req.user.firebaseUid ||
      task.createdBy === req.user.firebaseUid;

    if (!hasAccess) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view your own tasks.' 
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      message: 'Error fetching task',
      error: error.message 
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check update permissions
    const canUpdate = 
      req.user.role === 'admin' ||
      req.user.role === 'manager' ||
      task.createdBy === req.user.firebaseUid;

    if (!canUpdate) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update tasks you created.' 
      });
    }

    // Validate assignedTo if being updated
    if (updates.assignedTo && updates.assignedTo !== task.assignedTo) {
      const assignedUser = await User.findOne({ firebaseUid: updates.assignedTo });
      if (!assignedUser) {
        return res.status(400).json({ 
          message: 'Assigned user not found' 
        });
      }
    }

    // Update task
    Object.assign(task, updates);
    await task.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      message: 'Error updating task',
      error: error.message 
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check delete permissions (only admin or task creator)
    const canDelete = 
      req.user.role === 'admin' ||
      task.createdBy === req.user.firebaseUid;

    if (!canDelete) {
      return res.status(403).json({ 
        message: 'Access denied. Only admins or task creators can delete tasks.' 
      });
    }

    await Task.findByIdAndDelete(id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      message: 'Error deleting task',
      error: error.message 
    });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    let matchFilter = { isArchived: false };

    // Apply role-based filtering
    if (req.user.role === 'user') {
      matchFilter.$or = [
        { assignedTo: req.user.firebaseUid },
        { createdBy: req.user.firebaseUid }
      ];
    }

    const stats = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      stats: stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
        overdue: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching task statistics',
      error: error.message 
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
};