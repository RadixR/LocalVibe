const mongoose = require('mongoose');

const eventReportSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  reporterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Reviewed', 'Action Taken', 'Dismissed'],
    default: 'Pending Review',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EventReport', eventReportSchema); 