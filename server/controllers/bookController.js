/**
 * Book Controller
 * Handles all book-related API requests
 * All operations scoped to authenticated user via req.user.id
 */

const Book = require('../models/Book');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * Get all books
 * GET /api/books
 */
exports.getAllBooks = asyncHandler(async (req, res, next) => {
  const { sortBy = 'date_added', order = 'DESC', genre, status, minRating } = req.query;
  const userId = req.user.id;

  const filters = {};
  if (genre) filters.genre = genre;
  if (status) filters.reading_status = status;
  if (minRating) filters.minRating = parseInt(minRating);

  const books = await Book.getAllBooks(userId, filters, sortBy, order);

  res.json({
    success: true,
    count: books.length,
    data: books
  });
});

/**
 * Get single book by ID
 * GET /api/books/:id
 */
exports.getBookById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const book = await Book.getBookById(id, userId);
  
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  res.json({
    success: true,
    data: book
  });
});

/**
 * Create new book
 * POST /api/books
 */
exports.createBook = asyncHandler(async (req, res, next) => {
  const bookData = req.body;
  const userId = req.user.id;

  const book = await Book.createBook(bookData, userId);

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: book
  });
});

/**
 * Update book
 * PUT /api/books/:id
 */
exports.updateBook = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bookData = req.body;
  const userId = req.user.id;

  const book = await Book.updateBook(id, bookData, userId);

  res.json({
    success: true,
    message: 'Book updated successfully',
    data: book
  });
});

/**
 * Delete book
 * DELETE /api/books/:id
 */
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const result = await Book.deleteBook(id, userId);

  res.json({
    success: true,
    message: result.message,
    id: parseInt(id)
  });
});

/**
 * Search books
 * GET /api/books/search/:query
 */
exports.searchBooks = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const userId = req.user.id;

  const books = await Book.searchBooks(query, userId);

  res.json({
    success: true,
    count: books.length,
    data: books
  });
});

/**
 * Get books by genre
 * GET /api/books/genre/:genre
 */
exports.getByGenre = asyncHandler(async (req, res, next) => {
  const { genre } = req.params;
  const userId = req.user.id;

  const books = await Book.getBooksByGenre(genre, userId);

  res.json({
    success: true,
    count: books.length,
    genre,
    data: books
  });
});

/**
 * Get books by reading status
 * GET /api/books/status/:status
 */
exports.getByStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.params;
  const userId = req.user.id;

  const books = await Book.getBooksByStatus(status, userId);

  res.json({
    success: true,
    count: books.length,
    status,
    data: books
  });
});

/**
 * Get reading statistics
 * GET /api/books/stats
 */
exports.getStatistics = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const stats = await Book.getStatistics(userId);

  res.json({
    success: true,
    data: stats
  });
});

/**
 * Get all genres
 * GET /api/books/genres
 */
exports.getAllGenres = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const genres = await Book.getAllGenres(userId);

  res.json({
    success: true,
    count: genres.length,
    data: genres
  });
});

/**
 * Toggle favorite
 * PUT /api/books/:id/favorite
 */
exports.toggleFavorite = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await Book.toggleFavorite(id, userId);

  res.json({
    success: true,
    message: result.message,
    id: parseInt(id)
  });
});