exports.ensureLoggedIn = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect('/auth/login');
};
exports.ensureAdmin = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  if (!req.session.isAdmin)    return res.status(403).send('Forbidden');
  next();
}; 