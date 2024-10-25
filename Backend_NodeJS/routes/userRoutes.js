const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/check/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json(!!user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking user existence", error: error.message });
  }
});

// Get user by ID
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

// Get all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.toString() });
  }
});

module.exports = router;
