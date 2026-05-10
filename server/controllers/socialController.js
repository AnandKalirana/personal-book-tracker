/**
 * Social Controller
 * Handles user searching and public profile viewing
 */

const User = require('../models/User');
const Book = require('../models/Book');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * Search for users
 * GET /api/social/search?q=...
 */
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  const users = await User.searchUsers(q);
  res.json({ success: true, data: users });
});

/**
 * Get public profile and books
 * GET /api/social/profile/:username
 */
exports.getPublicProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;

  const profile = await User.findByUsernamePublic(username);
  if (!profile) {
    return next(new AppError('User not found or profile is private', 404));
  }

  const books = await Book.getPublicBooks(username);
  
  res.json({
    success: true,
    data: {
      profile,
      books
    }
  });
});

