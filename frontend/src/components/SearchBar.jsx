/**
 * SearchBar Component — with debounce
 */

import { useState, useEffect, useCallback } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  // Debounce: wait 350ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search books by title or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search books"
          id="book-search"
        />
        {query && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;