const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate, updateCertificateStatus, deleteCertificate } = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole, authorize } = require('../middleware/rbac');

router.get('/', authenticate, authorizeMinRole('Barangay Staff'), getCertificates);
router.post('/', authenticate, authorizeMinRole('Barangay Staff'), createCertificate);
router.put('/:id/status', authenticate, authorizeMinRole('Barangay Staff'), updateCertificateStatus);
router.delete('/:id', authenticate, authorize('Super Admin'), deleteCertificate);

module.exports = router;
