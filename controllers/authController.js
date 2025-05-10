const xss       = require('xss');
const validator = require('validator');
const User      = require('../models/User');

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
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !await user.validatePassword(password)) {
    return res.render('auth/login', { error: 'Invalid credentials.' });
  }
  req.session.userId = user._id;
  req.session.isAdmin = user.isAdmin;
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
}; 