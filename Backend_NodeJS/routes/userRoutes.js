const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/check/:username", userController.checkUsername);
router.get("/:userId", authMiddleware, userController.getUserById);
router.get('/', authMiddleware, userController.getAllUsers);

module.exports = router;
