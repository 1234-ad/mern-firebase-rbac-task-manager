const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { 
  authenticateUser, 
  requirePermission,
  adminOnly 
} = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateUser);

// GET /api/tasks/stats - Get task statistics
router.get('/stats', getTaskStats);

// POST /api/tasks - Create a new task
router.post('/', requirePermission('create:tasks'), createTask);

// GET /api/tasks - Get all tasks (with role-based filtering)
router.get('/', getTasks);

// GET /api/tasks/:id - Get single task by ID
router.get('/:id', getTaskById);

// PUT /api/tasks/:id - Update task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete task (admin or creator only)
router.delete('/:id', deleteTask);

module.exports = router;