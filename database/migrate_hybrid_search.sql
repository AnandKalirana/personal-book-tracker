/**
 * Migration: Hybrid Search System
 * Creates book_cache table for preloaded + API-cached book data
 * Run: mysql -u root -p book_tracker_db < database/migrate_hybrid_search.sql
 */

USE book_tracker_db;

-- ============================================
-- Book Cache Table (Hybrid Search Layer)
-- ============================================
CREATE TABLE IF NOT EXISTS book_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Core metadata
  title VARCHAR(500) NOT NULL,
  author VARCHAR(500) NOT NULL,
  description LONGTEXT,
  cover_image_url TEXT,
  genres VARCHAR(500),
  isbn VARCHAR(20) DEFAULT NULL,
  page_count INT DEFAULT NULL,
  published_date VARCHAR(30) DEFAULT NULL,
  publisher VARCHAR(500) DEFAULT NULL,
  
  -- Source tracking
  source ENUM('preloaded', 'api') NOT NULL DEFAULT 'api',
  open_library_key VARCHAR(100) DEFAULT NULL,
  google_books_id VARCHAR(100) DEFAULT NULL,
  language VARCHAR(10) DEFAULT 'en',
  
  -- Quality & ranking
  quality_score TINYINT UNSIGNED DEFAULT 0,
  search_count INT UNSIGNED DEFAULT 0,
  
  -- Info link
  info_link TEXT DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Unique constraints for deduplication
  -- ISBN uniqueness (NULLs allowed — MySQL 8 permits multiple NULLs)
  UNIQUE KEY uq_book_cache_isbn (isbn),
  
  -- Composite uniqueness fallback for books without ISBN
  UNIQUE KEY uq_book_cache_title_author (title(150), author(150)),
  
  -- Indexes for fast search + filtering
  INDEX idx_book_cache_source (source),
  INDEX idx_book_cache_quality (quality_score DESC),
  INDEX idx_book_cache_search_count (search_count DESC),
  INDEX idx_book_cache_author (author(100)),
  INDEX idx_book_cache_genres (genres(100)),
  
  -- FULLTEXT index for hybrid search
  FULLTEXT INDEX ft_book_cache_search (title, author, description, genres)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify
DESCRIBE book_cache;
SELECT 'book_cache table created successfully' AS status;
