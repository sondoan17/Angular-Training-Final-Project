const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { term, status, priority, type } = req.query;
    const userId = req.user.userId;

    if (!term) {
      return res.status(400).json({ message: "Search term is required" });
    }

    // Tìm kiếm projects
    const projectQuery = {
      $and: [
        {
          $or: [
            { name: { $regex: term, $options: "i" } },
            { description: { $regex: term, $options: "i" } },
          ],
        },
        { $or: [{ createdBy: userId }, { members: userId }] },
      ],
    };

    const projects = await Project.find(projectQuery).select(
      "_id name description"
    );

    // Tìm kiếm tasks
    const taskQuery = {
      $and: [
        {
          tasks: {
            $elemMatch: {
              $and: [
                {
                  $or: [
                    { title: { $regex: term, $options: "i" } },
                    { description: { $regex: term, $options: "i" } },
                  ],
                },
                status ? { status: status } : {},
                priority ? { priority: priority } : {},
                type ? { type: type } : {},
              ],
            },
          },
        },
        { $or: [{ createdBy: userId }, { members: userId }] },
      ],
    };

    const projectsWithTasks = await Project.find(taskQuery).select(
      "_id name tasks"
    );

    // kết quả
    const results = [
      ...projects.map((project) => ({
        type: "project",
        _id: project._id,
        name: project.name,
        description: project.description,
      })),
      ...projectsWithTasks.flatMap((project) =>
        project.tasks
          .filter(
            (task) =>
              (task.title.toLowerCase().includes(term.toLowerCase()) ||
                (task.description &&
                  task.description
                    .toLowerCase()
                    .includes(term.toLowerCase()))) &&
              (!status || task.status === status) &&
              (!priority || task.priority === priority) &&
              (!type || task.type === type)
          )
          .map((task) => ({
            type: "task",
            _id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            type: task.type,
            projectId: project._id,
            projectName: project.name,
          }))
      ),
    ];

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res
      .status(500)
      .json({ message: "Error performing search", error: error.message });
  }
});

module.exports = router;
