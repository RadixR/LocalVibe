const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userID:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['eventReminder','eventApproved'], required: true },
  eventID:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  message:   String,
  timestamp: { type: Date, default: Date.now },
  isRead:    { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', NotificationSchema); 