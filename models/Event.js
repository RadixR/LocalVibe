const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  comment: String,
  timestamp: { type: Date, default: Date.now }
});

const EventSchema = new mongoose.Schema({
  creatorID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  address: { type: String, required: true, trim: true },
  formattedAddress: { type: String, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
  placeId: { type: String },
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  capacity: { type: Number, required: true },
  category: { type: String, required: true },
  tags: [String],
  ticketLink: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'requested_changes'], default: 'pending' },
  rsvpUserIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  postedDate: { type: Date, default: Date.now }
});

EventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', EventSchema); 