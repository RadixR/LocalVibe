const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const { ensureLoggedIn } = require('../middleware/auth');

// Event routes
router.get('/', ctrl.listEvents);
router.get('/map', ctrl.mapView);
router.get('/new', ensureLoggedIn, ctrl.newEventForm);
router.post('/', ensureLoggedIn, ctrl.createEvent);
router.get('/search', ctrl.searchEvents);
router.get('/:id', ctrl.showEvent);
router.post('/:id/comments', ensureLoggedIn, ctrl.addComment);
router.post('/:id/rsvp', ensureLoggedIn, ctrl.rsvpEvent);
router.post('/:id/bookmark', ensureLoggedIn, ctrl.bookmarkEvent);

module.exports = router; 