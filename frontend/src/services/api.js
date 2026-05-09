/**
 * API Service
 * Handles all HTTP requests to the backend
 * Includes JWT authentication header management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  /**
   * Get stored auth token
   */
  static getToken() {
    return localStorage.getItem('book_tracker_token');
  }

  /**
   * Set auth token
   */
  static setToken(token) {
    localStorage.setItem('book_tracker_token', token);
  }

  /**
   * Remove auth token
   */
  static removeToken() {
    localStorage.removeItem('book_tracker_token');
    localStorage.removeItem('book_tracker_user');
  }

  /**
   * Get stored user
   */
  static getUser() {
    const user = localStorage.getItem('book_tracker_user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Set stored user
   */
  static setUser(user) {
    localStorage.setItem('book_tracker_user', JSON.stringify(user));
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Generic fetch method with error handling and auth
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle 401 — token expired or invalid
      if (response.status === 401) {
        this.removeToken();
        const error = new Error(data?.message || 'Session expired. Please login again.');
        error.status = 401;
        error.data = data;
        throw error;
      }

      // Handle error responses
      if (!response.ok) {
        const message = data?.error?.message || data?.message || `HTTP ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (!error.status) {
        console.error('❌ API Error:', error);
      }
      throw error;
    }
  }

  /**
   * AUTH ENDPOINTS
   */

  static async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (data.success) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
    }
    return data;
  }

  static async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.success) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
    }
    return data;
  }

  static logout() {
    this.removeToken();
  }

  static async getProfile() {
    return this.request('/auth/profile');
  }

  /**
   * BOOK ENDPOINTS
   */

  // Get all books with optional filters
  static async getAllBooks(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/books?${params}`);
  }

  // Get single book
  static async getBook(id) {
    return this.request(`/books/${id}`);
  }

  // Create new book
  static async createBook(bookData) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  // Update book
  static async updateBook(id, bookData) {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  // Delete book
  static async deleteBook(id) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Search books locally
  static async searchBooks(query) {
    return this.request(`/books/search/${encodeURIComponent(query)}`);
  }

  // Get books by genre
  static async getBooksByGenre(genre) {
    return this.request(`/books/genre/${genre}`);
  }

  // Get books by status
  static async getBooksByStatus(status) {
    return this.request(`/books/status/${status}`);
  }

  // Get statistics
  static async getStatistics() {
    return this.request('/books/stats');
  }

  // Get all genres
  static async getAllGenres() {
    return this.request('/books/genres');
  }

  // Toggle favorite
  static async toggleFavorite(id) {
    return this.request(`/books/${id}/favorite`, {
      method: 'PUT',
    });
  }

  /**
   * GOOGLE BOOKS API ENDPOINTS
   */

  // Search Google Books
  static async searchGoogleBooks(query, maxResults = 10) {
    const params = new URLSearchParams({
      query,
      maxResults,
    });
    return this.request(`/search/google-books?${params}`);
  }

  // Search by title
  static async searchGoogleBooksByTitle(title) {
    return this.request(`/search/google-books/title/${encodeURIComponent(title)}`);
  }

  // Search by author
  static async searchGoogleBooksByAuthor(author) {
    return this.request(`/search/google-books/author/${encodeURIComponent(author)}`);
  }

  // Search by ISBN
  static async searchGoogleBooksByISBN(isbn) {
    return this.request(`/search/google-books/isbn/${isbn}`);
  }

  // Get Google Books details
  static async getGoogleBookDetails(bookId) {
    return this.request(`/search/google-books/${bookId}`);
  }

  // Advanced search
  static async advancedSearch(filters) {
    const params = new URLSearchParams(filters);
    return this.request(`/search/advanced?${params}`);
  }

  /**
   * HEALTH CHECK
   */
  /**
   * Request password reset link
   */
  static async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token, password) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  /**
   * Search for users
   */
  static async searchUsers(query) {
    return this.request(`/social/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get public profile and books
   */
  static async getPublicProfile(username) {
    return this.request(`/social/profile/${username}`);
  }

  /**
   * UPLOAD ENDPOINTS
   */
  static async uploadImage(file, type = 'cover') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }

  /**
   * SHELF ENDPOINTS
   */
  static async getShelves() {
    return this.request('/shelves');
  }

  static async createShelf(name) {
    return this.request('/shelves', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  static async updateShelf(id, name) {
    return this.request(`/shelves/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  static async deleteShelf(id) {
    return this.request(`/shelves/${id}`, {
      method: 'DELETE',
    });
  }

  static async addBookToShelf(shelfId, bookId) {
    return this.request(`/shelves/${shelfId}/books`, {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    });
  }

  static async removeBookFromShelf(shelfId, bookId) {
    return this.request(`/shelves/${shelfId}/books/${bookId}`, {
      method: 'DELETE',
    });
  }

  /**
   * TAG ENDPOINTS
   */
  static async getTags() {
    return this.request('/tags');
  }

  static async addTagsToBook(bookId, tags) {
    return this.request(`/tags/book/${bookId}`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }
}

export default ApiService;