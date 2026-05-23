-- Add is_pinned column to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Create index for better query performance on pinned news
CREATE INDEX IF NOT EXISTS idx_news_is_pinned ON news(is_pinned);

-- Update RLS policy to allow pinned news to be queried
-- No changes needed as existing policies allow querying published news
