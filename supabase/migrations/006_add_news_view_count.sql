-- Add view_count column to news table
ALTER TABLE news ADD COLUMN view_count INT DEFAULT 0 NOT NULL;

-- Create index for sorting by views
CREATE INDEX idx_news_view_count ON news(view_count DESC);

-- Create function to increment view count (callable by anyone, no auth needed)
CREATE OR REPLACE FUNCTION increment_news_view(news_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE news
  SET view_count = view_count + 1
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anyone (including anon)
GRANT EXECUTE ON FUNCTION increment_news_view(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_news_view(UUID) TO authenticated;
