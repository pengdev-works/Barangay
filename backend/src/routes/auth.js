const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);

module.exports = router;
