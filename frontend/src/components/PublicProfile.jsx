import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import BookCard from './BookCard';
import './PublicProfile.css';

const PublicProfile = ({ username, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getPublicProfile(username);
        setProfile(response.data.profile);
        setBooks(response.data.books);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <div className="loading-spinner-container"><div className="spinner"></div></div>;
  if (error) return <div className="error-container"><h2>{error}</h2><button onClick={onBack}>Go Back</button></div>;

  return (
    <div className="public-profile-view">
      <header className="profile-header">
        <button className="back-btn" onClick={onBack}>← Back to Home</button>
        <div className="profile-info-card">
          <div className="profile-avatar-large">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-text">
            <h1 className="profile-username">{profile.username}'s Library</h1>
            <p className="profile-bio">{profile.bio || 'This user hasn\'t added a bio yet.'}</p>
            <div className="profile-meta-tags">
              <span className="meta-tag">📚 {books.length} Books</span>
              <span className="meta-tag">🗓 Joined {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="profile-collection">
        <h2 className="section-title">Public Collection</h2>
        <div className="book-list">
          {books.length > 0 ? (
            books.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                isReadOnly={true} 
              />
            ))
          ) : (
            <p className="no-books">No public books found in this collection.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicProfile;
