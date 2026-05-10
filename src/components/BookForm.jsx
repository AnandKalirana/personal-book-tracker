/**
 * BookForm Component
 * Form for adding and editing books
 */

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import TagInput from './TagInput';
import './BookForm.css';

function BookForm({ book, availableShelves = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    cover_image_url: '',
    date_completed: '',
    rating: '',
    genre: '',
    reading_status: 'Wishlist',
    notes: '',
    tags: [],
    shelfIds: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        cover_image_url: book.cover_image_url || '',
        date_completed: book.date_completed ? book.date_completed.substring(0, 10) : '',
        rating: book.rating !== null && book.rating !== undefined ? book.rating : '',
        genre: book.genre || '',
        reading_status: book.reading_status || 'Wishlist',
        notes: book.notes || '',
        tags: book.tags ? book.tags.split(',') : [],
        shelfIds: book.shelves ? book.shelves.split('||').map(s => parseInt(s.split('::')[0])) : [],
      });
    } else {
      setFormData({
        title: '',
        author: '',
        description: '',
        cover_image_url: '',
        date_completed: '',
        rating: '',
        genre: '',
        reading_status: 'Wishlist',
        notes: '',
        tags: [],
        shelfIds: [],
      });
    }
    setErrors({});
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (formData.rating && (parseInt(formData.rating) < 0 || parseInt(formData.rating) > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5';
    }

    if (formData.date_completed) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date_completed)) {
        newErrors.date_completed = 'Date must be in YYYY-MM-DD format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      rating: formData.rating ? parseInt(formData.rating) : null,
    };

    onSave(submitData);
  };

  return (
    <div className="book-form-container">
      <h2 className="form-title">{book ? '✏️ Edit Book' : '📖 Add New Book'}</h2>

      <form onSubmit={handleSubmit} className="book-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter book title"
            className={`form-input ${errors.title ? 'error' : ''}`}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Author */}
        <div className="form-group">
          <label htmlFor="author" className="form-label">
            Author <span className="required">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            className={`form-input ${errors.author ? 'error' : ''}`}
          />
          {errors.author && <span className="error-message">{errors.author}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter book description"
            className="form-textarea"
            rows="4"
          ></textarea>
        </div>

        {/* Cover Image Upload */}
        <div className="form-group">
          <label className="form-label">Cover Image</label>
          <ImageUpload 
            currentImage={formData.cover_image_url} 
            type="cover"
            onImageUpload={(url) => setFormData(prev => ({ ...prev, cover_image_url: url }))} 
          />
        </div>

        {/* Genre */}
        <div className="form-group">
          <label htmlFor="genre" className="form-label">
            Genre
          </label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            placeholder="e.g., Fiction, Science Fiction, Mystery"
            className="form-input"
          />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Mood Tags</label>
          <TagInput 
            tags={formData.tags}
            onChange={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))}
          />
        </div>

        {/* Shelves */}
        {availableShelves.length > 0 && (
          <div className="form-group">
            <label className="form-label">Add to Shelves</label>
            <div className="shelves-checkboxes">
              {availableShelves.map(shelf => (
                <label key={shelf.id} className="shelf-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.shelfIds.includes(shelf.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        shelfIds: checked 
                          ? [...prev.shelfIds, shelf.id]
                          : prev.shelfIds.filter(id => id !== shelf.id)
                      }));
                    }}
                  />
                  <span>📚 {shelf.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Reading Status */}
        <div className="form-group">
          <label htmlFor="reading_status" className="form-label">
            Reading Status
          </label>
          <select
            id="reading_status"
            name="reading_status"
            value={formData.reading_status}
            onChange={handleChange}
            className="form-input"
          >
            <option value="Wishlist">Wishlist</option>
            <option value="Reading">Currently Reading</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Date Completed */}
        <div className="form-group">
          <label htmlFor="date_completed" className="form-label">
            Date Completed
          </label>
          <input
            type="date"
            id="date_completed"
            name="date_completed"
            value={formData.date_completed}
            onChange={handleChange}
            className={`form-input ${errors.date_completed ? 'error' : ''}`}
          />
          {errors.date_completed && (
            <span className="error-message">{errors.date_completed}</span>
          )}
        </div>

        {/* Rating */}
        <div className="form-group">
          <label htmlFor="rating" className="form-label">
            Rating (0-5)
          </label>
          <div className="rating-input-group">
            <input
              type="number"
              id="rating"
              name="rating"
              min="0"
              max="5"
              step="0.5"
              value={formData.rating}
              onChange={handleChange}
              placeholder="Rate the book"
              className={`form-input ${errors.rating ? 'error' : ''}`}
            />
            <div className="rating-stars">
              {formData.rating && (
                <>
                  {[...Array(Math.floor(formData.rating))].map((_, i) => (
                    <span key={`full-${i}`}>⭐</span>
                  ))}
                  {formData.rating % 1 !== 0 && <span>✨</span>}
                </>
              )}
            </div>
          </div>
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Personal Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add your personal thoughts or notes..."
            className="form-textarea"
            rows="3"
          ></textarea>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-large">
            {book ? '💾 Update Book' : '➕ Add Book'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-large"
            onClick={onCancel}
          >
            ✕ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookForm;