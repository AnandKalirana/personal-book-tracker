const db = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * Get all available tags (for autocomplete)
 * GET /api/tags
 */
const getTags = asyncHandler(async (req, res, next) => {
  const [tags] = await db.promise().query('SELECT * FROM tags ORDER BY name ASC');
  res.status(200).json({ success: true, data: tags });
});

/**
 * Add tags to a book
 * POST /api/tags/book/:bookId
 */
const addTagsToBook = asyncHandler(async (req, res, next) => {
  const { bookId } = req.params;
  const { tags } = req.body; // Array of strings, e.g. ["dark", "emotional damage"]
  const userId = req.user.id;

  // Verify book belongs to user
  const [books] = await db.promise().query(
    'SELECT id FROM books WHERE id = ? AND user_id = ?',
    [bookId, userId]
  );

  if (books.length === 0) {
    return next(new AppError('Book not found', 404));
  }

  const connection = await db.promise().getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Process each tag: insert into tags table if it doesn't exist
    const tagIds = [];
    for (const tagName of tags) {
      const formattedName = tagName.trim().toLowerCase();
      if (!formattedName) continue;

      // Check if tag exists
      let [existingTag] = await connection.query(
        'SELECT id FROM tags WHERE name = ?',
        [formattedName]
      );

      let tagId;
      if (existingTag.length > 0) {
        tagId = existingTag[0].id;
      } else {
        // Insert new tag
        const [result] = await connection.query(
          'INSERT INTO tags (name) VALUES (?)',
          [formattedName]
        );
        tagId = result.insertId;
      }
      tagIds.push(tagId);
    }

    // 2. Remove all existing tags for this book
    await connection.query('DELETE FROM book_tags WHERE book_id = ?', [bookId]);

    // 3. Insert new tag relations
    if (tagIds.length > 0) {
      const values = tagIds.map(id => [bookId, id]);
      await connection.query(
        'INSERT IGNORE INTO book_tags (book_id, tag_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.status(200).json({ success: true, message: 'Tags updated successfully' });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

module.exports = {
  getTags,
  addTagsToBook
};

