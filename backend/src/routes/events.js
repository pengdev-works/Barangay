const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent, rsvpEvent, getEventAttendees } = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.get('/', authenticate, getEvents);
router.post('/', authenticate, authorizeMinRole('Barangay Staff'), upload.single('image'), createEvent);
router.put('/:id', authenticate, authorizeMinRole('Barangay Staff'), updateEvent);
router.delete('/:id', authenticate, authorizeMinRole('Barangay Captain'), deleteEvent);
router.post('/:id/rsvp', authenticate, rsvpEvent);
router.get('/:id/attendees', authenticate, authorizeMinRole('Barangay Staff'), getEventAttendees);

module.exports = router;
