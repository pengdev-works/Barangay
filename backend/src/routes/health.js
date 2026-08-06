const express = require('express');
const router = express.Router();
const { getHealthRecords, getHealthSummary, createHealthRecord, updateHealthRecord } = require('../controllers/healthController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');

router.get('/', authenticate, authorizeMinRole('Barangay Staff'), getHealthRecords);
router.get('/summary', authenticate, authorizeMinRole('Barangay Staff'), getHealthSummary);
router.post('/', authenticate, authorizeMinRole('Barangay Staff'), createHealthRecord);
router.put('/:id', authenticate, authorizeMinRole('Barangay Staff'), updateHealthRecord);

module.exports = router;
