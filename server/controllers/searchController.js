/**
 * Search Controller - Handles hybrid search API requests
 */
const SearchService = require('../services/searchService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Hybrid search endpoint
 * GET /api/search/hybrid?query=...&limit=20
 */
exports.hybridSearch = asyncHandler(async (req, res) => {
  const { query, limit = 20 } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  const result = await SearchService.search(
    query.trim(),
    Math.min(parseInt(limit) || 20, 40)
  );

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.message || 'Search failed',
      data: []
    });
  }

  res.json({
    success: true,
    query: query.trim(),
    total_results: result.total,
    sources: result.sources,
    data: result.books
  });
});

/**
 * Cache stats endpoint
 * GET /api/search/stats
 */
exports.getSearchStats = asyncHandler(async (req, res) => {
  const stats = await SearchService.getStats();
  res.json({ success: true, data: stats });
});
