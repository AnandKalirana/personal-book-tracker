import { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import './UserSearch.css';

const UserSearch = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsDropdownOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await ApiService.searchUsers(query);
        setResults(response.data);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('User search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="user-search-container" ref={dropdownRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search friends by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsDropdownOpen(true)}
        />
        {loading && <div className="search-spinner"></div>}
      </div>

      {isDropdownOpen && results.length > 0 && (
        <div className="user-search-dropdown">
          {results.map((user) => (
            <div 
              key={user.id} 
              className="user-search-item"
              onClick={() => {
                onUserSelect(user.username);
                setIsDropdownOpen(false);
                setQuery('');
              }}
            >
              <div className="user-avatar-mini">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-bio-preview">{user.bio || 'No bio'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && results.length === 0 && query.length >= 2 && !loading && (
        <div className="user-search-dropdown">
          <div className="user-search-no-results">No users found</div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
