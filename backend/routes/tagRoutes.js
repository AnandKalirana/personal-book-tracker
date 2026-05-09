const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const tagController = require('../controllers/tagController');
const { tagValidator, validate } = require('../validators/tagValidator');

router.use(authenticate);

router.route('/')
  .get(tagController.getTags);

router.route('/book/:bookId')
  .post(tagValidator, validate, tagController.addTagsToBook);

module.exports = router;

