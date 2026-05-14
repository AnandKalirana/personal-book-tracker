/**
 * Google Books API Service (FINAL STABLE VERSION)
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// ✅ In-memory cache
const cache = new Map();

// Helper: build params safely
const buildParams = (query, maxResults = 10) => {
  const params = {
    q: query,
    maxResults: Math.min(maxResults, 40),
  };

  if (API_KEY) {
    params.key = API_KEY;
  }

  return params;
};

// ✅ delay to reduce API spam
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Search books (SAFE + CACHE + NO CRASH)
 */
const searchBooks = async (query, maxResults = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: false, books: [], total: 0 };
    }

    const cacheKey = query.toLowerCase();

    // ✅ CACHE CHECK
    if (cache.has(cacheKey)) {
      return {
        success: true,
        total: cache.get(cacheKey).length,
        books: cache.get(cacheKey)
      };
    }

    await delay(300); // reduce rate limit

    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: buildParams(query, maxResults),
      timeout: 10000
    });

    const books =
      response.data.items?.map(item => transformGoogleBook(item)) || [];

    // ✅ SAVE TO CACHE
    cache.set(cacheKey, books);

    return {
      success: true,
      total: response.data.totalItems || 0,
      books
    };

  } catch (error) {
    // ✅ LOG THE ERROR
    console.error('❌ Google Books API Error:', error.message);

    // ✅ ATTEMPT FALLBACK TO OPEN LIBRARY
    try {
      console.log(`🔄 Attempting fallback to OpenLibrary for query: "${query}"`);
      const openLibraryUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${maxResults}`;
      const olResponse = await axios.get(openLibraryUrl, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'PersonalBookTracker/1.0 (contact: anand.kalirana@gmail.com)'
        }
      });
      
      if (olResponse.data && olResponse.data.docs && olResponse.data.docs.length > 0) {
        const books = olResponse.data.docs.map(doc => ({
          google_books_id: doc.key.replace('/works/', 'ol_'),
          title: doc.title || 'Unknown Title',
          author: (doc.author_name || ['Unknown Author']).join(', '),
          description: 'Description not available from OpenLibrary.',
          cover_image_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : (doc.isbn && doc.isbn[0] ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg` : null),
          isbn: (doc.isbn && doc.isbn[0]) || null,
          page_count: doc.number_of_pages_median || null,
          published_date: doc.first_publish_year ? doc.first_publish_year.toString() : null,
          genre: (doc.subject || []).slice(0, 3).join(', ') || '',
          language: doc.language && doc.language[0] ? doc.language[0] : 'en',
          publisher: doc.publisher && doc.publisher[0] ? doc.publisher[0] : null,
          preview_link: null,
          info_link: `https://openlibrary.org${doc.key}`,
          rating: null,
          rating_count: null,
          quality_score: 50
        }));

        const cacheKey = query.toLowerCase();
        cache.set(cacheKey, books);

        return {
          success: true,
          total: olResponse.data.numFound || books.length,
          books,
          source: 'openlibrary'
        };
      }
    } catch (olError) {
      console.error('❌ OpenLibrary Fallback Error:', olError.message);
    }

    // FINAL FALLBACK: If both fail, check if we have ANYTHING in cache
    if (error.response?.status === 429) {
      return {
        success: false,
        message: 'Search is temporarily throttled by Google. Please try a different book or wait.',
        books: [],
        total: 0
      };
    }

    return {
      success: false,
      message: 'Failed to fetch books from all sources',
      books: [],
      total: 0
    };
  }
};

/**
 * Get book by ID
 */
const getBookById = async (bookId) => {
  try {
    await delay(200);

    const params = {};
    if (API_KEY) params.key = API_KEY;

    const response = await axios.get(
      `${GOOGLE_BOOKS_API_URL}/${bookId}`,
      {
        params,
        timeout: 10000
      }
    );

    return {
      success: true,
      book: transformGoogleBook(response.data)
    };

  } catch (error) {
    console.error('❌ Google Books API Error:', error.message);

    return {
      success: false,
      message: 'Failed to fetch book details',
      book: null
    };
  }
};

/**
 * Transform Google API response
 */
const transformGoogleBook = (googleBook) => {
  const volumeInfo = googleBook.volumeInfo || {};

  const isbn =
    volumeInfo.industryIdentifiers?.find(id =>
      id.type.includes('ISBN')
    )?.identifier || null;

  return {
    google_books_id: googleBook.id,
    title: volumeInfo.title || 'Unknown Title',
    author: (volumeInfo.authors || ['Unknown Author']).join(', '),
    description: volumeInfo.description || '',

    // ✅ BEST IMAGE STRATEGY
    cover_image_url:
      volumeInfo.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=2') ||
      (isbn
        ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
        : null),

    isbn: isbn || null,
    page_count: volumeInfo.pageCount || null,
    published_date: volumeInfo.publishedDate || null,
    genre: (volumeInfo.categories || []).join(', ') || '',
    language: volumeInfo.language || 'en',
    publisher: volumeInfo.publisher || null,
    preview_link: volumeInfo.previewLink || null,
    info_link: volumeInfo.infoLink || null,
    rating: volumeInfo.averageRating || null,
    rating_count: volumeInfo.ratingsCount || null
  };
};

// Helper methods
const searchByTitle = (title) => searchBooks(`intitle:"${title}"`, 10);
const searchByAuthor = (author) => searchBooks(`inauthor:"${author}"`, 10);
const searchByISBN = (isbn) => searchBooks(`isbn:${isbn}`, 1);

const advancedSearch = async (filters) => {
  const { title, author, publisher, subject, maxResults = 10 } = filters;

  let query = '';
  if (title) query += `intitle:"${title}" `;
  if (author) query += `inauthor:"${author}" `;
  if (publisher) query += `inpublisher:"${publisher}" `;
  if (subject) query += `subject:"${subject}" `;

  if (!query.trim()) {
    return { success: false, books: [] };
  }

  return searchBooks(query.trim(), maxResults);
};

module.exports = {
  searchBooks,
  getBookById,
  searchByTitle,
  searchByAuthor,
  searchByISBN,
  advancedSearch,
  transformGoogleBook
};