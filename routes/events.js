const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/eventController');

router.get('/map',     ctrl.mapView);
router.get('/new',     ctrl.newEventForm);
router.get('/:id',     ctrl.showEvent);
router.get('/',        ctrl.listEvents);
router.post('/',       ctrl.createEvent);

module.exports = router; 