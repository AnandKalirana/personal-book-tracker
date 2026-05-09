-- Migration: Add password reset token support
USE book_tracker_db;

ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255),
ADD COLUMN reset_token_expiry DATETIME;
