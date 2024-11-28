const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/profile', authMiddleware, userController.getCurrentUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);


router.get('/check/:username', userController.checkUsername);
router.get('/:userId', userController.getUserById);
router.get('/', userController.getAllUsers);
router.get('/find/:username', authMiddleware, userController.findUserByUsername);

module.exports = router;
