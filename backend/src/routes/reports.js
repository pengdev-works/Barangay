const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');

router.get('/', authenticate, authorizeMinRole('Barangay Captain'), getReports);

module.exports = router;
