const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const submitReportCallback = reportController.submitReport;
const { ensureLoggedIn } = require('../middleware/auth');

// console.log('Type of reportController:', typeof reportController);
// console.log('reportController contents:', reportController);
// console.log('reportController.submitReport type:', typeof reportController.submitReport);
// console.log('submitReportCallback type:', typeof submitReportCallback);

router.post('/', ensureLoggedIn, submitReportCallback);

module.exports = router;