/**
 * Search Routes - Hybrid search endpoints
 */
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Hybrid search (public - no auth required for discovery)
router.get('/hybrid', searchController.hybridSearch);

// Cache statistics
router.get('/stats', searchController.getSearchStats);

module.exports = router;
