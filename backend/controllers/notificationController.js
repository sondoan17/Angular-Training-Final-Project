const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Error fetching notifications', 
      error: error.message 
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error marking notification as read', 
      error: error.message 
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error marking all notifications as read', 
      error: error.message 
    });
  }
};

exports.createBulkNotifications = async (req, res) => {
  try {
    const { recipients, ...notificationData } = req.body;
    
    const notifications = await Promise.all(
      recipients.map(userId => {
        const notification = new Notification({
          ...notificationData,
          userId,
          createdAt: new Date()
        });
        return notification.save();
      })
    );

    res.status(201).json(notifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({ 
      message: 'Error creating notifications', 
      error: error.message 
    });
  }
}; 