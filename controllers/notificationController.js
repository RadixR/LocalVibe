const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const notifs = await Notification.find({ userID: req.session.userId })
    .sort({ timestamp: -1 })
    .limit(50);
  res.render('notifications/index', { notifs });
};

exports.markAsRead = async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, userID: req.session.userId },
    { isRead: true }
  );
  res.redirect('/notifications');
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { userID: req.session.userId, isRead: false },
    { isRead: true }
  );
  res.redirect('/notifications');
};

exports.createNotification = async (userID, type, eventID, message) => {
  await Notification.create({
    userID,
    type,
    eventID,
    message
  });
}; 