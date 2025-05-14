const Event = require('../models/Event');
const User  = require('../models/User');

exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
        return res.redirect('/auth/login'); 
    }
    const now  = new Date();

    const rsvpIds    = user.rsvpedEvents.map(r => r.eventID);
    const allRsvps   = await Event.find({
      _id: { $in: rsvpIds }, status: 'approved'
    }).sort('eventDate');

    const plainRsvps = allRsvps.map(event => event.toObject());

    const upcoming = plainRsvps.filter(e => {
      const start = new Date(e.eventDate);
      const [h, m] = e.startTime.split(':').map(Number);
      start.setHours(h, m, 0, 0);
      return start > now;
    });
    const past = plainRsvps.filter(e => {
      const start = new Date(e.eventDate);
      const [h, m] = e.startTime.split(':').map(Number);
      start.setHours(h, m, 0, 0);
      return start <= now;
    });

    const bookmarks = await Event.find({
      _id: { $in: user.bookmarkedEvents }, status: 'approved'
    });
    const plainBookmarks = bookmarks.map(event => event.toObject());
    
    const createdEvents = await Event.find({ creatorID: req.session.userId }).sort('-postedDate'); 
    const plainCreatedEvents = createdEvents.map(event => event.toObject());

    res.render('dashboard', { 
      upcoming, 
      past, 
      bookmarks: plainBookmarks,
      createdEvents: plainCreatedEvents,
      user: req.session.user
    });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Error loading dashboard',
      error: error
    });
  }
}; 