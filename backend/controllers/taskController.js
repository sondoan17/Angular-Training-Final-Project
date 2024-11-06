const Project = require("../models/Project");
const User = require("../models/User");
const { logTaskActivity } = require("../utils/activityLogger");

const populateTaskWithValidMembers = async (task, project) => {
  if (task.assignedTo && task.assignedTo.length > 0) {
    // Add null check when filtering
    task.assignedTo = task.assignedTo.filter(memberId => 
      memberId && project.members.includes(memberId.toString())
    );
  }
  return task;
};

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

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Clean up invalid member references for all tasks
    for (let task of project.tasks) {
      await populateTaskWithValidMembers(task, project);
    }

    await Project.populate(project.tasks, {
      path: 'assignedTo',
      select: 'username _id'
    });

    res.json(project.tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
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

    // Add null check for assignedTo array
    if (task.assignedTo) {
      task.assignedTo = task.assignedTo.filter(id => id != null);
    }

    // Clean up invalid member references
    await populateTaskWithValidMembers(task, project);
    
    // Populate remaining valid members
    await Project.populate(task, {
      path: 'assignedTo',
      select: 'username _id'
    });

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
};
exports.updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Track changes for activity logs
    const changes = [];
    
    // Handle all field updates including status
    const fieldsToTrack = {
      status: 'status',
      title: 'title',
      description: 'description',
      priority: 'priority',
      type: 'type',
      assignedTo: 'assignees'
    };

    for (const [field, displayName] of Object.entries(fieldsToTrack)) {
      if (updateData[field] && JSON.stringify(updateData[field]) !== JSON.stringify(task[field])) {
        let changeMessage = '';
        
        if (field === 'assignedTo') {
          // Special handling for assignedTo array
          const oldAssignees = task.assignedTo.map(id => id.toString()).sort();
          const newAssignees = updateData.assignedTo.map(id => id.toString()).sort();
          if (JSON.stringify(oldAssignees) !== JSON.stringify(newAssignees)) {
            changeMessage = `Task assignees updated`;
          }
        } else {
          changeMessage = `${displayName} changed from "${task[field]}" to "${updateData[field]}"`;
        }
       
        if (changeMessage) {
          // Add to task's activity log
          task.activityLog.push({
            action: changeMessage,
            performedBy: userId,
            timestamp: new Date()
          });

          // Add to project's activity log with task title context
          project.activityLog.push({
            action: `Task "${task.title}": ${changeMessage}`,
            performedBy: userId,
            timestamp: new Date()
          });

          changes.push(changeMessage);
        }
      }
    }

    // Update task fields
    Object.assign(task, updateData);
    task.updatedAt = new Date();

    // Add an additional project activity log entry for status changes
    if (updateData.status && updateData.status !== task.status) {
      project.activityLog.push({
        action: `Task "${task.title}" moved to ${updateData.status}`,
        performedBy: userId,
        timestamp: new Date()
      });
    }

    await project.save();

    // Populate the response data
    const populatedProject = await Project.findById(projectId)
      .populate('tasks.activityLog.performedBy', 'username')
      .populate('activityLog.performedBy', 'username')
      .populate('tasks.assignedTo', 'username');

    const updatedTask = populatedProject.tasks.id(taskId);

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ 
      message: "Error updating task", 
      error: error.toString() 
    });
  }
};
exports.deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Use findOneAndUpdate with $pull operator for atomic operation
    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Log the task deletion activity
    await logTaskActivity(projectId, taskId, `Task deleted`, req.user.userId);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ 
      message: "Error deleting task", 
      error: error.toString() 
    });
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

    // Sort comments by creation date 
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

    // Get the newly added comment 
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

exports.updateTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status } = req.body;
    
    // Call the existing updateTask function with the status update
    return await exports.updateTask(
      { 
        params: { projectId, taskId }, 
        body: { status },
        user: { userId: req.user.userId }
      }, 
      res
    );
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ 
      message: "Error updating task status", 
      error: error.toString() 
    });
  }
};

