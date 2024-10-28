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
    const updateData = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Log changes
    const changes = [];
    for (const [key, value] of Object.entries(updateData)) {
      if (task[key] !== value) {
        changes.push(`${key} changed from ${task[key]} to ${value}`);
      }
    }

    // Update task
    Object.assign(task, updateData);
    await project.save();

    // Log activity
    if (changes.length > 0) {
      await logTaskActivity(
        projectId,
        taskId,
        `updated: ${changes.join(', ')}`,
        req.user.userId
      );
    }

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

exports.getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const project = await Project.findById(projectId, { activityLog: 1 });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const totalLogs = project.activityLog.length;
    const totalPages = Math.ceil(totalLogs / pageSize);
    const skip = (page - 1) * pageSize;

    const paginatedLogs = project.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + pageSize);

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
    console.error("Error fetching project activity log:", error);
    res.status(500).json({
      message: "Error fetching project activity log",
      error: error.toString(),
    });
  }
};

exports.getTaskComments = async (req, res) => {
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

    // Populate author information for each comment
    await Project.populate(task.comments, {
      path: "author",
      select: "username _id"
    });

    // Sort comments by creation date (newest first)
    const sortedComments = task.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.json(sortedComments);
  } catch (error) {
    console.error("Error fetching task comments:", error);
    res.status(500).json({
      message: "Error fetching task comments",
      error: error.toString()
    });
  }
};

exports.addTaskComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create new comment
    const newComment = {
      content: content.trim(),
      author: userId,
      createdAt: new Date()
    };

    // Add comment to task
    task.comments.unshift(newComment);
    await project.save();

    // Get the newly added comment (first one in the array after unshift)
    const addedComment = task.comments[0];

    // Populate author information
    await Project.populate(addedComment, {
      path: "author",
      select: "username _id"
    });

    // Log activity
    await logTaskActivity(
      projectId,
      taskId,
      `New comment added`,
      userId
    );

    res.status(201).json(addedComment);
  } catch (error) {
    console.error("Error adding task comment:", error);
    res.status(500).json({
      message: "Error adding task comment",
      error: error.toString()
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { projectId, taskId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the author of the comment
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    comment.content = content.trim();
    await project.save();

    // Populate author information
    await Project.populate(comment, {
      path: "author",
      select: "username _id"
    });

    res.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Error updating comment",
      error: error.toString()
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { projectId, taskId, commentId } = req.params;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the author of the comment
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    task.comments.pull(commentId);
    await project.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Error deleting comment",
      error: error.toString()
    });
  }
};
