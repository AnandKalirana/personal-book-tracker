/**
 * Personal Book Tracker - Database Schema
 * Run this script to initialize the database
 */

-- Create Database
CREATE DATABASE IF NOT EXISTS book_tracker_db;
USE book_tracker_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  profile_image_url VARCHAR(500),
  theme_preference ENUM('light', 'dark') DEFAULT 'light',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Books Table (with user_id foreign key)
CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description LONGTEXT,
  cover_image_url TEXT,
  cover_image_data LONGBLOB,
  date_completed DATE,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rating INT CHECK (rating >= 0 AND rating <= 5),
  genre VARCHAR(255),
  reading_status ENUM('Reading', 'Completed', 'Wishlist') DEFAULT 'Wishlist',
  google_books_id VARCHAR(150),
  isbn VARCHAR(50),
  page_count INT,
  published_date VARCHAR(20),
  notes LONGTEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key to users
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for better query performance
  INDEX idx_user_id (user_id),
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_genre (genre),
  INDEX idx_status (reading_status),
  INDEX idx_rating (rating),
  INDEX idx_date_completed (date_completed),
  FULLTEXT INDEX ft_title_author_description (title, author, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reading Stats Table (optional)
CREATE TABLE IF NOT EXISTS reading_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  books_read INT DEFAULT 0,
  total_pages INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify schema creation
SHOW TABLES;
DESCRIBE books;
DESCRIBE users;
