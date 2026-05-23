-- Add subcategory_id column to news table
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
