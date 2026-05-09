-- Migration: Add user_id column to books table
-- Run this if you already have an existing books table without user_id

USE book_tracker_db;

-- Add user_id column (nullable to preserve existing data)
ALTER TABLE books ADD COLUMN user_id INT NULL AFTER id;

-- Add foreign key
ALTER TABLE books ADD CONSTRAINT fk_books_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add index
ALTER TABLE books ADD INDEX idx_user_id (user_id);

-- Done! After registering your first user, update orphan books:
-- UPDATE books SET user_id = 1 WHERE user_id IS NULL;
