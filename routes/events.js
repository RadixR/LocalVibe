const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/eventController');

router.get('/search',             ctrl.searchEvents);
router.get('/map',                ctrl.mapView);
router.get('/new',                ctrl.newEventForm);
router.get('/:id',                ctrl.showEvent);
router.get('/',                   ctrl.listEvents);

router.post('/:id/comments',      ctrl.addComment);
router.post('/:id/rsvp',          ctrl.rsvpEvent);
router.post('/:id/bookmark',      ctrl.bookmarkEvent);
router.post('/',                  ctrl.createEvent);

module.exports = router; 