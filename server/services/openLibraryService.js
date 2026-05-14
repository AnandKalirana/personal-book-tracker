/**
 * OpenLibrary Service - External API handler with data normalization
 * Fetches from Open Library API, cleans and normalizes results
 */
const axios = require('axios');

const OL_SEARCH_URL = 'https://openlibrary.org/search.json';
const OL_COVERS_URL = 'https://covers.openlibrary.org/b';

class OpenLibraryService {
  /**
   * Search Open Library API
   */
  static async search(query, limit = 15) {
    try {
      if (!query || query.trim().length < 2) {
        return { success: false, books: [], total: 0 };
      }

      const response = await axios.get(OL_SEARCH_URL, {
        params: {
          q: query.trim(),
          limit,
          fields: 'key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median,subject,publisher,language'
        },
        timeout: 12000,
        headers: {
          'User-Agent': 'PersonalBookTracker/1.0 (https://github.com/AnandKalirana/personal-book-tracker)'
        }
      });

      if (!response.data || !response.data.docs) {
        return { success: false, books: [], total: 0 };
      }

      const books = response.data.docs
        .map(doc => this.normalize(doc))
        .filter(book => this.passesQualityCheck(book));

      return {
        success: true,
        total: response.data.numFound || books.length,
        books
      };
    } catch (error) {
      console.error('❌ OpenLibrary API Error:', error.message);
      return { success: false, message: error.message, books: [], total: 0 };
    }
  }

  /**
   * Normalize an Open Library doc into our standard schema
   */
  static normalize(doc) {
    const { generateFallbackDescription } = require('../utils/fallbackDescriptions');
    const xss = require('xss');

    const isbn = (doc.isbn && doc.isbn[0]) || null;
    const cover_id = doc.cover_i || null;

    // Maintain backward compatibility + fallback logic
    let coverUrl = null;
    if (cover_id) {
      coverUrl = `${OL_COVERS_URL}/id/${cover_id}-L.jpg`;
    } else if (isbn) {
      coverUrl = `${OL_COVERS_URL}/isbn/${isbn}-L.jpg`;
    }

    // First author only
    const author = (doc.author_name && doc.author_name.length > 0)
      ? doc.author_name[0].trim()
      : null;

    const genres = (doc.subject || [])
      .filter(s => s.length < 40 && !s.includes('--'))
      .slice(0, 5)
      .join(', ');

    return {
      title: doc.title ? xss(doc.title.trim()) : null,
      author: author ? xss(author) : null,

      // Always provide description (fallback)
      description: generateFallbackDescription(),

      // New structured field
      cover_id: cover_id,

      // Backward compatibility (important for frontend)
      cover_image_url: coverUrl,

      genres: genres ? xss(genres) : null,
      isbn: isbn ? xss(isbn) : null,
      page_count: doc.number_of_pages_median || null,

      // New structured year field
      published_year: doc.first_publish_year || null,

      // Existing field retained
      published_date: doc.first_publish_year
        ? String(doc.first_publish_year)
        : null,

      publisher: (doc.publisher && doc.publisher[0])
        ? xss(doc.publisher[0])
        : null,

      source: 'api',

      open_library_key: doc.key
        ? xss(doc.key.replace('/works/', ''))
        : null,

      language: (doc.language && doc.language[0])
        ? xss(doc.language[0])
        : 'en',

      info_link: doc.key
        ? `https://openlibrary.org${doc.key}`
        : null,

      quality_score: this.calculateQuality(doc, coverUrl)
    };
  }

  /**
   * Calculate quality score (0-100)
   */
  static calculateQuality(doc, coverUrl) {
    let score = 0;
    if (doc.title) score += 15;
    if (doc.author_name && doc.author_name.length > 0) score += 15;
    if (coverUrl) score += 20;
    if (doc.isbn && doc.isbn.length > 0) score += 15;
    if (doc.number_of_pages_median) score += 10;
    if (doc.first_publish_year) score += 10;
    if (doc.subject && doc.subject.length > 0) score += 10;
    if (doc.publisher && doc.publisher.length > 0) score += 5;
    return Math.min(score, 100);
  }

  /**
   * Quality filter — stricter version
   */
  static passesQualityCheck(book) {
    // Strict requirement: must have title, author, and cover_id
    if (!book.title || !book.author || !book.cover_id) return false;

    if (book.quality_score < 30) return false;

    return true;
  }
}

module.exports = OpenLibraryService;