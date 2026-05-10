const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, uploadImage } = require('../controllers/uploadController');

// All upload routes require authentication
router.use(authenticate);

// POST /api/upload
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
