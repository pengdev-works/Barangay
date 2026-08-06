const express = require('express');
const router = express.Router();
const { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement, likeAnnouncement, addComment } = require('../controllers/announcementController');
const { authenticate } = require('../middleware/auth');
const { authorizeMinRole } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.get('/', authenticate, getAnnouncements);
router.get('/:id', authenticate, getAnnouncementById);
router.post('/', authenticate, authorizeMinRole('Barangay Staff'), upload.array('images', 5), createAnnouncement);
router.put('/:id', authenticate, authorizeMinRole('Barangay Staff'), updateAnnouncement);
router.delete('/:id', authenticate, authorizeMinRole('Barangay Captain'), deleteAnnouncement);
router.post('/:id/like', authenticate, likeAnnouncement);
router.post('/:id/comments', authenticate, addComment);

module.exports = router;
