const xss       = require('xss');
const validator = require('validator');
const User      = require('../models/User');

const serverStartTime = Date.now();

exports.getRegister = (req, res) => res.render('auth/register');
exports.getLogin    = (req, res) => res.render('auth/login');

exports.postRegister = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password || !validator.isEmail(email)) {
    return res.render('auth/register', { error: 'Invalid input.' });
  }
  const hashed = await User.hashPassword(password);
  try {
    await User.create({
      firstName: xss(firstName),
      lastName:  xss(lastName),
      email:     email.toLowerCase(),
      hashedPassword: hashed
    });
    res.redirect('/auth/login');
  } catch {
    res.render('auth/register', { error: 'Email already in use.' });
  }
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  
  if (!req.session.loginAttempts || !req.session.lastAttemptTime || req.session.lastAttemptTime < serverStartTime) {
    req.session.loginAttempts = 0;
    req.session.lastAttemptTime = Date.now();
  }
  
  const timeSinceLastAttempt = Date.now() - (req.session.lastAttemptTime || 0);
  if (timeSinceLastAttempt > 15 * 60 * 1000) {
    req.session.loginAttempts = 0;
  }
  
  if (req.session.loginAttempts >= 3) {
    return res.render('auth/login', { error: 'Too many failed attempts. Please try again in 15 minutes.' });
  }
  
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !await user.validatePassword(password)) {
    req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
    req.session.lastAttemptTime = Date.now();
    return res.render('auth/login', { error: 'Invalid credentials.' });
  }
  
  req.session.loginAttempts = 0;
  req.session.lastAttemptTime = null;
  req.session.userId = user._id;
  req.session.isAdmin = user.isAdmin;
  req.session.user = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin
  };
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
}; 