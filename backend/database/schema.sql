/**
 * Personal Book Tracker - Database Schema
 * Run this script to initialize the database
 */

-- Create Database
CREATE DATABASE IF NOT EXISTS book_tracker_db;
USE book_tracker_db;

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description LONGTEXT,
  cover_image_url VARCHAR(500),
  cover_image_data LONGBLOB,
  date_completed DATE,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rating INT CHECK (rating >= 0 AND rating <= 5),
  genre VARCHAR(100),
  reading_status ENUM('Reading', 'Completed', 'Wishlist') DEFAULT 'Wishlist',
  google_books_id VARCHAR(100),
  isbn VARCHAR(20),
  page_count INT,
  published_date VARCHAR(20),
  notes LONGTEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better query performance
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_genre (genre),
  INDEX idx_status (reading_status),
  INDEX idx_rating (rating),
  INDEX idx_date_completed (date_completed),
  FULLTEXT INDEX ft_title_author_description (title, author, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a table for future user authentication (optional)
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

-- Create a table for reading statistics (optional future feature)
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

-- Sample Data (optional)
INSERT INTO books (
  title, 
  author, 
  description, 
  cover_image_url, 
  date_completed, 
  rating, 
  genre, 
  reading_status, 
  isbn, 
  page_count, 
  published_date
) VALUES (
  'The Midnight Library',
  'Matt Haig',
  'A dazzling novel about all the choices that go into a life well lived - a novel of infinite possibilities and second chances.',
  'https://covers.openlibrary.org/b/id/8482276-M.jpg',
  '2024-01-15',
  5,
  'Fiction',
  'Completed',
  '9780525559474',
  288,
  '2020'
);

INSERT INTO books (
  title, 
  author, 
  description, 
  cover_image_url, 
  date_completed, 
  rating, 
  genre, 
  reading_status, 
  isbn, 
  page_count, 
  published_date
) VALUES (
  'Atomic Habits',
  'James Clear',
  'Transform your life and achieve your goals with tiny changes to your daily habits.',
  'https://covers.openlibrary.org/b/id/8373970-M.jpg',
  '2024-02-20',
  5,
  'Self-Help',
  'Completed',
  '9780735211292',
  320,
  '2018'
);

-- Verify schema creation
SHOW TABLES;
DESCRIBE books;