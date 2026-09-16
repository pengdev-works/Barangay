const express = require('express');
const router = express.Router();
const { getStats, getCharts } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');

router.get('/stats', authenticate, getStats);
router.get('/charts', authenticate, getCharts);

module.exports = router;
