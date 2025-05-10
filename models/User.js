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
  hashedPassword:       { type: String, required: true }
});

UserSchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};
UserSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.hashedPassword);
};

module.exports = mongoose.model('User', UserSchema); 