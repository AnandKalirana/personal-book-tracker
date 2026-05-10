/**
 * BookCard Component
 * Individual book card with CSS-based placeholder (no external image service)
 */

import './BookCard.css';

function BookCard({ book, onEdit, onDelete, onToggleFavorite, isReadOnly = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Reading':   return 'status-reading';
      case 'Wishlist':  return 'status-wishlist';
      default:          return '';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'Completed': return '✅';
      case 'Reading':   return '📖';
      case 'Wishlist':  return '⭐';
      default:          return '📚';
    }
  };

  const hasCover = book.cover_image_url && book.cover_image_url !== 'N/A';

  return (
    <div className={`book-card ${isReadOnly ? 'read-only' : ''}`}>
      <div className="book-card-image">
        {hasCover ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="book-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="book-cover-placeholder"
          style={{ display: hasCover ? 'none' : 'flex' }}
        >
          📚
          <span>No Cover</span>
        </div>

        {!isReadOnly && (
          <button
            className={`favorite-btn ${book.is_favorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(book.id)}
            title={book.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            {book.is_favorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="book-card-content">
        <div className="book-card-header">
          <h3 className="book-title" title={book.title}>{book.title}</h3>
          <span className={`book-status ${getStatusClass(book.reading_status)}`}>
            {getStatusEmoji(book.reading_status)} {book.reading_status}
          </span>
        </div>

        <p className="book-author">by {book.author}</p>

        {book.genre && <p className="book-genre">📂 {book.genre}</p>}

        {book.description && (
          <p className="book-description" title={book.description}>
            {book.description}
          </p>
        )}

        {book.tags && (
          <div className="book-tags">
            {book.tags.split(',').map(tag => (
              <span key={tag} className="book-tag">#{tag}</span>
            ))}
          </div>
        )}

        {book.shelves && (
          <div className="book-shelves">
            {book.shelves.split('||').map(shelfStr => {
              const parts = shelfStr.split('::');
              if (parts.length === 2) {
                return <span key={parts[0]} className="book-shelf">📚 {parts[1]}</span>;
              }
              return null;
            })}
          </div>
        )}

        <div className="book-meta">
          {book.date_completed && (
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{formatDate(book.date_completed)}</span>
            </div>
          )}
          {book.rating && (
            <div className="meta-item">
              <span className="meta-icon">⭐</span>
              <span className="rating">{Number(book.rating).toFixed(1)}</span>
            </div>
          )}
          {book.page_count && (
            <div className="meta-item">
              <span className="meta-icon">📄</span>
              <span>{book.page_count}pp</span>
            </div>
          )}
        </div>

        {book.notes && (
          <div className={`book-notes ${isReadOnly ? 'public-notes' : ''}`}>
            <p className="notes-title">{isReadOnly ? "💬 Friend's Thoughts" : '📝 Notes'}</p>
            <p className="notes-text" title={book.notes}>{book.notes}</p>
          </div>
        )}

        {!isReadOnly && (
          <div className="book-card-actions">
            <button
              className="btn-small btn-edit"
              onClick={() => onEdit(book)}
              title="Edit book"
              aria-label="Edit book"
            >
              ✏️ Edit
            </button>
            <button
              className="btn-small btn-delete"
              onClick={() => onDelete(book.id)}
              title="Delete book"
              aria-label="Delete book"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCard;