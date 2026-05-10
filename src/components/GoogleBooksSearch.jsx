/**
 * GoogleBooksSearch Component — CSS placeholder, better error handling
 */

import { useState } from 'react';
import ApiService from '../services/api';
import './GoogleBooksSearch.css';

function GoogleBooksSearch({ onSelectBook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('all');
  const [lastSearchTime, setLastSearchTime] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    const now = Date.now();
    if (now - lastSearchTime < 1200) {
      setError('Please wait a moment before searching again');
      return;
    }

    setLastSearchTime(now);
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (searchType) {
        case 'title':
          response = await ApiService.searchGoogleBooksByTitle(searchQuery);
          break;
        case 'author':
          response = await ApiService.searchGoogleBooksByAuthor(searchQuery);
          break;
        default:
          response = await ApiService.searchGoogleBooks(searchQuery, 12);
      }

      const books = response.data || [];
      setSearchResults(books);

      if (books.length === 0) {
        setError('No books found. Try a different search term.');
      }
    } catch (err) {
      console.error('Google Books search failed:', err);
      setError(err.message || 'Failed to search Google Books. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  return (
    <div className="google-books-search">
      <h3 className="search-title">🔍 Search Google Books</h3>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-inputs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="search-input"
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type-select"
          >
            <option value="all">All</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? '...' : '🔎 Search'}
          </button>
          {searchResults.length > 0 && (
            <button type="button" className="btn-secondary-outline" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      </form>

      {error && <div className="search-error">{error}</div>}

      {loading && (
        <div className="search-loading">
          <div className="spinner-small"></div>
          Searching Google Books...
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <p className="results-count">Found {searchResults.length} books</p>
          <div className="results-list">
            {searchResults.map((book, index) => (
              <div key={`${book.google_books_id || index}`} className="result-item">
                <div className="result-image">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '📚';
                      }}
                    />
                  ) : (
                    '📚'
                  )}
                </div>

                <div className="result-info">
                  <h4 className="result-title">{book.title}</h4>
                  <p className="result-author">{book.author}</p>
                  {book.description && (
                    <p className="result-description">{book.description}</p>
                  )}
                  <div className="result-meta">
                    {book.published_date && (
                      <span className="meta-badge">📅 {book.published_date}</span>
                    )}
                    {book.page_count && (
                      <span className="meta-badge">📄 {book.page_count}pp</span>
                    )}
                    {book.genre && (
                      <span className="meta-badge">📂 {book.genre.split(',')[0]}</span>
                    )}
                  </div>
                </div>

                <button
                  className="btn-add-result"
                  onClick={() => onSelectBook(book)}
                  title="Add to collection"
                >
                  ➕ Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleBooksSearch;