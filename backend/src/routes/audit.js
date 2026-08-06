const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', authenticate, authorize('Super Admin'), getAuditLogs);

module.exports = router;
