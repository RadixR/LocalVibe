const mongoose = require('mongoose');

const EventEditSchema = new mongoose.Schema({
  eventID:       { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  previousData:  { type: Object, required: true },
  updatedData:   { type: Object, required: true },
  changeTimestamp:{ type: Date, default: Date.now },
  reviewStatus:  { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
});

module.exports = mongoose.model('EventEdit', EventEditSchema); 