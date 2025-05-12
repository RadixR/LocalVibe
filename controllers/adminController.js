const Event          = require('../models/Event');
const ModerationLog  = require('../models/ModerationLog');

exports.pendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate({
        path: 'creatorID',
        select: 'firstName lastName email'
      })
      .sort('postedDate');
    
    const plainEvents = events.map(event => event.toObject());
    
    res.render('admin/pending', { 
      events: plainEvents,
      title: 'Pending Events'
    });
  } catch {
    res.sendStatus(500);
  }
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

exports.requestChanges = async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, { status: 'requested_changes' });
  await ModerationLog.create({
    eventID: req.params.id,
    adminID: req.session.userId,
    action: 'requested_changes',
    notes: req.body.notes || ''
  });
  res.redirect('/admin/events/pending');
}; 