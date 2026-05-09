/**
 * Book Model
 * Database operations for books collection
 * All queries filter by user_id for multi-user support
 */

const db = require('../config/database');

class Book {
  /**
   * Get all books with optional filtering and sorting
   */
  static getAllBooks(userId, filters = {}, sortBy = 'date_added', order = 'DESC') {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT b.*, 
        (SELECT GROUP_CONCAT(t.name) FROM book_tags bt JOIN tags t ON bt.tag_id = t.id WHERE bt.book_id = b.id) as tags,
        (SELECT GROUP_CONCAT(CONCAT(s.id, '::', s.name) SEPARATOR '||') FROM book_shelves bs JOIN shelves s ON bs.shelf_id = s.id WHERE bs.book_id = b.id) as shelves
        FROM books b 
        WHERE b.user_id = ?
      `;
      const params = [userId];

      // Filtering
      if (filters.genre) {
        query += ' AND b.genre = ?';
        params.push(filters.genre);
      }

      if (filters.reading_status) {
        query += ' AND b.reading_status = ?';
        params.push(filters.reading_status);
      }

      if (filters.is_favorite !== undefined) {
        query += ' AND b.is_favorite = ?';
        params.push(filters.is_favorite ? 1 : 0);
      }

      if (filters.minRating) {
        query += ' AND b.rating >= ?';
        params.push(filters.minRating);
      }

      if (filters.shelf_id) {
        query += ' AND EXISTS (SELECT 1 FROM book_shelves bs WHERE bs.book_id = b.id AND bs.shelf_id = ?)';
        params.push(filters.shelf_id);
      }

      if (filters.tag) {
        query += ' AND EXISTS (SELECT 1 FROM book_tags bt JOIN tags t ON bt.tag_id = t.id WHERE bt.book_id = b.id AND t.name = ?)';
        params.push(filters.tag);
      }

      // Sorting
      const validSortFields = ['title', 'author', 'date_completed', 'rating', 'date_added'];
      const validOrders = ['ASC', 'DESC'];
      
      if (validSortFields.includes(sortBy) && validOrders.includes(order)) {
        query += ` ORDER BY b.${sortBy} ${order}`;
      } else {
        query += ' ORDER BY b.date_added DESC';
      }

      db.query(query, params, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  static getBookById(id, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, 
        (SELECT GROUP_CONCAT(t.name) FROM book_tags bt JOIN tags t ON bt.tag_id = t.id WHERE bt.book_id = b.id) as tags,
        (SELECT GROUP_CONCAT(CONCAT(s.id, '::', s.name) SEPARATOR '||') FROM book_shelves bs JOIN shelves s ON bs.shelf_id = s.id WHERE bs.book_id = b.id) as shelves
        FROM books b 
        WHERE b.id = ? AND b.user_id = ?
      `;
      
      db.query(query, [id, userId], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] || null);
      });
    });
  }

  /**
   * Create a new book
   */
  static createBook(bookData, userId) {
    return new Promise((resolve, reject) => {
      const {
        title,
        author,
        description,
        cover_image_url,
        date_completed,
        rating,
        genre,
        reading_status = 'Wishlist',
        google_books_id,
        isbn,
        page_count,
        published_date,
        notes
      } = bookData;

      const query = `
        INSERT INTO books (
          title, author, description, cover_image_url,
          date_completed, rating, genre, reading_status,
          google_books_id, isbn, page_count, published_date, notes, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        title,
        author,
        description || null,
        cover_image_url || null,
        date_completed || null,
        rating || null,
        genre || null,
        reading_status,
        google_books_id || null,
        isbn || null,
        page_count || null,
        published_date || null,
        notes || null,
        userId
      ];

      db.query(query, values, (error, results) => {
        if (error) return reject(error);
        resolve({
          id: results.insertId,
          ...bookData,
          user_id: userId
        });
      });
    });
  }

  /**
   * Update a book
   */
  static updateBook(id, bookData, userId) {
    return new Promise((resolve, reject) => {
      // Build dynamic UPDATE query based on provided fields
      const allowedFields = [
        'title', 'author', 'description', 'cover_image_url',
        'date_completed', 'rating', 'genre', 'reading_status',
        'isbn', 'page_count', 'notes', 'is_favorite'
      ];

      const updateFields = [];
      const values = [];

      Object.keys(bookData).forEach(key => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          values.push(bookData[key]);
        }
      });

      if (updateFields.length === 0) {
        return reject(new Error('No valid fields to update'));
      }

      values.push(id, userId);

      const query = `
        UPDATE books 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

      db.query(query, values, (error, results) => {
        if (error) return reject(error);
        if (results.affectedRows === 0) {
          return reject(new Error('Book not found'));
        }
        resolve({ id, ...bookData });
      });
    });
  }

  /**
   * Delete a book
   */
  static deleteBook(id, userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM books WHERE id = ? AND user_id = ?';
      
      db.query(query, [id, userId], (error, results) => {
        if (error) return reject(error);
        if (results.affectedRows === 0) {
          return reject(new Error('Book not found'));
        }
        resolve({ message: 'Book deleted successfully', id });
      });
    });
  }

  /**
   * Search books by title or author
   */
  static searchBooks(query, userId) {
    return new Promise((resolve, reject) => {
      const searchQuery = `
        SELECT * FROM books
        WHERE user_id = ? AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ?)
        ORDER BY date_added DESC
      `;

      const searchTerm = `%${query.toLowerCase()}%`;
      
      db.query(searchQuery, [userId, searchTerm, searchTerm], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  /**
   * Get books by genre
   */
  static getBooksByGenre(genre, userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM books WHERE genre = ? AND user_id = ? ORDER BY title ASC';
      
      db.query(query, [genre, userId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  /**
   * Get books by reading status
   */
  static getBooksByStatus(status, userId) {
    return new Promise((resolve, reject) => {
      const validStatuses = ['Reading', 'Completed', 'Wishlist'];
      if (!validStatuses.includes(status)) {
        return reject(new Error('Invalid reading status'));
      }

      const query = 'SELECT * FROM books WHERE reading_status = ? AND user_id = ? ORDER BY date_added DESC';
      
      db.query(query, [status, userId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  /**
   * Get reading statistics with chart data
   */
  static getStatistics(userId) {
    return new Promise((resolve, reject) => {
      // Main stats query
      const statsQuery = `
        SELECT
          COUNT(*) as total_books,
          COUNT(CASE WHEN reading_status = 'Completed' THEN 1 END) as books_completed,
          COUNT(CASE WHEN reading_status = 'Reading' THEN 1 END) as books_reading,
          COUNT(CASE WHEN reading_status = 'Wishlist' THEN 1 END) as books_wishlist,
          AVG(rating) as average_rating,
          COUNT(DISTINCT genre) as total_genres,
          COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorite_count,
          SUM(COALESCE(page_count, 0)) as total_pages_read
        FROM books
        WHERE user_id = ?
      `;

      // Monthly trends query
      const trendsQuery = `
        SELECT 
          MONTHNAME(date_completed) as month,
          COUNT(*) as count
        FROM books
        WHERE user_id = ? 
          AND reading_status = 'Completed' 
          AND date_completed >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY MONTH(date_completed), MONTHNAME(date_completed)
        ORDER BY MONTH(date_completed)
      `;

      // Genre distribution query
      const genreQuery = `
        SELECT genre, COUNT(*) as count
        FROM books
        WHERE user_id = ? AND genre IS NOT NULL AND genre != ''
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 5
      `;
      
      db.query(statsQuery, [userId], (error, statsResults) => {
        if (error) return reject(error);
        
        db.query(trendsQuery, [userId], (error, trendsResults) => {
          if (error) return reject(error);

          db.query(genreQuery, [userId], (error, genreResults) => {
            if (error) return reject(error);

            resolve({
              ...statsResults[0],
              trends: trendsResults,
              genres: genreResults
            });
          });
        });
      });
    });
  }

  /**
   * Get all genres
   */
  static getAllGenres(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT genre FROM books 
        WHERE genre IS NOT NULL AND genre != '' AND user_id = ?
        ORDER BY genre ASC
      `;
      
      db.query(query, [userId], (error, results) => {
        if (error) return reject(error);
        resolve(results.map(row => row.genre));
      });
    });
  }

  /**
   * Toggle favorite status
   */
  static toggleFavorite(id, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE books 
        SET is_favorite = !is_favorite, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;
      
      db.query(query, [id, userId], (error, results) => {
        if (error) return reject(error);
        if (results.affectedRows === 0) {
          return reject(new Error('Book not found'));
        }
        resolve({ message: 'Favorite status toggled', id });
      });
    });
  }
  /**
   * Get public books for a specific user
   */
  static getPublicBooks(username) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, u.username as owner_name,
        (SELECT GROUP_CONCAT(t.name) FROM book_tags bt JOIN tags t ON bt.tag_id = t.id WHERE bt.book_id = b.id) as tags,
        (SELECT GROUP_CONCAT(CONCAT(s.id, '::', s.name) SEPARATOR '||') FROM book_shelves bs JOIN shelves s ON bs.shelf_id = s.id WHERE bs.book_id = b.id) as shelves
        FROM books b
        JOIN users u ON b.user_id = u.id
        WHERE u.username = ? AND u.is_public = 1
        ORDER BY b.created_at DESC
      `;
      db.query(query, [username], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }
}

module.exports = Book;