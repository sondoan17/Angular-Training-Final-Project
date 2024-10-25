const Project = require('../models/Project');

const canEditTaskStatus = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Allow project creator to edit any task
    if (project.createdBy.toString() === userId) {
      return next();
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the user is the assigned member
    if (task.assignedTo.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this task status' });
    }

    next();
  } catch (error) {
    console.error('Error checking task edit permission:', error);
    res.status(500).json({ message: 'Error checking task edit permission', error: error.message });
  }
};

module.exports = { canEditTaskStatus };
