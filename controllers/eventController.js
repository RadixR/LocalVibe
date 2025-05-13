const xss   = require('xss');
const Event = require('../models/Event');
const User  = require('../models/User');
const EventEdit = require('../models/EventEdit');
const Notification = require('../models/Notification');
const ModerationLog = require('../models/ModerationLog');

exports.listEvents = async (req, res) => {
  const events = await Event.find({ status: 'approved' }).sort('eventDate');
  const userId = req.session.userId && req.session.userId.toString();
  const plainEvents = events.map(event => {
    const obj = event.toObject();
    obj.rsvpCount  = obj.rsvpUserIDs.length;
    obj.hasRSVPed  = userId ? obj.rsvpUserIDs.some(id => id.toString() === userId) : false;
    obj.isFull     = obj.rsvpCount >= obj.capacity;
    return obj;
  });
  res.render('events/index', { events: plainEvents, query: req.query });
};

exports.showEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  if (!ev || ev.status !== 'approved') return res.status(404).render('404');
  
  const plainEvent = ev.toObject();
  const userId = req.session.userId && req.session.userId.toString();
  plainEvent.hasRSVPed = userId ? plainEvent.rsvpUserIDs.some(id => id.toString() === userId) : false;
  
  res.render('events/show', { ev: plainEvent, query: req.query });
};

exports.mapView = async (req, res) => {
  try {
    const { keyword, category, tag, dateFrom, dateTo, location, sortBy } = req.query;
    const q = { status: 'approved' };
    
    if (keyword)  q.$text       = { $search: keyword };
    if (category) q.category    = category;
    if (tag)      q.tags        = tag;
    if (location) q.address     = new RegExp(location, 'i');
    if (dateFrom || dateTo) q.eventDate = {};
    if (dateFrom) q.eventDate.$gte = new Date(dateFrom);
    if (dateTo)   q.eventDate.$lte = new Date(dateTo);
    
    let sortOption = {};
    switch (sortBy) {
      case 'dateDesc':
        sortOption = { eventDate: -1 };
        break;
      case 'titleAsc':
        sortOption = { title: 1 };
        break;
      case 'dateAsc':
      default:
        sortOption = { eventDate: 1 };
        break;
    }
    
    const events = await Event.find(q)
                             .select('_id title address eventDate startTime description latitude longitude')
                             .sort(sortOption);

    const plainEvents = events.map(e => e.toObject());

    const mapData = plainEvents.map(e => ({
      _id: e._id,
      title: e.title,
      address: e.address,
      lat: e.latitude,
      lng: e.longitude
    }));
    
    console.log('Events for map & list view (filtered/sorted):', plainEvents.length);
    
    res.render('events/map', { 
      events: plainEvents,             
      mapDataJson: JSON.stringify(mapData), 
      googleApiKey: process.env.GOOGLE_PLACES_API_KEY,
      query: req.query
    });
  } catch (error) {
    console.error('Error fetching events for map:', error);
   
    res.render('events/map', { 
      events: [], 
      mapDataJson: '[]', 
      googleApiKey: process.env.GOOGLE_PLACES_API_KEY,
      query: req.query
    });
  }
};

exports.searchEvents = async (req, res) => {
  const { keyword, category, tag, dateFrom, dateTo, location, sortBy } = req.query;
  const q = { status: 'approved' };
  
  if (keyword)  q.$text       = { $search: keyword };
  if (category) q.category    = category;
  if (tag)      q.tags        = tag;
  if (location) q.address     = new RegExp(location, 'i');
  if (dateFrom || dateTo) q.eventDate = {};
  if (dateFrom) q.eventDate.$gte = new Date(dateFrom);
  if (dateTo)   q.eventDate.$lte = new Date(dateTo);
  
  let sortOption = {};
  switch (sortBy) {
    case 'dateDesc':
      sortOption = { eventDate: -1 };
      break;
    case 'titleAsc':
      sortOption = { title: 1 };
      break;
    case 'dateAsc':
    default:
      sortOption = { eventDate: 1 };
      break;
  }
  
  try {
    const events = await Event.find(q).sort(sortOption); 
    const plain = events.map(e => e.toObject());
    res.render('events/index', { events: plain, query: req.query }); 
  } catch (error) {
      console.error('Error searching events:', error);
      res.status(500).render('error', { message: 'Error performing search' });
  }
};

exports.newEventForm = (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  console.log('Google API Key from process.env:', process.env.GOOGLE_PLACES_API_KEY);
  res.render('events/new', {
    googleApiKey: process.env.GOOGLE_PLACES_API_KEY
  });
};

exports.createEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  
  try {
    console.log('Creating event with creator ID:', req.session.userId);
    
    const data = {
      creatorID:   req.session.userId,
      title:       xss(req.body.title),
      description: xss(req.body.description),
      address:     xss(req.body.address),
      formattedAddress: xss(req.body.formattedAddress),
      latitude:    parseFloat(req.body.latitude) || null,
      longitude:   parseFloat(req.body.longitude) || null,
      placeId:     xss(req.body.placeId) || null,
      eventDate:   new Date(`${req.body.eventDate}T00:00:00`),
      startTime:   req.body.startTime,
      endTime:     req.body.endTime,
      capacity:    parseInt(req.body.capacity, 10),
      category:    xss(req.body.category),
      tags:        req.body.tags ? req.body.tags.split(',').map(t => xss(t.trim())) : [],
      ticketLink:  xss(req.body.ticketLink || '')
    };

    const event = await Event.create(data);
    console.log('Created event with status:', event.status, {
      id: event._id,
      title: event.title,
      creatorID: event.creatorID,
      address: event.address,
      formattedAddress: event.formattedAddress,
      latitude: event.latitude,
      longitude: event.longitude,
      placeId: event.placeId
    });
    
    res.status(201).render('notifications/generic', {
        title: 'Event Submitted',
        message: 'Thank you for submitting your event! Our moderation team will review it shortly. You can check its status on your dashboard.',
        returnLink: '/dashboard'
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.render('events/new', { 
      error: 'Error creating event. Please make sure all required fields are filled out correctly.',
      formData: req.body
    });
  }
};

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

exports.rsvpEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const ev   = await Event.findById(req.params.id);
  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.redirect('/auth/login');
  }

  const now = new Date();
  const eventDateTime = new Date(`${ev.eventDate.toISOString().slice(0,10)}T${ev.startTime}`);
  if (eventDateTime < now)
    return res.redirect(`/events/${ev._id}?error=Event%20in%20the%20past`);
  if (ev.rsvpUserIDs.length >= ev.capacity)
    return res.redirect(`/events/${ev._id}?error=Event%20full`);
  if (ev.rsvpUserIDs.some(id => id.equals(req.session.userId)))
    return res.redirect(`/events/${ev._id}?error=Already%20RSVPd`);

  const existing = await Event.find({
    _id: { $in: user.rsvpedEvents.map(r => r.eventID) },
    status: 'approved'
  });
  const conflict = existing.some(e => {
    if (e.eventDate.toDateString() !== ev.eventDate.toDateString()) return false;
    const [sh, sm] = e.startTime.split(':').map(Number);
    const [eh, em] = e.endTime.split(':').map(Number);
    const [ns, nm] = ev.startTime.split(':').map(Number);
    const [ne, nm2] = ev.endTime.split(':').map(Number);
    const existingStart = new Date(e.eventDate); existingStart.setHours(sh, sm);
    const existingEnd   = new Date(e.eventDate); existingEnd.setHours(eh, em);
    const newStart      = new Date(ev.eventDate); newStart.setHours(ns, nm);
    const newEnd        = new Date(ev.eventDate); newEnd.setHours(ne, nm2);
    return newStart < existingEnd && newEnd > existingStart;
  });
  if (conflict)
    return res.redirect(`/events/${ev._id}?error=Overlapping%20event`);

  ev.rsvpUserIDs.push(req.session.userId);
  user.rsvpedEvents.push({
    eventID: ev._id,
    eventDate: ev.eventDate,
    rsvpTime: new Date()
  });
  await ev.save();
  await user.save();
  
  const msg = `${req.session.user.firstName} RSVP'd to your event "${ev.title}"`;
  const { createNotification } = require('./notificationController');
  await createNotification(ev.creatorID, 'eventReminder', ev._id, msg);
  
  res.redirect(`/events/${ev._id}?success=Successfully%20RSVPd`);
};

exports.bookmarkEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const user = await User.findById(req.session.userId);
  const id   = req.params.id;
  if (!user.bookmarkedEvents.some(id => id.equals(req.params.id))) {
    user.bookmarkedEvents.push(id);
    await user.save();
  }
  res.redirect(`/events/${id}`);
};

exports.deleteEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const ev = await Event.findById(req.params.id);
  if (!ev || !ev.creatorID.equals(req.session.userId)) return res.status(403).render('403');
  await Event.findByIdAndDelete(req.params.id);
  await Promise.all([
    EventEdit.deleteMany({ eventID: req.params.id }),
    Notification.deleteMany({ eventID: req.params.id }),
    ModerationLog.deleteMany({ eventID: req.params.id })
  ]);
  res.redirect('/dashboard');
};

exports.unrsvpEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const ev   = await Event.findById(req.params.id);
  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.redirect('/auth/login');
  }

  ev.rsvpUserIDs = ev.rsvpUserIDs.filter(id => !id.equals(req.session.userId));
  user.rsvpedEvents = user.rsvpedEvents.filter(r => !r.eventID.equals(req.params.id));
  await Promise.all([ev.save(), user.save()]);
  
  res.redirect(`/events/${ev._id}?success=Successfully%20cancelled%20RSVP`);
}; 