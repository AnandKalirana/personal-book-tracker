/**
 * API Routes
 * External API integration endpoints
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { googleBooksSearchValidator, isbnValidator, validate } = require('../validators/apiValidator');

/**
 * Google Books Search Routes
 */

// General search
router.get('/google-books', googleBooksSearchValidator, validate, apiController.searchGoogleBooks);

// Search by title
router.get('/google-books/title/:title', apiController.searchByTitle);

// Search by author
router.get('/google-books/author/:author', apiController.searchByAuthor);

// Search by ISBN
router.get('/google-books/isbn/:isbn', isbnValidator, validate, apiController.searchByISBN);

// Get book details
router.get('/google-books/:bookId', apiController.getGoogleBookDetails);

// Advanced search
router.get('/advanced', apiController.advancedSearch);

module.exports = router;