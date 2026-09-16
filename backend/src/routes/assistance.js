const express = require('express');
const router = express.Router();
const { getAssistance, createAssistance, updateAssistanceStatus } = require('../controllers/assistanceController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.get('/', authenticate, getAssistance);
router.post('/', authenticate, upload.array('documents', 5), createAssistance);
router.put('/:id/status', authenticate, authorizeMinRole('Barangay Captain'), updateAssistanceStatus);

module.exports = router;
