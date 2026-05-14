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
        params: { q: query.trim(), limit, fields: 'key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median,subject,publisher,language' },
        timeout: 12000
      });

      if (!response.data || !response.data.docs) {
        return { success: false, books: [], total: 0 };
      }

      const books = response.data.docs
        .map(doc => this.normalize(doc))
        .filter(book => this.passesQualityCheck(book));

      return { success: true, total: response.data.numFound || books.length, books };
    } catch (error) {
      console.error('❌ OpenLibrary API Error:', error.message);
      return { success: false, message: error.message, books: [], total: 0 };
    }
  }

  /**
   * Normalize an Open Library doc into our standard schema
   */
  static normalize(doc) {
    const isbn = (doc.isbn && doc.isbn[0]) || null;
    let coverUrl = null;

    if (doc.cover_i) {
      coverUrl = `${OL_COVERS_URL}/id/${doc.cover_i}-L.jpg`;
    } else if (isbn) {
      coverUrl = `${OL_COVERS_URL}/isbn/${isbn}-L.jpg`;
    }

    const genres = (doc.subject || [])
      .filter(s => s.length < 40 && !s.includes('--'))
      .slice(0, 5)
      .join(', ');

    return {
      title: (doc.title || 'Unknown Title').trim(),
      author: (doc.author_name || ['Unknown Author']).join(', ').trim(),
      description: null, // OL search doesn't return descriptions
      cover_image_url: coverUrl,
      genres: genres || null,
      isbn: isbn,
      page_count: doc.number_of_pages_median || null,
      published_date: doc.first_publish_year ? String(doc.first_publish_year) : null,
      publisher: (doc.publisher && doc.publisher[0]) || null,
      source: 'api',
      open_library_key: doc.key ? doc.key.replace('/works/', '') : null,
      language: (doc.language && doc.language[0]) || 'en',
      info_link: doc.key ? `https://openlibrary.org${doc.key}` : null,
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
   * Quality filter — reject low-quality entries
   */
  static passesQualityCheck(book) {
    if (!book.title || book.title === 'Unknown Title') return false;
    if (!book.author || book.author === 'Unknown Author') return false;
    if (book.quality_score < 30) return false;
    return true;
  }
}

module.exports = OpenLibraryService;
