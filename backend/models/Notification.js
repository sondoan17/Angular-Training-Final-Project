const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'task_assignment',
      'task_modified',
      'due_date',
      'mention',
      'project_update',
      'new_comment'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema); 