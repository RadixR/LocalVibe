const Notification = require('../models/Notification');
const User         = require('../models/User');
const Event        = require('../models/Event');

exports.getNotifications = async (req, res) => {
  const staticNotifs = await Notification.find({ userID: req.session.userId })
    .sort({ timestamp: -1 })
    .lean();

  const user = await User.findById(req.session.userId)
    .populate('rsvpedEvents.eventID', 'title eventDate startTime');
  const now = new Date();
    
  let upcomingRsvps = []; 
  if (user && user.rsvpedEvents) { 
    upcomingRsvps = user.rsvpedEvents
      .map(r => {
        const ev = r.eventID;
        if (!ev) return null;
        const [h, m] = ev.startTime.split(':').map(Number);
        const dt = new Date(ev.eventDate);
        dt.setHours(h, m, 0, 0);
        return dt > now
          ? {
              _id:       ev._id,
              title:     ev.title,
              isoString: dt.toISOString()
            }
          : null;
      })
      .filter(x => x);
  } else {
    console.warn(`User not found or no rsvpedEvents in getNotifications for userId: ${req.session.userId}`);
  }

  res.render('notifications/index', { staticNotifs, upcomingRsvps });
};

exports.deleteNotification = async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, userID: req.session.userId });
  res.redirect('/notifications');
};

exports.deleteAllNotifications = async (req, res) => {
  await Notification.deleteMany({ userID: req.session.userId });
  res.redirect('/notifications');
};

exports.createNotification = async (userID, type, eventID, message) => {
  await Notification.create({
    userID,
    type,
    eventID,
    message
  });
}; 