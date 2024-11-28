const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all conversations of current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get unique conversations by aggregating messages
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          otherUser: {
            _id: 1,
            username: 1
          },
          lastMessage: 1,
          unreadCount: 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Error getting conversations', error: error.message });
  }
};

// Get messages between current user and specified user
exports.getMessagesWith = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'username')
    .populate('receiver', 'username');

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Error getting messages', error: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      createdAt: new Date()
    });

    await newMessage.save();

    // Populate sender and receiver info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('receiver', 'username');

    // Get the socket.io instance
    const io = req.app.locals.io;
    if (io) {
      io.to(receiverId).emit('newMessage', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiver: userId,
        read: false
      },
      { read: true },
      { new: true }
    )
    .populate('sender', 'username')
    .populate('receiver', 'username');

    if (!message) {
      return res.status(404).json({ message: 'Message not found or already read' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};


exports.searchUsers = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;

    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      username: new RegExp(username, 'i') // Case insensitive search
    })
    .select('_id username')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
}; 