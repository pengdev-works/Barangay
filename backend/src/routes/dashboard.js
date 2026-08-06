const express = require('express');
const router = express.Router();
const { getStats, getCharts } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');

router.get('/stats', authenticate, authorizeMinRole('Barangay Staff'), getStats);
router.get('/charts', authenticate, authorizeMinRole('Barangay Staff'), getCharts);

module.exports = router;
