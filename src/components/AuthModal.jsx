/**
 * AuthModal Component
 * Login/Signup modal with toggle between modes
 */

import { useState } from 'react';
import ApiService from '../services/api';
import './AuthModal.css';

function AuthModal({ onAuthSuccess, initialMode = 'login', onNavigate }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
    setSuccessMessage('');
  };

  const validate = () => {
    const newErrors = {};
    if (mode === 'register') {
      if (!formData.username.trim() || formData.username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
        newErrors.username = 'Username can only contain letters, numbers and underscores';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'A valid email is required';
    }

    if (mode !== 'forgot') {
      const password = formData.password;
      if (!password || password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (mode === 'register') {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      if (mode === 'forgot') {
        const response = await ApiService.forgotPassword(formData.email.trim().toLowerCase());
        setSuccessMessage(response.message);
      } else if (mode === 'register') {
        const response = await ApiService.register(
          formData.username.trim(),
          formData.email.trim().toLowerCase(),
          formData.password
        );
        onAuthSuccess(response.data.user);
      } else {
        const response = await ApiService.login(
          formData.email.trim().toLowerCase(),
          formData.password
        );
        onAuthSuccess(response.data.user);
      }
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setApiError('');
    setSuccessMessage('');
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    // Update hash when switching modes
    if (onNavigate && (newMode === 'login' || newMode === 'register')) {
      onNavigate(newMode);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">📚</span>
            <h1 className="auth-logo-text">Book Tracker</h1>
          </div>
          <p className="auth-subtitle">
            {mode === 'login' && 'Welcome back! Sign in to continue'}
            {mode === 'register' && 'Create an account to start tracking'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
              type="button"
            >
              Sign Up
            </button>
          </div>
        )}

        {apiError && (
          <div className="auth-error">{apiError}</div>
        )}

        {successMessage && (
          <div className="auth-success">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-username">Username</label>
              <input
                type="text"
                id="auth-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                autoComplete="username"
              />
              {errors.username && <span className="auth-field-error">{errors.username}</span>}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              type="email"
              id="auth-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          {mode !== 'forgot' && (
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    className="auth-link-btn"
                    onClick={() => switchMode('forgot')}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                id="auth-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={mode === 'register' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              {errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>
          )}

          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="auth-confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner"></span>
                {mode === 'login' ? 'Signing in...' : mode === 'forgot' ? 'Sending link...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Send Reset Link' : 'Create Account'
            )}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'forgot' ? (
            <button type="button" className="auth-switch-btn" onClick={() => switchMode('login')}>
              ← Back to Sign In
            </button>
          ) : (
            <>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" className="auth-switch-btn" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </>
          )}
        </p>
        {onNavigate && (
          <p className="auth-switch" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="auth-switch-btn" onClick={() => onNavigate('landing')}>
              ← Back to Home
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
