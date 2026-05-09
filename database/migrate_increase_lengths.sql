-- Migration: Increase column lengths for Google Books compatibility
-- Some Google Books data (especially genres and image URLs) can exceed standard VARCHAR limits

USE book_tracker_db;

-- Increase genre length
ALTER TABLE books MODIFY COLUMN genre VARCHAR(255);

-- Increase cover_image_url length (TEXT is safer for long URLs)
ALTER TABLE books MODIFY COLUMN cover_image_url TEXT;

-- Increase isbn length just in case
ALTER TABLE books MODIFY COLUMN isbn VARCHAR(50);

-- Increase google_books_id length
ALTER TABLE books MODIFY COLUMN google_books_id VARCHAR(150);

-- Update updated_at trigger if needed (MySQL handles this usually, but good to ensure)
-- ALTER TABLE books MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
