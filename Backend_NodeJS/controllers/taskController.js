const Project = require("../models/Project");
const User = require("../models/User");
const { logTaskActivity } = require("../utils/activityLogger");

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const taskData = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.tasks.push(taskData);
    await project.save();

    const newTask = project.tasks[project.tasks.length - 1];

    // Log the task creation activity
    await logTaskActivity(
      projectId,
      newTask._id,
      `Task created`,
      req.user.userId
    );

    res.status(201).json(newTask);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating task", error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate(
      "tasks.assignedTo",
      "username"
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res
      .status(500)
      .json({ message: "Error fetching task", error: error.message });
  }
};
exports.updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    await project.save();

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};
exports.deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const taskIndex = project.tasks.findIndex(
      (task) => task._id.toString() === taskId
    );
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Log the task deletion activity before removing the task
    await logTaskActivity(projectId, taskId, `Task deleted`, req.user.userId);

    project.tasks.splice(taskIndex, 1);
    await project.save();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res
      .status(500)
      .json({ message: "Error deleting task", error: error.toString() });
  }
};
exports.getTaskActivity = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const totalLogs = task.activityLog.length;
    const totalPages = Math.ceil(totalLogs / limit);
    const skip = (page - 1) * limit;

    const paginatedLogs = task.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + limit);

    // Populate the performedBy field with user information
    await Project.populate(paginatedLogs, {
      path: "performedBy",
      select: "username _id",
    });

    res.json({
      logs: paginatedLogs,
      currentPage: page,
      totalPages: totalPages,
      totalLogs: totalLogs,
    });
  } catch (error) {
    console.error("Error fetching task activity log:", error);
    res.status(500).json({
      message: "Error fetching task activity log",
      error: error.toString(),
    });
  }
};


