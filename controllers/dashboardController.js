const Event = require('../models/Event');
const User  = require('../models/User');

exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
        console.warn('Dashboard accessed for non-existent user ID:', req.session.userId);
        return res.redirect('/auth/login'); 
    }
    const now  = new Date();

    const rsvpIds    = user.rsvpedEvents.map(r => r.eventID);
    const allRsvps   = await Event.find({
      _id: { $in: rsvpIds }, status: 'approved'
    }).sort('eventDate');

    const plainRsvps = allRsvps.map(event => event.toObject());

    const upcoming = plainRsvps.filter(e => {
      const start = new Date(`${e.eventDate.toISOString().slice(0,10)}T${e.startTime}`);
      return start > now;
    });
    const past = plainRsvps.filter(e => {
      const start = new Date(`${e.eventDate.toISOString().slice(0,10)}T${e.startTime}`);
      return start <= now;
    });


    const bookmarks = await Event.find({
      _id: { $in: user.bookmarkedEvents }, status: 'approved'
    });
    const plainBookmarks = bookmarks.map(event => event.toObject());
    
    const createdEvents = await Event.find({ creatorID: req.session.userId }).sort('-postedDate'); 
    const plainCreatedEvents = createdEvents.map(event => event.toObject());
   

    console.log('Dashboard data:', {
      upcoming: upcoming.map(e => ({ title: e.title, date: e.eventDate })),
      past: past.map(e => ({ title: e.title, date: e.eventDate })),
      bookmarks: plainBookmarks.map(e => ({ title: e.title, date: e.eventDate })),
      created: plainCreatedEvents.map(e => ({ title: e.title, status: e.status }))
    });

    res.render('dashboard', { 
      upcoming, 
      past, 
      bookmarks: plainBookmarks,
      createdEvents: plainCreatedEvents,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('error', {
      message: 'Error loading dashboard',
      error: error
    });
  }
}; 