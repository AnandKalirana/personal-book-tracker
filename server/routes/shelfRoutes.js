const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const shelfController = require('../controllers/shelfController');
const { createShelfValidator, updateShelfValidator, validate } = require('../validators/shelfValidator');

router.use(authenticate);

router.route('/')
  .get(shelfController.getShelves)
  .post(createShelfValidator, validate, shelfController.createShelf);

router.route('/:id')
  .put(updateShelfValidator, validate, shelfController.updateShelf)
  .delete(shelfController.deleteShelf);

router.route('/:id/books')
  .post(shelfController.addBookToShelf);

router.route('/:id/books/:bookId')
  .delete(shelfController.removeBookFromShelf);

module.exports = router;

