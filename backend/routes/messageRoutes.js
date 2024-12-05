const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getMessagesWith);
router.post('/send', messageController.sendMessage);
router.put('/:messageId/read', messageController.markAsRead);
router.get('/search/:username', messageController.searchUsers);
router.post('/send-image', authMiddleware, upload.single('image'), messageController.sendImageMessage);

module.exports = router; 