/**
 * BookCache Model - Data access for book_cache table
 * Supports FULLTEXT search, fuzzy fallback, upsert with dedup
 */
const db = require('../config/database');

class BookCache {
  static search(query, limit = 20) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT *, MATCH(title, author, description, genres) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance,
          CASE WHEN source = 'preloaded' THEN 100 ELSE 0 END AS source_boost
        FROM book_cache
        WHERE MATCH(title, author, description, genres) AGAINST(? IN NATURAL LANGUAGE MODE)
        ORDER BY source_boost DESC, relevance DESC, quality_score DESC, search_count DESC
        LIMIT ?
      `;
      db.query(sql, [query, query, limit], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static fuzzySearch(query, limit = 20) {
    return new Promise((resolve, reject) => {
      const like = `%${query.toLowerCase()}%`;
      const sql = `
        SELECT *, CASE WHEN source = 'preloaded' THEN 100 ELSE 0 END AS source_boost
        FROM book_cache
        WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(genres) LIKE ?
        ORDER BY source_boost DESC, quality_score DESC, search_count DESC
        LIMIT ?
      `;
      db.query(sql, [like, like, like, limit], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static findByISBN(isbn) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM book_cache WHERE isbn = ?', [isbn], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  static findByTitleAuthor(title, author) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM book_cache WHERE title = ? AND author = ?', [title, author], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  static async upsert(bookData) {
    let existing = null;
    if (bookData.isbn) existing = await this.findByISBN(bookData.isbn);
    if (!existing && bookData.title && bookData.author) existing = await this.findByTitleAuthor(bookData.title, bookData.author);
    if (existing && existing.source === 'preloaded') return existing;
    if (existing) return this.updateCacheEntry(existing.id, bookData);
    return this.insert(bookData);
  }

  static insert(bookData) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO book_cache 
        (title, author, description, cover_image_url, genres, isbn, page_count, published_date, publisher, source, open_library_key, google_books_id, language, quality_score, info_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const vals = [
        bookData.title, bookData.author, bookData.description || null,
        bookData.cover_image_url || null, bookData.genres || null, bookData.isbn || null,
        bookData.page_count || null, bookData.published_date || null, bookData.publisher || null,
        bookData.source || 'api', bookData.open_library_key || null, bookData.google_books_id || null,
        bookData.language || 'en', bookData.quality_score || 0, bookData.info_link || null
      ];
      db.query(sql, vals, (err, results) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') return resolve(null);
          return reject(err);
        }
        resolve({ id: results.insertId, ...bookData });
      });
    });
  }

  static updateCacheEntry(id, bookData) {
    return new Promise((resolve, reject) => {
      const updates = [], values = [];
      if (bookData.description && bookData.description.length > 10) { updates.push('description = ?'); values.push(bookData.description); }
      if (bookData.cover_image_url) { updates.push('cover_image_url = ?'); values.push(bookData.cover_image_url); }
      if (bookData.genres) { updates.push('genres = ?'); values.push(bookData.genres); }
      if (bookData.page_count) { updates.push('page_count = ?'); values.push(bookData.page_count); }
      if (updates.length === 0) return resolve(null);
      values.push(id);
      db.query(`UPDATE book_cache SET ${updates.join(', ')} WHERE id = ? AND source = 'api'`, values, (err) => {
        if (err) return reject(err);
        resolve({ id, ...bookData });
      });
    });
  }

  static bulkInsert(books) {
    return new Promise((resolve, reject) => {
      if (!books || books.length === 0) return resolve(0);
      const sql = `INSERT IGNORE INTO book_cache 
        (title, author, description, cover_image_url, genres, isbn, page_count, published_date, publisher, source, open_library_key, google_books_id, language, quality_score, info_link)
        VALUES ?`;
      const values = books.map(b => [
        b.title, b.author, b.description || null, b.cover_image_url || null,
        b.genres || null, b.isbn || null, b.page_count || null, b.published_date || null,
        b.publisher || null, b.source || 'preloaded', b.open_library_key || null,
        b.google_books_id || null, b.language || 'en', b.quality_score || 80, b.info_link || null
      ]);
      db.query(sql, [values], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows);
      });
    });
  }

  static incrementSearchCount(ids) {
    return new Promise((resolve, reject) => {
      if (!ids || ids.length === 0) return resolve();
      db.query('UPDATE book_cache SET search_count = search_count + 1 WHERE id IN (?)', [ids], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static getCount() {
    return new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as total, SUM(source = "preloaded") as preloaded, SUM(source = "api") as cached FROM book_cache', (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }
}

module.exports = BookCache;
