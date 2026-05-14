/**
 * SearchService - Hybrid search orchestrator
 * Flow: Cache (preloaded first) → Open Library API fallback → Cache result
 */
const BookCache = require('../models/BookCache');
const OpenLibraryService = require('./openLibraryService');

const MIN_QUALITY_RESULTS = 3;

class SearchService {
  /**
   * Main hybrid search entry point
   */
  static async search(query, limit = 20) {
    try {
      // Step 1: Search local cache (FULLTEXT)
      let results = await BookCache.search(query, limit);

      // Step 2: If FULLTEXT returned nothing, try fuzzy
      if (results.length < MIN_QUALITY_RESULTS) {
        const fuzzy = await BookCache.fuzzySearch(query, limit);
        const existingIds = new Set(results.map(r => r.id));
        for (const book of fuzzy) {
          if (!existingIds.has(book.id)) results.push(book);
        }
      }

      // Step 3: If still not enough, fetch from Open Library
      if (results.length < MIN_QUALITY_RESULTS) {
        try {
          const apiResult = await OpenLibraryService.search(query, 15);
          if (apiResult.success && apiResult.books.length > 0) {
            // Cache the API results (async, non-blocking)
            this.cacheApiResults(apiResult.books).catch(err =>
              console.error('Cache write error:', err.message)
            );

            // Merge API results with cache results (deduplicate)
            const existingTitles = new Set(results.map(r => r.title.toLowerCase()));
            for (const book of apiResult.books) {
              if (!existingTitles.has(book.title.toLowerCase())) {
                results.push({ ...book, source: 'api', _fromApi: true });
              }
            }
          }
        } catch (apiErr) {
          console.error('API fallback failed:', apiErr.message);
          // Continue with whatever cache results we have
        }
      }

      // Step 4: Increment search counts for cached results
      const cachedIds = results.filter(r => r.id && !r._fromApi).map(r => r.id);
      if (cachedIds.length > 0) {
        BookCache.incrementSearchCount(cachedIds).catch(() => {});
      }

      // Step 5: Sort final results (preloaded first, then by relevance/quality)
      results.sort((a, b) => {
        const aBoost = a.source === 'preloaded' ? 100 : 0;
        const bBoost = b.source === 'preloaded' ? 100 : 0;
        if (aBoost !== bBoost) return bBoost - aBoost;
        return (b.quality_score || 0) - (a.quality_score || 0);
      });

      // Clean up internal fields
      results = results.slice(0, limit).map(r => {
        const { _fromApi, source_boost, relevance, ...clean } = r;
        return clean;
      });

      return {
        success: true,
        total: results.length,
        books: results,
        sources: {
          preloaded: results.filter(r => r.source === 'preloaded').length,
          cached: results.filter(r => r.source === 'api' && r.id).length,
          live_api: results.filter(r => r.source === 'api' && !r.id).length
        }
      };
    } catch (error) {
      console.error('SearchService error:', error.message);
      return { success: false, message: 'Search failed', books: [], total: 0 };
    }
  }

  /**
   * Cache qualified API results into MySQL
   */
  static async cacheApiResults(books) {
    let cached = 0;
    for (const book of books) {
      if (book.quality_score >= 40) {
        try {
          await BookCache.upsert(book);
          cached++;
        } catch (err) {
          // Skip individual failures
        }
      }
    }
    if (cached > 0) console.log(`📦 Cached ${cached} books from API`);
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    return BookCache.getCount();
  }
}

module.exports = SearchService;
