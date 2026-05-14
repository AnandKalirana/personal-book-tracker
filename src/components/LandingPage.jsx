/**
 * LandingPage Component — Professional SaaS-style landing page
 */
import './LandingPage.css';

function LandingPage({ onNavigate }) {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav" id="landing-nav">
        <div className="landing-logo">
          <span className="landing-logo-icon">📚</span>
          <span className="landing-logo-text">BookTracker</span>
        </div>
        <div className="landing-nav-actions">
          <button className="btn-nav-login" onClick={() => onNavigate('login')}>
            Log In
          </button>
          <button className="btn-nav-signup" onClick={() => onNavigate('register')}>
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero" id="hero">
        <span className="hero-badge">✨ Your personal reading companion</span>
        <h1 className="hero-title">
          Track Your Reading<br />
          <span className="hero-title-gradient">Journey Beautifully</span>
        </h1>
        <p className="hero-subtitle">
          Organize your library, discover new books, track your progress, and connect
          with fellow readers — all in one beautiful, modern app.
        </p>
        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={() => onNavigate('register')}>
            Get Started — It's Free
          </button>
          <button className="btn-hero-secondary" onClick={() => onNavigate('login')}>
            I Have an Account
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">10K+</div>
            <div className="hero-stat-label">Books Tracked</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">2K+</div>
            <div className="hero-stat-label">Active Readers</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">500+</div>
            <div className="hero-stat-label">Curated Picks</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="section-header">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need to manage your reading</h2>
          <p className="section-subtitle">
            Powerful tools designed for avid readers who want to make the most of every book.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">📖</div>
            <h3 className="feature-title">Smart Book Tracking</h3>
            <p className="feature-desc">Track what you're reading, what you've finished, and what's on your wishlist with beautiful visual cards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-blue">🔍</div>
            <h3 className="feature-title">Instant Search & Discovery</h3>
            <p className="feature-desc">Search from thousands of books powered by our hybrid engine. Find any book instantly with smart results.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-green">📊</div>
            <h3 className="feature-title">Reading Analytics</h3>
            <p className="feature-desc">Visualize your reading habits with beautiful charts. Track pages read, genres explored, and monthly trends.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-orange">📚</div>
            <h3 className="feature-title">Custom Shelves & Tags</h3>
            <p className="feature-desc">Organize books your way with custom shelves and mood-based tags for the perfect personal library.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-red">⭐</div>
            <h3 className="feature-title">Ratings & Reviews</h3>
            <p className="feature-desc">Rate books, write notes, and keep a personal journal of your reading experiences.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-teal">👥</div>
            <h3 className="feature-title">Social Profiles</h3>
            <p className="feature-desc">Share your reading journey with a public profile. Discover what other readers are enjoying.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials" id="testimonials">
        <div className="section-header">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">Loved by readers everywhere</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"Finally an app that makes tracking books a joy. The search is incredibly fast and the UI is gorgeous."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">SR</div>
              <div>
                <div className="testimonial-name">Sarah R.</div>
                <div className="testimonial-role">Avid Reader, 200+ books</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"The analytics dashboard is amazing. I can actually see my reading habits and set better goals."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">MK</div>
              <div>
                <div className="testimonial-name">Marcus K.</div>
                <div className="testimonial-role">Book Club Leader</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"I love the custom shelves feature. Organizing my library has never been this easy and beautiful."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">AP</div>
              <div>
                <div className="testimonial-name">Anika P.</div>
                <div className="testimonial-role">Literature Student</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <h2 className="cta-title">Start your reading journey today</h2>
        <p className="cta-subtitle">Join thousands of readers who track, discover, and enjoy books with BookTracker.</p>
        <button className="btn-hero-primary" onClick={() => onNavigate('register')}>
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <span className="footer-text">© 2025 BookTracker. Made with ❤️ for readers.</span>
          <div className="footer-links">
            <button className="footer-link" onClick={() => onNavigate('login')}>Log In</button>
            <button className="footer-link" onClick={() => onNavigate('register')}>Sign Up</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
