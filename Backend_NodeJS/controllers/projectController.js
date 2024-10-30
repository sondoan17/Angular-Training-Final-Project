const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const { logProjectActivity } = require("../utils/activityLogger");

exports.getAssignedTasks = async (req, res) => {
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
};

exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    })
    .populate('createdBy', 'username')
    .populate('members', 'username')
    .sort({ createdAt: -1 });

    const transformedProjects = projects.map(project => {
      const projectObj = project.toObject();
      return {
        ...projectObj,
        createdBy: {
          _id: projectObj.createdBy._id.toString(),
          username: projectObj.createdBy.username
        },
        members: projectObj.members.map(member => ({
          _id: member._id.toString(),
          username: member.username
        }))
      };
    });

    res.json(transformedProjects);
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    res.status(500).json({ 
      message: "Error fetching projects", 
      error: error.message 
    });
  }
};

exports.createProject = async (req, res) => {
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
};

exports.getProjectById = async (req, res) => {
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
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

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

    // Log changes
    const changes = [];
    for (const [key, value] of Object.entries(updateData)) {
      if (project[key] !== value) {
        changes.push(`${key} changed from "${project[key]}" to "${value}"`);
      }
    }

    // Update project
    Object.assign(project, updateData);
    project.updatedAt = new Date();
    await project.save();

    // Log activity
    if (changes.length > 0) {
      await logProjectActivity(
        id,
        `Project updated: ${changes.join(', ')}`,
        req.user.userId
      );
    }

    // Fetch the updated project with populated fields
    project = await Project.findById(id)
      .populate("createdBy", "username")
      .populate("members", "username");

    res.json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating project", error: error.message });
  }
};

exports.addMemberToProject = async (req, res) => {
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

    await logProjectActivity(
      req.params.id,
      `Member ${user.username} added to the project`,
      req.user.userId
    );
  } catch (error) {
    res.status(500).json({
      message: "Error adding member to project",
      error: error.message,
    });
  }
};

exports.removeMemberFromProject = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove member from project members array
    project.members.pull(memberId);

    // Add this block: Remove member from all tasks in the project
    project.tasks.forEach(task => {
      if (task.assignedTo && task.assignedTo.includes(memberId)) {
        task.assignedTo = task.assignedTo.filter(id => id.toString() !== memberId);
      }
    });

    await project.save();

    res.json({ message: "Member removed successfully", project });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Error removing member", error: error.toString() });
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

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find the project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is the creator of the project
    if (project.createdBy.toString() !== userId) {
      return res.status(403).json({ 
        message: "You don't have permission to delete this project" 
      });
    }

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.json({ 
      message: "Project deleted successfully",
      projectId: id 
    });

  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ 
      message: "Error deleting project", 
      error: error.message 
    });
  }
};


