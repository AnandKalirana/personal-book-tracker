/**
 * Book Routes
 * API endpoints for book management
 */

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { createBookValidator, updateBookValidator, validate } = require('../validators/bookValidator');

/**
 * Statistics endpoint
 */
router.get('/stats', bookController.getStatistics);
router.get('/genres', bookController.getAllGenres);

/**
 * Search endpoint
 */
router.get('/search/:query', bookController.searchBooks);

/**
 * Genre endpoint
 */
router.get('/genre/:genre', bookController.getByGenre);

/**
 * Status endpoint
 */
router.get('/status/:status', bookController.getByStatus);

/**
 * Main CRUD endpoints
 */
router.get('/', bookController.getAllBooks);

router.post('/', createBookValidator, validate, bookController.createBook);

router.get('/:id', bookController.getBookById);

router.put('/:id', updateBookValidator, validate, bookController.updateBook);

router.delete('/:id', bookController.deleteBook);

router.put('/:id/favorite', bookController.toggleFavorite);

module.exports = router;