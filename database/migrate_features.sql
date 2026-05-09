-- ============================================
-- Feature Migration: Shelves and Tags
-- Run this script in MySQL Workbench to add support for 
-- Custom Bookshelves and Mood-Based Tagging.
-- ============================================

-- 1. Create Shelves Table (User specific)
CREATE TABLE IF NOT EXISTS shelves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_shelf (user_id, name)
);

-- 2. Create Book_Shelves Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS book_shelves (
  book_id INT NOT NULL,
  shelf_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_id, shelf_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE
);

-- 3. Create Tags Table (Global unique tags)
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Book_Tags Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS book_tags (
  book_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Note: We do not need a column for cover_image_url in the books table 
-- because it already exists from the original setup.
