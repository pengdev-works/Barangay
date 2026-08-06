const express = require('express');
const router = express.Router();
const { getResidents, getResidentById, createResident, updateResident, deleteResident } = require('../controllers/residentController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole, authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.get('/', authenticate, authorizeMinRole('Barangay Staff'), getResidents);
router.get('/:id', authenticate, authorizeMinRole('Barangay Staff'), getResidentById);
router.post('/', authenticate, authorizeMinRole('Barangay Staff'), upload.single('profile_picture'), createResident);
router.put('/:id', authenticate, authorizeMinRole('Barangay Staff'), upload.single('profile_picture'), updateResident);
router.delete('/:id', authenticate, authorize('Super Admin', 'Barangay Captain'), deleteResident);

module.exports = router;
