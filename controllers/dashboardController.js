const Event = require('../models/Event');
const User  = require('../models/User');

exports.dashboard = async (req, res) => {
  const user = await User.findById(req.session.userId);
  const now  = new Date();

  const rsvpIds    = user.rsvpedEvents.map(r => r.eventID);
  const allRsvps   = await Event.find({
    _id: { $in: rsvpIds }, status: 'approved'
  }).sort('eventDate');

  const upcoming = allRsvps.filter(e => e.eventDate >= now);
  const past     = allRsvps.filter(e => e.eventDate <  now);

  const bookmarks = await Event.find({
    _id: { $in: user.bookmarkedEvents }, status: 'approved'
  });

  res.render('dashboard', { upcoming, past, bookmarks });
}; 