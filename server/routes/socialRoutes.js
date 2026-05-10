/**
 * Social Routes
 * /api/social endpoints
 */

const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { userSearchValidator, validate } = require('../validators/socialValidator');

// All social routes are public for viewing profiles
router.get('/search', userSearchValidator, validate, socialController.searchUsers);
router.get('/profile/:username', socialController.getPublicProfile);

module.exports = router;

