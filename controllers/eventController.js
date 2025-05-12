const xss   = require('xss');
const Event = require('../models/Event');
const User  = require('../models/User');

// List all approved events
exports.listEvents = async (req, res) => {
  const events = await Event.find({ status: 'approved' }).sort('eventDate');
  const plainEvents = events.map(event => event.toObject());
  res.render('events/index', { events: plainEvents, query: req.query });
};

// Show a single event's detail
exports.showEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  if (!ev || ev.status !== 'approved') return res.sendStatus(404);
  const plainEvent = ev.toObject();
  res.render('events/show', { ev: plainEvent, query: req.query });
};

// Render map view data
exports.mapView = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' });
    const data = events.map(e => ({
      _id: e._id,
      title: e.title,
      address: e.address
    }));
    res.render('events/map', { events: JSON.stringify(data) });
  } catch {
    res.render('events/map', { events: '[]' });
  }
};

// Search & filter events
exports.searchEvents = async (req, res) => {
  const { keyword, category, tag, dateFrom, dateTo, location } = req.query;
  const q = { status: 'approved' };
  if (keyword)  q.$text       = { $search: keyword };
  if (category) q.category    = category;
  if (tag)      q.tags        = tag;
  if (location) q.address     = new RegExp(location, 'i');
  if (dateFrom||dateTo) q.eventDate = {};
  if (dateFrom) q.eventDate.$gte = new Date(dateFrom);
  if (dateTo)   q.eventDate.$lte = new Date(dateTo);
  const events = await Event.find(q).sort('eventDate');
  res.render('events/index', { events, query: req.query });
};

// Show "create new event" form
exports.newEventForm = (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('events/new');
};

// Handle new event submission
exports.createEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  
  try {
    const data = {
      creatorID:   req.session.userId,
      title:       xss(req.body.title),
      description: xss(req.body.description),
      address:     xss(req.body.address),
      eventDate:   new Date(req.body.eventDate),
      startTime:   req.body.startTime,
      endTime:     req.body.endTime,
      location:    xss(req.body.location || ''),
      capacity:    parseInt(req.body.capacity, 10),
      category:    xss(req.body.category),
      tags:        (req.body.tags || '').split(',').filter(Boolean).map(t => xss(t.trim())),
      ticketLink:  xss(req.body.ticketLink || '')
    };

    const event = await Event.create(data);
    res.redirect('/events');
  } catch (error) {
    res.render('events/new', { 
      error: 'Error creating event. Please make sure all required fields are filled out correctly.',
      formData: req.body
    });
  }
};

// Add a comment to an event
exports.addComment = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const ev = await Event.findById(req.params.id);
  ev.comments.push({
    userID:  req.session.userId,
    name:    xss(req.body.name || 'Anonymous'),
    comment: xss(req.body.comment)
  });
  await ev.save();
  res.redirect(`/events/${ev._id}`);
};

// RSVP to an event with integrity checks
exports.rsvpEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const ev   = await Event.findById(req.params.id);
  const user = await User.findById(req.session.userId);

  if (ev.eventDate < new Date())
    return res.redirect(`/events/${ev._id}?error=Event%20in%20the%20past`);
  if (ev.rsvpUserIDs.length >= ev.capacity)
    return res.redirect(`/events/${ev._id}?error=Event%20full`);
  if (ev.rsvpUserIDs.includes(req.session.userId))
    return res.redirect(`/events/${ev._id}?error=Already%20RSVPd`);

  const conflict = user.rsvpedEvents.some(r =>
    new Date(r.rsvpTime).toDateString() === ev.eventDate.toDateString()
  );
  if (conflict)
    return res.redirect(`/events/${ev._id}?error=Overlapping%20event`);

  ev.rsvpUserIDs.push(req.session.userId);
  user.rsvpedEvents.push({ eventID: ev._id, rsvpTime: new Date() });
  await ev.save();
  await user.save();
  res.redirect(`/events/${ev._id}`);
};

// Bookmark an event
exports.bookmarkEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const user = await User.findById(req.session.userId);
  const id   = req.params.id;
  if (!user.bookmarkedEvents.includes(id)) {
    user.bookmarkedEvents.push(id);
    await user.save();
  }
  res.redirect(`/events/${id}`);
};

// Delete event by its author
exports.deleteEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const ev = await Event.findById(req.params.id);
  if (!ev || !ev.creatorID.equals(req.session.userId)) return res.sendStatus(403);
  await Event.findByIdAndDelete(req.params.id);
  res.redirect('/dashboard');
}; 