-- Migration script to change image columns from TEXT to LONGTEXT
-- Run this if you already have tables created

ALTER TABLE baskets MODIFY COLUMN image_url LONGTEXT;
ALTER TABLE merchants MODIFY COLUMN logo_url LONGTEXT;
ALTER TABLE merchants MODIFY COLUMN cover_image_url LONGTEXT;
ALTER TABLE users MODIFY COLUMN profile_image_url LONGTEXT;
