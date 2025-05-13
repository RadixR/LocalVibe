const express = require('express');
const router  = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const ctrl    = require('../controllers/adminController');

router.get('/events/pending', ensureAdmin, ctrl.pendingEvents);
router.post('/events/:id/approve', ensureAdmin, ctrl.approveEvent);
router.post('/events/:id/reject',  ensureAdmin, ctrl.rejectEvent);
router.post('/events/:id/request-changes', ensureAdmin, ctrl.requestChanges);

module.exports = router; 