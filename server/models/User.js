/**
 * User Model
 * Database operations for user authentication
 */

const db = require('../config/database');

class User {
  /**
   * Create a new user
   */
  static createUser(username, email, passwordHash) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `;
      db.query(query, [username, email, passwordHash], (error, results) => {
        if (error) return reject(error);
        resolve({
          id: results.insertId,
          username,
          email
        });
      });
    });
  }

  /**
   * Find user by email
   */
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.query(query, [email], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] || null);
      });
    });
  }

  /**
   * Find user by ID
   */
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, full_name, theme_preference, created_at FROM users WHERE id = ?';
      db.query(query, [id], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] || null);
      });
    });
  }

  /**
   * Find user by username
   */
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';
      db.query(query, [username], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] || null);
      });
    });
  }

  /**
   * Set reset token for user
   */
  static setResetToken(id, token, expiry) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?';
      db.query(query, [token, expiry, id], (error) => {
        if (error) return reject(error);
        resolve(true);
      });
    });
  }

  /**
   * Find user by reset token
   */
  static findByResetToken(token) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE reset_token = ?';
      db.query(query, [token], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] || null);
      });
    });
  }

  /**
   * Update user password
   */
  static updatePassword(id, passwordHash) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
      db.query(query, [passwordHash, id], (error) => {
        if (error) return reject(error);
        resolve(true);
      });
    });
  }

  /**
   * Search users by username
   */
  static searchUsers(query) {
    return new Promise((resolve, reject) => {
      // More robust query: handle potential nulls and missing columns gracefully
      const sql = `
        SELECT id, username, bio, avatar_url 
        FROM users 
        WHERE username LIKE ? 
        AND (is_public = 1 OR is_public IS NULL) 
        LIMIT 10
      `;
      db.query(sql, [`%${query}%`], (error, results) => {
        if (error) {
          console.error('❌ User search query failed:', error.message);
          return reject(error);
        }
        resolve(results || []);
      });
    });
  }

  /**
   * Get public profile by username
   */
  static findByUsernamePublic(username) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, username, bio, avatar_url, created_at FROM users WHERE username = ? AND is_public = 1';
      db.query(sql, [username], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] || null);
      });
    });
  }

  /**
   * Update user profile settings
   */
  static updateProfile(id, data) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET bio = ?, is_public = ? WHERE id = ?';
      db.query(query, [data.bio, data.is_public, id], (error) => {
        if (error) return reject(error);
        resolve(true);
      });
    });
  }
}

module.exports = User;
