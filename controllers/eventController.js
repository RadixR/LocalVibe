const xss   = require('xss');
const Event = require('../models/Event');

exports.listEvents = async (req, res) => {
  const events = await Event.find({ status: 'approved' }).sort('eventDate');
  res.render('events/index', { events });
};

exports.showEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  if (!ev || ev.status !== 'approved') return res.sendStatus(404);
  res.render('events/show', { ev });
};

exports.mapView = async (req, res) => {
  const events = await Event.find({ status: 'approved' });
  const data = events.map(e => ({
    _id:    e._id,
    title:  e.title,
    address:e.address
  }));
  res.render('events/map', { events: JSON.stringify(data) });
};

exports.newEventForm = (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('events/new');
};

exports.createEvent = async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  const data = {
    creatorID:   req.session.userId,
    title:       xss(req.body.title),
    description: xss(req.body.description),
    address:     xss(req.body.address),
    eventDate:   req.body.eventDate,
    startTime:   req.body.startTime,
    endTime:     req.body.endTime,
    capacity:    parseInt(req.body.capacity, 10),
    category:    xss(req.body.category),
    tags:        req.body.tags.split(',').map(t => xss(t.trim())),
    ticketLink:  xss(req.body.ticketLink||'')
  };
  await Event.create(data);
  res.redirect('/events');
}; 