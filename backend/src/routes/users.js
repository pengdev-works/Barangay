const express = require('express');
const router = express.Router();
const { getUsers, createUser, toggleUserStatus } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Only Super Admin can manage user accounts
router.use(authenticate);
router.use(authorize('Super Admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
