/**
 * Personal Book Tracker - Main App Component
 * With JWT authentication, smart search/sort, and modern UI
 */

import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import SearchBar from './components/SearchBar';
import GoogleBooksSearch from './components/GoogleBooksSearch';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import PublicProfile from './components/PublicProfile';
import UserSearch from './components/UserSearch';
import ShelfManager from './components/ShelfManager';
import ApiService from './services/api';

function App() {
  // Auth state
  const [user, setUser] = useState(() => ApiService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => ApiService.isAuthenticated());

  // Social state
  const [viewingProfile, setViewingProfile] = useState(null); // username string or null

  // Books state
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showShelfManager, setShowShelfManager] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Filter / Sort state
  const [sortBy, setSortBy] = useState('date_added');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Metadata
  const [statistics, setStatistics] = useState(null);
  const [genres, setGenres] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [tags, setTags] = useState([]);

  // Apply dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadStatistics();
      loadGenres();
      loadShelvesAndTags();
    }
  }, [isAuthenticated]);

  const loadShelvesAndTags = async () => {
    try {
      const [shelvesRes, tagsRes] = await Promise.all([
        ApiService.getShelves(),
        ApiService.getTags()
      ]);
      setShelves(shelvesRes.data || []);
      setTags(tagsRes.data || []);
    } catch (err) {
      console.error('Failed to load shelves or tags:', err);
    }
  };

  // Load books when filters / sort change
  useEffect(() => {
    if (!isAuthenticated) return;
    if (searchQuery.trim()) return; // Don't re-fetch if search is active
    const timeout = setTimeout(() => {
      loadBooks();
    }, 300);
    return () => clearTimeout(timeout);
  }, [sortBy, filterStatus, selectedGenre, selectedShelf, selectedTag, isAuthenticated]);

  // Smart sort order: alphabetical fields → ASC, everything else → DESC
  const getSmartOrder = (field) => {
    return ['title', 'author'].includes(field) ? 'ASC' : 'DESC';
  };

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        sortBy,
        order: getSmartOrder(sortBy),
      };
      if (filterStatus) filters.reading_status = filterStatus;
      if (selectedGenre) filters.genre = selectedGenre;
      if (selectedShelf) filters.shelf_id = selectedShelf;
      if (selectedTag) filters.tag = selectedTag;

      const response = await ApiService.getAllBooks(filters);
      const booksData = response.data || [];
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
      } else {
        setError('Failed to load books. Please try again.');
      }
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterStatus, selectedGenre, selectedShelf, selectedTag]);

  const loadStatistics = async () => {
    try {
      const response = await ApiService.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      if (err.status === 401) handleLogout();
    }
  };

  const loadGenres = async () => {
    try {
      const response = await ApiService.getAllGenres();
      setGenres(response.data || []);
    } catch (err) {
      console.error('Failed to load genres:', err);
    }
  };

  // Handle local search (debounced, hits backend)
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // Clear search — reload full list
      loadBooks();
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.searchBooks(query);
      setFilteredBooks(response.data || []);
    } catch (err) {
      if (err.status === 401) handleLogout();
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  }, [loadBooks]);

  // Show success toast
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Handle save (add or edit)
  const handleSaveBook = async (bookData) => {
    try {
      let bookId = editingBook?.id;
      
      const { tags: currentTags, shelfIds: currentShelfIds, ...coreData } = bookData;

      if (editingBook) {
        await ApiService.updateBook(editingBook.id, coreData);
        showSuccess('Book updated successfully! ✅');
      } else {
        const response = await ApiService.createBook(coreData);
        bookId = response.data.id;
        showSuccess('Book added to your collection! 📚');
      }

      // Update tags if provided
      if (currentTags && bookId) {
        await ApiService.addTagsToBook(bookId, currentTags);
      }

      // Update shelves if provided
      if (currentShelfIds !== undefined && bookId) {
        // We'll just loop and add them for now (since we only have addBookToShelf)
        // Wait, the user could remove a shelf. 
        // Best approach is a quick loop over all available shelves and add/remove based on selection.
        for (const shelf of shelves) {
          if (currentShelfIds.includes(shelf.id)) {
            await ApiService.addBookToShelf(shelf.id, bookId);
          } else {
            // we remove it just in case
            await ApiService.removeBookFromShelf(shelf.id, bookId).catch(() => {});
          }
        }
      }

      setShowForm(false);
      setEditingBook(null);
      await loadBooks();
      await loadStatistics();
      await loadGenres();
      await loadShelvesAndTags();
      setError(null);
    } catch (err) {
      if (err.status === 401) handleLogout();
      else setError(err?.message || 'Failed to save book');
    }
  };

  // Handle delete
  const handleDeleteBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await ApiService.deleteBook(id);
      showSuccess('Book deleted.');
      await loadBooks();
      await loadStatistics();
    } catch (err) {
      if (err.status === 401) handleLogout();
      else setError('Failed to delete book');
    }
  };

  // Handle edit
  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (id) => {
    try {
      await ApiService.toggleFavorite(id);
      await loadBooks();
    } catch (err) {
      if (err.status === 401) handleLogout();
      else setError('Failed to update favorite status');
    }
  };

  // Handle add from Google Books — cover_image_url is already on the transformed object
  const handleAddFromGoogle = async (googleBook) => {
    const bookData = {
      title: googleBook.title,
      author: googleBook.author,
      description: googleBook.description,
      cover_image_url: googleBook.cover_image_url || '',
      genre: googleBook.genre || '',
      google_books_id: googleBook.google_books_id,
      isbn: googleBook.isbn,
      page_count: googleBook.page_count,
      published_date: googleBook.published_date,
      reading_status: 'Wishlist',
    };
    try {
      await ApiService.createBook(bookData);
      showSuccess(`"${googleBook.title}" added to your collection! 📚`);
      setShowForm(false);
      await loadBooks();
      await loadStatistics();
      await loadGenres();
    } catch (err) {
      if (err.status === 401) handleLogout();
      else setError(err?.message || 'Failed to add book from Google Books');
    }
  };

  // Auth handlers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    ApiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setViewingProfile(null);
    setBooks([]);
    setFilteredBooks([]);
    setStatistics(null);
    setGenres([]);
    setShowForm(false);
    setEditingBook(null);
    setError(null);
  };

  const handleUserSelect = (username) => {
    setViewingProfile(username);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Not logged in — show auth modal
  if (!isAuthenticated) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app" data-theme={darkMode ? 'dark' : 'light'}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        onLogout={handleLogout}
      >
        <UserSearch onUserSelect={handleUserSelect} />
      </Header>

      <main className="app-main">
        {/* Toast messages */}
        {error && (
          <div className="toast toast-error" onClick={() => setError(null)}>
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="toast toast-success">
            {successMsg}
          </div>
        )}

        {viewingProfile ? (
          <PublicProfile 
            username={viewingProfile} 
            onBack={() => setViewingProfile(null)} 
          />
        ) : (
          <>
            {/* Page header */}
            <div className="page-header">
              <div className="page-header-top">
                <div>
                  <h2 className="page-title">My Book Collection</h2>
                  <p className="page-subtitle">
                    {statistics ? `${statistics.total_books || 0} books tracked` : 'Loading...'}
                  </p>
                </div>
                <div className="header-actions">
                  <button
                    className="btn-manage-shelves"
                    onClick={() => setShowShelfManager(true)}
                  >
                    📚 Shelves
                  </button>
                  <button
                    className={`btn-add-book ${showForm ? 'active' : ''}`}
                    onClick={() => {
                      setEditingBook(null);
                      setShowForm(!showForm);
                    }}
                  >
                    {showForm ? '✕ Close' : '+ Add Book'}
                  </button>
                </div>
              </div>

              {showShelfManager && (
                <ShelfManager 
                  shelves={shelves} 
                  onShelvesChange={(newShelves) => setShelves(newShelves)} 
                  onClose={() => setShowShelfManager(false)} 
                />
              )}

              {/* Dashboard Charts */}
              {statistics && !showForm && (
                <Dashboard stats={statistics} />
              )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className="form-panel">
                <BookForm
                  book={editingBook}
                  availableShelves={shelves}
                  onSave={handleSaveBook}
                  onCancel={() => { setShowForm(false); setEditingBook(null); }}
                />
                <div className="form-divider">
                  <span>— or search Google Books —</span>
                </div>
                <GoogleBooksSearch onSelectBook={handleAddFromGoogle} />
              </div>
            )}

            {/* Search & Filters */}
            <div className="controls-bar">
              <SearchBar onSearch={handleSearch} />
              <div className="filters-row">
                <div className="filter-group">
                  <label htmlFor="status-filter">Status</label>
                  <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Reading">Reading</option>
                    <option value="Wishlist">Wishlist</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="genre-filter">Genre</label>
                  <select
                    id="genre-filter"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="shelf-filter">Shelf</label>
                  <select
                    id="shelf-filter"
                    value={selectedShelf}
                    onChange={(e) => setSelectedShelf(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Shelves</option>
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>{shelf.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="tag-filter">Tag</label>
                  <select
                    id="tag-filter"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Tags</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.name}>#{tag.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="sort-select">Sort By</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="date_added">Recently Added</option>
                    <option value="title">Title (A–Z)</option>
                    <option value="author">Author (A–Z)</option>
                    <option value="date_completed">Completed Date</option>
                    <option value="rating">Rating (High–Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Book List */}
            <BookList
              books={filteredBooks}
              loading={loading}
              onEdit={handleEditBook}
              onDelete={handleDeleteBook}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;