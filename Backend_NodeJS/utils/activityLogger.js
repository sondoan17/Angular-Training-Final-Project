const Project = require("../models/Project");

const logTaskActivity = async (projectId, taskId, action, userId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    const task = project.tasks.id(taskId);
    if (!task) return;

    task.activityLog.push({
      action,
      performedBy: userId,
      timestamp: new Date(),
    });

    await project.save();
  } catch (error) {
    console.error("Error logging task activity:", error);
  }
};

const logProjectActivity = async (projectId, action, userId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    project.activityLog.push({
      action,
      performedBy: userId,
      timestamp: new Date(),
    });

    await project.save();
  } catch (error) {
    console.error("Error logging project activity:", error);
  }
};

module.exports = { logTaskActivity, logProjectActivity };
