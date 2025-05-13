const Event          = require('../models/Event');
const ModerationLog  = require('../models/ModerationLog');
const { createNotification } = require('./notificationController');

exports.pendingEvents = async (req, res) => {
  try {
    console.log('Fetching pending events...');
    
    const allEvents = await Event.find({});
    console.log('Total events in database:', allEvents.length);
    
    const events = await Event.find({ status: 'pending' })
      .populate({
        path: 'creatorID',
        select: 'firstName lastName email'
      })
      .sort('postedDate');
    
    const plainEvents = events.map(event => {
      const plain = event.toObject();
      if (plain.creatorID) {
        console.log('Creator info:', plain.creatorID);
      } else {
        console.log('No creator info for event:', plain.title);
      }
      return plain;
    });
    
    console.log('Pending events found:', plainEvents.length);
    console.log('Raw pending events data:', JSON.stringify(plainEvents, null, 2));
    
    // Log each event's key fields
    plainEvents.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log('Title:', event.title);
      console.log('Status:', event.status);
      console.log('Creator:', event.creatorID ? `${event.creatorID.firstName} ${event.creatorID.lastName}` : 'No creator');
      console.log('Date:', event.eventDate);
    });
    
    res.render('admin/pending', { 
      events: plainEvents,
      title: 'Pending Events',
      user: req.session.user
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    res.status(500).render('error', { 
      message: 'Error fetching pending events',
      error: error
    });
  }
};

exports.approveEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  await Event.findByIdAndUpdate(req.params.id, { status: 'approved' });
  await ModerationLog.create({
    eventID:   req.params.id,
    adminID:   req.session.userId,
    action:    'approved',
    notes:     req.body.notes || ''
  });
  await createNotification(
    ev.creatorID,
    'eventApproved',
    req.params.id,
    'Your event has been approved.'
  );
  res.redirect('/admin/events/pending');
};

exports.rejectEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  await Event.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  await ModerationLog.create({
    eventID:   req.params.id,
    adminID:   req.session.userId,
    action:    'rejected',
    notes:     req.body.notes || ''
  });
  const notes = req.body.notes || '';
  await createNotification(
    ev.creatorID,
    'eventRejected',
    req.params.id,
    `Your event has been rejected. Reason: ${notes}`
  );
  res.redirect('/admin/events/pending');
};

exports.requestChanges = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  await Event.findByIdAndUpdate(req.params.id, { status: 'requested_changes' });
  await ModerationLog.create({
    eventID: req.params.id,
    adminID: req.session.userId,
    action: 'requested_changes',
    notes: req.body.notes || ''
  });
  const notes = req.body.notes || '';
  await createNotification(
    ev.creatorID,
    'eventChangesRequested',
    req.params.id,
    `Changes requested for your event. Details: ${notes}`
  );
  res.redirect('/admin/events/pending');
}; 