// console.log('--- controllers/reportController.js started loading ---');
const EventReport = require('../models/EventReport');
// console.log('--- controllers/reportController.js: EventReport loaded ---'); 
const Event = require('../models/Event');
// console.log('--- controllers/reportController.js: Event loaded ---');


const submitReport = async (req, res) => {
  try {
    const { eventId, reason, details } = req.body;
    const reporterUserId = req.session.user._id;

    if (!eventId || !reason) {
      return res.status(400).render('error', { message: 'Event ID and reason are required to submit a report.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render('error', { message: 'Event not found.' });
    }

    const newReport = await EventReport.create({
      eventId,
      reporterUserId,
      reason,
      details: details || ''
    });

    console.log(`Report submitted for event ${eventId} by user ${reporterUserId}`);
    res.status(201).render('notifications/generic', {
        title: 'Report Submitted',
        message: 'Thank you for your report. Our moderation team will review it shortly.',
        returnLink: `/events/${eventId}`
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).render('error', { message: 'Server error while submitting report.' });
  }
};
const getReportsForAdmin = async (req, res) => {
    try {
        const reports = await EventReport.find().populate('eventId', 'title').populate('reporterUserId', 'email firstName lastName').sort({ timestamp: -1 });
        res.render('admin/view-reports', { 
            title: 'View Event Reports',
            reports: reports,
            layout: 'main'
        });
    } catch (error) {
        console.error('Error fetching reports for admin:', error);
        res.status(500).render('error', { message: 'Failed to fetch reports.' });
    }
};

module.exports = {
    submitReport,
    getReportsForAdmin
}; 