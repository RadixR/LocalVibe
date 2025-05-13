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
  const upcomingRsvps = user.rsvpedEvents
    .map(r => {
      const ev = r.eventID;
      if (!ev) return null;
      const dt = new Date(
        ev.eventDate.toISOString().slice(0,10) + 'T' + ev.startTime
      );
      return dt > now
        ? {
            _id:       ev._id,
            title:     ev.title,
            isoString: dt.toISOString()
          }
        : null;
    })
    .filter(x => x);

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