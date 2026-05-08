ALTER TABLE categories
ADD COLUMN IF NOT EXISTS main_category TEXT;

UPDATE categories
SET main_category = CASE
  WHEN LOWER(TRIM(name)) IN ('elkoep timers/relays', 'elkoep wired', 'elkoep wireless') THEN 'ElkoEP'
  WHEN main_category IS NULL OR BTRIM(main_category) = '' THEN name
  ELSE main_category
END;

ALTER TABLE categories
ALTER COLUMN main_category SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_categories_main_category ON categories (main_category);
