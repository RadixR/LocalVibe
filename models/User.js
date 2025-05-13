const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  firstName:            { type: String, required: true, trim: true },
  lastName:             { type: String, required: true, trim: true },
  email:                {
    type: String, required: true, unique: true,
    lowercase: true,
    validate: value => validator.isEmail(value)
  },
  hashedPassword:       { type: String, required: true },
  isAdmin:             { type: Boolean, default: false },
  createdEvents:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  rsvpedEvents:         [{
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    eventDate: { type: Date, required: true },
    rsvpTime: { type: Date, default: Date.now }
  }],
  bookmarkedEvents:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  interests:            [String],
  preferredCategories:  [String],
  notificationPreferences: {
    emailAlerts: { type: Boolean, default: true },
    appAlerts:   { type: Boolean, default: true }
  }
});

UserSchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};
UserSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.hashedPassword);
};

module.exports = mongoose.model('User', UserSchema); 