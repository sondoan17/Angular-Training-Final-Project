const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getMessagesWith);
router.post('/send', messageController.sendMessage);
router.put('/:messageId/read', messageController.markAsRead);
router.get('/search/:username', messageController.searchUsers);

module.exports = router; 