const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaintStatus, deleteComplaint } = require('../controllers/complaintController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole, authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.get('/', authenticate, authorizeMinRole('Barangay Staff'), getComplaints);
router.post('/', authenticate, authorizeMinRole('Resident'), upload.array('evidence', 5), createComplaint);
router.put('/:id/status', authenticate, authorizeMinRole('Barangay Staff'), updateComplaintStatus);
router.delete('/:id', authenticate, authorize('Super Admin', 'Barangay Captain'), deleteComplaint);

module.exports = router;
