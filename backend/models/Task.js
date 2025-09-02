const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  createdBy: {
    type: String, // Firebase UID
    required: [true, 'Creator ID is required'],
    index: true
  },
  assignedTo: {
    type: String, // Firebase UID
    default: function() {
      return this.createdBy;
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for task age
taskSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);