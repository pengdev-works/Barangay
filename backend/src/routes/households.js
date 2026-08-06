const express = require('express');
const router = express.Router();
const { getHouseholds, getHouseholdById, createHousehold, updateHousehold, addMember, removeMember } = require('../controllers/householdController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');

router.get('/', authenticate, authorizeMinRole('Barangay Staff'), getHouseholds);
router.get('/:id', authenticate, authorizeMinRole('Barangay Staff'), getHouseholdById);
router.post('/', authenticate, authorizeMinRole('Barangay Staff'), createHousehold);
router.put('/:id', authenticate, authorizeMinRole('Barangay Staff'), updateHousehold);
router.post('/:id/members', authenticate, authorizeMinRole('Barangay Staff'), addMember);
router.delete('/:id/members/:residentId', authenticate, authorizeMinRole('Barangay Staff'), removeMember);

module.exports = router;
