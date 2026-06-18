-- Enforce single active ad for bottom_nav position
-- When a new bottom_nav ad is set active, automatically deactivate the previous one

CREATE OR REPLACE FUNCTION enforce_single_active_ad()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND NEW.position = 'bottom_nav' THEN
    UPDATE ads
    SET is_active = false
    WHERE position = 'bottom_nav'
      AND is_active = true
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_active_ad
  BEFORE INSERT OR UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION enforce_single_active_ad();
