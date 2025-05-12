const Event = require('../models/Event');
const User  = require('../models/User');

exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const now  = new Date();

    // Fetch RSVPd events
    const rsvpIds    = user.rsvpedEvents.map(r => r.eventID);
    const allRsvps   = await Event.find({
      _id: { $in: rsvpIds }, status: 'approved'
    }).sort('eventDate');

    // Convert to plain objects
    const plainRsvps = allRsvps.map(event => event.toObject());

    const upcoming = plainRsvps.filter(e => new Date(e.eventDate) >= now);
    const past     = plainRsvps.filter(e => new Date(e.eventDate) < now);

    // Fetch bookmarks
    const bookmarks = await Event.find({
      _id: { $in: user.bookmarkedEvents }, status: 'approved'
    });
    const plainBookmarks = bookmarks.map(event => event.toObject());

    res.render('dashboard', { 
      upcoming, 
      past, 
      bookmarks: plainBookmarks
    });
  } catch {
    res.sendStatus(500);
  }
}; 