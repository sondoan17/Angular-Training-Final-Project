const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const searchController = require("../controllers/searchController");

router.get("/", authMiddleware, searchController.search);

module.exports = router;
