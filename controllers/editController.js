const xss       = require('xss');
const Event     = require('../models/Event');
const EventEdit = require('../models/EventEdit');

exports.getEditForm = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  if (!ev || !ev.creatorID.equals(req.session.userId)) return res.status(403).render('403');
  res.render('events/edit', { ev });
};

exports.postEdit = async (req, res) => {
  const ev = await Event.findById(req.params.id);
  if (!ev || !ev.creatorID.equals(req.session.userId)) return res.status(403).render('403');

  const prev = {
    title: ev.title,
    description: ev.description,
    address: ev.address,
    eventDate: ev.eventDate,
    startTime: ev.startTime,
    endTime: ev.endTime,
    capacity: ev.capacity,
    category: ev.category,
    tags: ev.tags,
    ticketLink: ev.ticketLink
  };
  const upd = {
    title: xss(req.body.title),
    description: xss(req.body.description),
    address: xss(req.body.address),
    eventDate: new Date(req.body.eventDate),
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    capacity: parseInt(req.body.capacity,10),
    category: xss(req.body.category),
    tags: req.body.tags.split(',').map(t=>xss(t.trim())),
    ticketLink: xss(req.body.ticketLink||'')
  };
  await EventEdit.create({ eventID: ev._id, previousData: prev, updatedData: upd });
  res.redirect('/events/'+ev._id+'?msg=Edit%20submitted%20for%20review');
}; 