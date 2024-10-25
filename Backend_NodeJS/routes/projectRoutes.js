const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const projectController = require("../controllers/projectController");
const taskController = require("../controllers/taskController");

// Project routes
router.get("/assigned-tasks", authMiddleware, projectController.getAssignedTasks);
router.get("/", authMiddleware, projectController.getAllProjects);
router.post("/create", authMiddleware, projectController.createProject);
router.get("/:id", authMiddleware, projectController.getProjectById);
router.put("/:id", authMiddleware, projectController.updateProject);
router.post("/:id/members", authMiddleware, projectController.addMemberToProject);
router.delete("/:projectId/members/:memberId", authMiddleware, projectController.removeMemberFromProject);
router.get("/:projectId/activity", authMiddleware, projectController.getProjectActivity);

// Task routes (these should be moved to taskController.js and updated accordingly)
router.post("/:projectId/tasks", authMiddleware, taskController.createTask);
router.get("/:projectId/tasks", authMiddleware, taskController.getAllTasks);
router.get("/:projectId/tasks/:taskId", authMiddleware, taskController.getTaskById);
router.put("/:projectId/tasks/:taskId", authMiddleware, taskController.updateTask);
router.delete("/:projectId/tasks/:taskId", authMiddleware, taskController.deleteTask);
router.get("/:projectId/tasks/:taskId/activity", authMiddleware, taskController.getTaskActivity);

module.exports = router;
