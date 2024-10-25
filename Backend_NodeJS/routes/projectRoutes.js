const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { ObjectId } = mongoose.Types;

// Đặt route này ở đầu file
router.get("/assigned-tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching tasks for user:", userId);

    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { members: userId },
        { "tasks.assignedTo": userId },
      ],
    });

    console.log("Found projects:", projects.length);

    const assignedTasks = projects.flatMap((project) =>
      project.tasks
        .filter(
          (task) =>
            Array.isArray(task.assignedTo) &&
            task.assignedTo.some(
              (assignee) => assignee && assignee.toString() === userId
            )
        )
        .map((task) => ({
          _id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          projectId: project._id,
          projectName: project.name,
        }))
    );

    console.log("Assigned tasks:", assignedTasks.length);

    res.json(assignedTasks);
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error fetching assigned tasks",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Các route khác giữ nguyên
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await Project.find({ createdBy: userId }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
});

router.post("/create", authMiddleware, async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const newProject = new Project({
    _id: new mongoose.Types.ObjectId(),
    name,
    description,
    createdBy: req.user.userId,
    members: [req.user.userId],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    const savedProject = await newProject.save();
    res.status(201).json({
      message: "Project created successfully",
      project: savedProject,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("members", "username");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const populatedMembers = await Promise.all(
      project.members.map(async (member) => {
        if (
          typeof member === "string" ||
          member instanceof mongoose.Types.ObjectId
        ) {
          const user = await User.findById(member).select("username");
          return user
            ? { _id: user._id, username: user.username }
            : { _id: member, username: "Unknown" };
        }
        return member;
      })
    );

    const projectObject = project.toObject();
    projectObject.members = populatedMembers;

    res.json(projectObject);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project details",
      error: error.message,
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this project" });
    }

    if (name !== project.name) {
      await logProjectActivity(id, `Project name changed from "${project.name}" to "${name}"`, req.user.userId);
    }
    if (description !== project.description) {
      await logProjectActivity(id, "Project description updated", req.user.userId);
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.updatedAt = new Date();

    await project.save();

    project = await Project.findById(id).populate("createdBy", "username");

    res.json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating project", error: error.message });
  }
});

router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (project.members.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this project" });
    }

    project.members.push(user._id);
    await project.save();

    project = await Project.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("members", "username");

    const populatedMembers = await Promise.all(
      project.members.map(async (member) => {
        if (
          typeof member === "string" ||
          member instanceof mongoose.Types.ObjectId
        ) {
          const user = await User.findById(member).select("username");
          return user
            ? { _id: user._id, username: user.username }
            : { _id: member, username: "Unknown" };
        }
        return member;
      })
    );

    const projectObject = project.toObject();
    projectObject.members = populatedMembers;

    res.json(projectObject);

    await logProjectActivity(req.params.id, `Member ${user.username} added to the project`, req.user.userId);
  } catch (error) {
    res.status(500).json({
      message: "Error adding member to project",
      error: error.message,
    });
  }
});

router.delete(
  "/:projectId/members/:memberId",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId, memberId } = req.params;

      let project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.createdBy.toString() !== req.user.userId) {
        return res.status(403).json({
          message:
            "You don't have permission to remove members from this project",
        });
      }

      if (!project.members.includes(memberId)) {
        return res
          .status(400)
          .json({ message: "User is not a member of this project" });
      }

      project.members = project.members.filter(
        (member) => member.toString() !== memberId
      );
      await project.save();

      project = await Project.findById(projectId)
        .populate("createdBy", "username")
        .populate("members", "username");

      const populatedMembers = await Promise.all(
        project.members.map(async (member) => {
          if (
            typeof member === "string" ||
            member instanceof mongoose.Types.ObjectId
          ) {
            const user = await User.findById(member).select("username");
            return user
              ? { _id: user._id, username: user.username }
              : { _id: member, username: "Unknown" };
          }
          return member;
        })
      );

      const projectObject = project.toObject();
      projectObject.members = populatedMembers;

      res.json(projectObject);

      const removedUser = await User.findById(memberId);
      await logProjectActivity(projectId, `Member ${removedUser.username} removed from the project`, req.user.userId);
    } catch (error) {
      res.status(500).json({
        message: "Error removing member from project",
        error: error.message,
      });
    }
  }
);

router.post("/:projectId/tasks", authMiddleware, async (req, res) => {
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
    await logTaskActivity(projectId, newTask._id, `Task created`, req.user.userId);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
});

router.get("/:projectId/tasks", authMiddleware, async (req, res) => {
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
});

router.get("/:projectId/tasks/:taskId", authMiddleware, async (req, res) => {
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
    res.status(500).json({ message: "Error fetching task", error: error.toString() });
  }
});

// Update a task
router.put("/:projectId/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updateData = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const currentTask = project.tasks.id(taskId);
    if (!currentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Prepare activity log entries
    const activityLogEntries = [];

    // Check for changes and create detailed log entries
    if (updateData.title !== currentTask.title) {
      activityLogEntries.push(`Title changed from "${currentTask.title}" to "${updateData.title}"`);
    }
    if (updateData.description !== currentTask.description) {
      activityLogEntries.push("Description updated");
    }
    if (updateData.status !== currentTask.status) {
      activityLogEntries.push(`Status changed from "${currentTask.status}" to "${updateData.status}"`);
    }
    if (updateData.priority !== currentTask.priority) {
      activityLogEntries.push(`Priority changed from "${currentTask.priority}" to "${updateData.priority}"`);
    }

    // Helper function to format date as DD/MM/YYYY
    const formatDate = (date) => {
      if (!date) return 'Not set';
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    // Check for changes in timeline
    if (updateData.timeline && currentTask.timeline) {
      if (formatDate(updateData.timeline.start) !== formatDate(currentTask.timeline.start)) {
        activityLogEntries.push(`Start date changed from "${formatDate(currentTask.timeline.start)}" to "${formatDate(updateData.timeline.start)}"`);
      }
      if (formatDate(updateData.timeline.end) !== formatDate(currentTask.timeline.end)) {
        activityLogEntries.push(`End date changed from "${formatDate(currentTask.timeline.end)}" to "${formatDate(updateData.timeline.end)}"`);
      }
    }

    // Check for changes in assigned members
    const currentAssignedIds = currentTask.assignedTo.map(id => id.toString());
    const newAssignedIds = updateData.assignedTo.map(id => id.toString());
    
    const addedMembers = newAssignedIds.filter(id => !currentAssignedIds.includes(id));
    const removedMembers = currentAssignedIds.filter(id => !newAssignedIds.includes(id));

    if (addedMembers.length > 0 || removedMembers.length > 0) {
      const addedUsernames = await User.find({ _id: { $in: addedMembers } }).select('username');
      const removedUsernames = await User.find({ _id: { $in: removedMembers } }).select('username');
      
      if (addedUsernames.length > 0) {
        activityLogEntries.push(`Added members: ${addedUsernames.map(u => u.username).join(', ')}`);
      }
      if (removedUsernames.length > 0) {
        activityLogEntries.push(`Removed members: ${removedUsernames.map(u => u.username).join(', ')}`);
      }
    }

    // Update the task
    Object.assign(currentTask, updateData);
    currentTask.updatedAt = new Date();

    // Add the detailed activity log
    if (activityLogEntries.length > 0) {
      currentTask.activityLog.push({
        action: activityLogEntries.join('. '),
        performedBy: req.user.userId,
        timestamp: new Date()
      });
    }

    await project.save();

    // Populate the assignedTo field
    await Project.populate(currentTask, {
      path: 'assignedTo',
      select: 'username _id'
    });

    res.json(currentTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task", error: error.toString() });
  }
});

// Delete a task
router.delete("/:projectId/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const taskIndex = project.tasks.findIndex(task => task._id.toString() === taskId);
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
    res.status(500).json({ message: "Error deleting task", error: error.toString() });
  }
});

// Get project details
router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('members', 'username _id');
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Error fetching project details", error: error.toString() });
  }
});

// Get task activity log
router.get("/:projectId/tasks/:taskId/activity", authMiddleware, async (req, res) => {
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
      path: 'performedBy',
      select: 'username _id'
    });

    res.json({
      logs: paginatedLogs,
      currentPage: page,
      totalPages: totalPages,
      totalLogs: totalLogs
    });
  } catch (error) {
    console.error("Error fetching task activity log:", error);
    res.status(500).json({ message: "Error fetching task activity log", error: error.toString() });
  }
});

// Add this function at the top of the file
const logProjectActivity = async (projectId, action, userId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    project.activityLog.push({
      action,
      performedBy: userId,
      timestamp: new Date()
    });

    await project.save();
  } catch (error) {
    console.error("Error logging project activity:", error);
  }
};

// Update the project activity log route
router.get("/:projectId/activity", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const project = await Project.findById(projectId);
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
      path: 'performedBy',
      select: 'username _id'
    });

    res.json({
      logs: paginatedLogs,
      currentPage: page,
      totalPages: totalPages,
      totalLogs: totalLogs
    });
  } catch (error) {
    console.error("Error fetching project activity log:", error);
    res.status(500).json({ message: "Error fetching project activity log", error: error.toString() });
  }
});

const logTaskActivity = async (projectId, taskId, action, userId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    const task = project.tasks.id(taskId);
    if (!task) return;

    task.activityLog.push({
      action,
      performedBy: userId,
      timestamp: new Date()
    });

    await project.save();
  } catch (error) {
    console.error("Error logging task activity:", error);
  }
};

module.exports = router;
