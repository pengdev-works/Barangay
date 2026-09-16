const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadSingleFile } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, upload.single('file'), uploadSingleFile);

module.exports = router;
