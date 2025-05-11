const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userID:    String,
  name:      String,
  comment:   String,
  timestamp: { type: Date, default: Date.now }
});

const EventSchema = new mongoose.Schema({
  creatorID:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  address:     { type: String, required: true, trim: true },
  category:    String,
  tags:        [String],
  postedDate:  { type: Date, default: Date.now },
  eventDate:   { type: Date, required: true },
  startTime:   String,
  endTime:     String,
  location:    String,
  capacity:    Number,
  ticketLink:  String,
  status:      { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  rsvpUserIDs: [mongoose.Schema.Types.ObjectId],
  comments:    [CommentSchema]
});

// Full‐text search on title & description
EventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', EventSchema); 