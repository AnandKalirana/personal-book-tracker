/**
 * API Controller
 * Handles external API integrations (Google Books API)
 * Scoped to follow stable version logic
 */

const googleBooksService = require('../services/googleBooksService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Search Google Books API
 * GET /api/search/google-books?query=...&maxResults=10
 */
exports.searchGoogleBooks = asyncHandler(async (req, res) => {
  const { query, maxResults = 10 } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
      error: 'Please provide a query parameter'
    });
  }

  const result = await googleBooksService.searchBooks(
    query.trim(),
    parseInt(maxResults)
  );

  if (!result.success) {
    return res.status(result.message === 'Too many requests. Please wait a few seconds.' ? 429 : 500).json({
      success: false,
      message: result.message || 'Failed to search Google Books API',
      data: []
    });
  }

  res.json({
    success: true,
    source: 'Google Books API',
    query: query.trim(),
    total_results: result.total,
    returned_results: result.books.length,
    data: result.books
  });
});

/**
 * Search Google Books by title
 * GET /api/search/google-books/title/:title
 */
exports.searchByTitle = asyncHandler(async (req, res) => {
  const { title } = req.params;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }

  const result = await googleBooksService.searchByTitle(title.trim());

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.message || 'Failed to search by title',
      data: []
    });
  }

  res.json({
    success: true,
    search_type: 'title',
    query: title.trim(),
    total_results: result.total,
    returned_results: result.books.length,
    data: result.books
  });
});

/**
 * Search Google Books by author
 * GET /api/search/google-books/author/:author
 */
exports.searchByAuthor = asyncHandler(async (req, res) => {
  const { author } = req.params;

  if (!author || author.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Author name is required'
    });
  }

  const result = await googleBooksService.searchByAuthor(author.trim());

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.message || 'Failed to search by author',
      data: []
    });
  }

  res.json({
    success: true,
    search_type: 'author',
    query: author.trim(),
    total_results: result.total,
    returned_results: result.books.length,
    data: result.books
  });
});

/**
 * Search Google Books by ISBN
 * GET /api/search/google-books/isbn/:isbn
 */
exports.searchByISBN = asyncHandler(async (req, res) => {
  const { isbn } = req.params;

  if (!isbn || isbn.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'ISBN is required'
    });
  }

  const result = await googleBooksService.searchByISBN(isbn.trim());

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.message || 'Failed to search by ISBN',
      data: []
    });
  }

  res.json({
    success: true,
    search_type: 'isbn',
    query: isbn.trim(),
    total_results: result.total,
    returned_results: result.books.length,
    data: result.books
  });
});

/**
 * Get book details from Google Books
 * GET /api/search/google-books/:bookId
 */
exports.getGoogleBookDetails = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  if (!bookId || bookId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Book ID is required'
    });
  }

  const result = await googleBooksService.getBookById(bookId.trim());

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.message || 'Failed to fetch book details'
    });
  }

  res.json({
    success: true,
    data: result.book
  });
});

/**
 * Advanced search with filters
 * GET /api/search/advanced?title=...&author=...&publisher=...&maxResults=10
 */
exports.advancedSearch = asyncHandler(async (req, res) => {
  const { title, author, publisher, subject, maxResults = 10 } = req.query;

  if (!title && !author && !publisher && !subject) {
    return res.status(400).json({
      success: false,
      message: 'At least one search filter is required',
      example: '?title=Harry Potter&author=J.K. Rowling'
    });
  }

  const result = await googleBooksService.advancedSearch({
    title,
    author,
    publisher,
    subject,
    maxResults: parseInt(maxResults)
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message || 'Advanced search failed',
      data: []
    });
  }

  res.json({
    success: true,
    search_type: 'advanced',
    filters: {
      title: title || null,
      author: author || null,
      publisher: publisher || null,
      subject: subject || null
    },
    total_results: result.total,
    returned_results: result.books.length,
    data: result.books
  });
});