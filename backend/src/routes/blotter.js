const express = require('express');
const router = express.Router();
const { getBlotter, getBlotterById, createBlotter, updateBlotter, deleteBlotter } = require('../controllers/blotterController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');

router.get('/', authenticate, authorizeMinRole('Barangay Staff'), getBlotter);
router.get('/:id', authenticate, authorizeMinRole('Barangay Staff'), getBlotterById);
router.post('/', authenticate, authorizeMinRole('Barangay Staff'), createBlotter);
router.put('/:id', authenticate, authorizeMinRole('Barangay Staff'), updateBlotter);
router.delete('/:id', authenticate, authorizeMinRole('Barangay Captain'), deleteBlotter);

module.exports = router;
