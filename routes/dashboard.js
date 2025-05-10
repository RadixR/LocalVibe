const express = require('express');
const router  = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { dashboard }      = require('../controllers/dashboardController');

router.get('/', ensureLoggedIn, dashboard);
module.exports = router; 