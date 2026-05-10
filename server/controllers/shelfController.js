const db = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * Create a new shelf
 * POST /api/shelves
 */
const createShelf = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await db.promise().query(
      'INSERT INTO shelves (user_id, name) VALUES (?, ?)',
      [userId, name]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, name, user_id: userId },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return next(new AppError('Shelf with this name already exists', 400));
    }
    next(err);
  }
});

/**
 * Get all shelves for the logged-in user
 * GET /api/shelves
 */
const getShelves = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const [shelves] = await db.promise().query(
    'SELECT * FROM shelves WHERE user_id = ? ORDER BY name ASC',
    [userId]
  );

  res.status(200).json({ success: true, data: shelves });
});

/**
 * Update shelf name
 * PUT /api/shelves/:id
 */
const updateShelf = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const shelfId = req.params.id;
  const userId = req.user.id;

  const [result] = await db.promise().query(
    'UPDATE shelves SET name = ? WHERE id = ? AND user_id = ?',
    [name, shelfId, userId]
  );

  if (result.affectedRows === 0) {
    return next(new AppError('Shelf not found or not authorized', 404));
  }

  res.status(200).json({ success: true, data: { id: shelfId, name } });
});

/**
 * Delete a shelf
 * DELETE /api/shelves/:id
 */
const deleteShelf = asyncHandler(async (req, res, next) => {
  const shelfId = req.params.id;
  const userId = req.user.id;

  const [result] = await db.promise().query(
    'DELETE FROM shelves WHERE id = ? AND user_id = ?',
    [shelfId, userId]
  );

  if (result.affectedRows === 0) {
    return next(new AppError('Shelf not found or not authorized', 404));
  }

  res.status(200).json({ success: true, data: {} });
});

/**
 * Add book to shelf
 * POST /api/shelves/:id/books
 */
const addBookToShelf = asyncHandler(async (req, res, next) => {
  const shelfId = req.params.id;
  const { bookId } = req.body;
  const userId = req.user.id;

  if (!bookId) return next(new AppError('Book ID is required', 400));

  // Verify shelf belongs to user
  const [shelves] = await db.promise().query(
    'SELECT id FROM shelves WHERE id = ? AND user_id = ?',
    [shelfId, userId]
  );

  if (shelves.length === 0) {
    return next(new AppError('Shelf not found', 404));
  }

  // Verify book belongs to user
  const [books] = await db.promise().query(
    'SELECT id FROM books WHERE id = ? AND user_id = ?',
    [bookId, userId]
  );

  if (books.length === 0) {
    return next(new AppError('Book not found', 404));
  }

  await db.promise().query(
    'INSERT IGNORE INTO book_shelves (book_id, shelf_id) VALUES (?, ?)',
    [bookId, shelfId]
  );

  res.status(200).json({ success: true, message: 'Book added to shelf' });
});

/**
 * Remove book from shelf
 * DELETE /api/shelves/:id/books/:bookId
 */
const removeBookFromShelf = asyncHandler(async (req, res, next) => {
  const { id: shelfId, bookId } = req.params;
  const userId = req.user.id;

  // Verify shelf belongs to user
  const [shelves] = await db.promise().query(
    'SELECT id FROM shelves WHERE id = ? AND user_id = ?',
    [shelfId, userId]
  );

  if (shelves.length === 0) {
    return next(new AppError('Shelf not found', 404));
  }

  await db.promise().query(
    'DELETE FROM book_shelves WHERE book_id = ? AND shelf_id = ?',
    [bookId, shelfId]
  );

  res.status(200).json({ success: true, message: 'Book removed from shelf' });
});

module.exports = {
  createShelf,
  getShelves,
  updateShelf,
  deleteShelf,
  addBookToShelf,
  removeBookFromShelf
};

