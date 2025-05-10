const Event          = require('../models/Event');
const ModerationLog  = require('../models/ModerationLog');

exports.pendingEvents = async (req, res) => {
  const events = await Event.find({ status: 'pending' }).sort('postedDate');
  res.render('admin/pending', { events });
};

exports.approveEvent = async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, { status: 'approved' });
  await ModerationLog.create({
    eventID:   req.params.id,
    adminID:   req.session.userId,
    action:    'approved',
    notes:     req.body.notes || ''
  });
  res.redirect('/admin/events/pending');
};

exports.rejectEvent = async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  await ModerationLog.create({
    eventID:   req.params.id,
    adminID:   req.session.userId,
    action:    'rejected',
    notes:     req.body.notes || ''
  });
  res.redirect('/admin/events/pending');
}; 