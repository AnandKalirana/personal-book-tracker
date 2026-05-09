/**
 * Header Component
 * Sticky header with logo, nav, user info, dark mode toggle
 */

import './Header.css';

function Header({ darkMode, onToggleDarkMode, user, onLogout, children }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">📚</span>
            <span className="logo-text">Book Tracker</span>
          </div>
        </div>

        <div className="header-center">
          {children}
        </div>

        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user && (
            <div className="user-menu">
              <div className="user-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button
                className="logout-btn"
                onClick={onLogout}
                title="Sign out"
              >
                ⏏ Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;