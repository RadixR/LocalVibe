const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const { ensureLoggedIn } = require('../middleware/auth');
const wrap = require('../utils/asyncWrapper');

// Event routes
router.get('/', wrap(ctrl.listEvents));
router.get('/map', wrap(ctrl.mapView));
router.get('/new', ensureLoggedIn, wrap(ctrl.newEventForm));
router.post('/', ensureLoggedIn, wrap(ctrl.createEvent));
router.get('/search', wrap(ctrl.searchEvents));
router.get('/:id', wrap(ctrl.showEvent));
router.post('/:id/rsvp', ensureLoggedIn, wrap(ctrl.rsvpEvent));
router.post('/:id/unrsvp', ensureLoggedIn, wrap(ctrl.unrsvpEvent));
router.get('/:id/edit', ensureLoggedIn, wrap(ctrl.editEventForm));
router.post('/:id/edit', ensureLoggedIn, wrap(ctrl.updateEvent));
router.post('/:id/comments', ensureLoggedIn, wrap(ctrl.addComment));
router.post('/:id/bookmark', ensureLoggedIn, wrap(ctrl.bookmarkEvent));
router.post('/:id/delete', ensureLoggedIn, wrap(ctrl.deleteEvent));

module.exports = router; 