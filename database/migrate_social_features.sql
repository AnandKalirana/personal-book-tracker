-- Migration: Add Social Features support
USE book_tracker_db;

-- 1. Allow users to set profile to public/private
ALTER TABLE users 
ADD COLUMN is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN bio TEXT,
ADD COLUMN avatar_url TEXT;

-- 2. Create index for faster user searching
CREATE INDEX idx_username ON users(username);
