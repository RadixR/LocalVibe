const mongoose = require('mongoose');

const ModerationLogSchema = new mongoose.Schema({
  eventID:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  adminID:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:    {
    type: String,
    enum: ['approved','rejected','requested_changes'],
    required: true
  },
  notes:     String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ModerationLog', ModerationLogSchema); 