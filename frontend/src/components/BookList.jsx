/**
 * BookList Component
 * Displays books in a responsive grid layout
 */

import './BookList.css';
import BookCard from './BookCard';

function BookList({ books, loading, onEdit, onDelete, onToggleFavorite }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your books...</p>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📚</div>
        <h2>No books found</h2>
        <p>Start by adding your first book or searching for one!</p>
      </div>
    );
  }

  return (
    <div className="book-list">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default BookList;