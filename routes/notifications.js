const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { ensureLoggedIn } = require('../middleware/auth');

router.get('/', ensureLoggedIn, ctrl.getNotifications);

router.post('/:id/delete',    ensureLoggedIn, ctrl.deleteNotification);
router.post('/delete-all',    ensureLoggedIn, ctrl.deleteAllNotifications);

router.get('/:id/delete',     ensureLoggedIn, ctrl.deleteNotification);
router.get('/delete-all',     ensureLoggedIn, ctrl.deleteAllNotifications);

module.exports = router; 