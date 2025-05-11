const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { ensureLoggedIn } = require('../middleware/auth');

router.get('/', ensureLoggedIn, ctrl.getNotifications);
router.post('/:id/mark-read', ensureLoggedIn, ctrl.markAsRead);
router.post('/mark-all-read', ensureLoggedIn, ctrl.markAllAsRead);

module.exports = router; 