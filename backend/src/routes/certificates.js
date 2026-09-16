const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate, updateCertificateStatus, deleteCertificate, getCertificateById } = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole, authorize } = require('../middleware/rbac');

router.get('/verify/:id', getCertificateById);
router.get('/', authenticate, getCertificates);
router.post('/', authenticate, createCertificate);
router.put('/:id/status', authenticate, authorizeMinRole('Barangay Staff'), updateCertificateStatus);
router.delete('/:id', authenticate, authorize('Super Admin'), deleteCertificate);

module.exports = router;

