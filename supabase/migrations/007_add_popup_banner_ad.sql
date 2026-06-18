-- Add popup_banner as a valid ad position
-- Note: position is a TEXT column, so no enum change needed
-- Just need to enforce single active ad for bottom_nav and popup_banner

-- Create function to enforce single active ad per exclusive position
CREATE OR REPLACE FUNCTION enforce_single_active_ad()
RETURNS TRIGGER AS $$
BEGIN
  -- For bottom_nav and popup_banner, only one active ad allowed
  IF NEW.is_active = true AND NEW.position IN ('bottom_nav', 'popup_banner') THEN
    -- Deactivate any existing active ads for this position
    UPDATE ads
    SET is_active = false
    WHERE position = NEW.position
      AND is_active = true
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for single active ad enforcement
CREATE TRIGGER trigger_single_active_ad
  BEFORE INSERT OR UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION enforce_single_active_ad();
