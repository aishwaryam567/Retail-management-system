-- Add missing password_hash column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make password_hash NOT NULL (you may need to update existing users first)
-- UPDATE users SET password_hash = 'temp_hash' WHERE password_hash IS NULL;
-- ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Optional: Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Test the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;