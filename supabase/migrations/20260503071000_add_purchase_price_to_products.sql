ALTER TABLE products
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10, 2);

UPDATE products
SET purchase_price = base_price
WHERE purchase_price IS NULL;

ALTER TABLE products
ALTER COLUMN purchase_price SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_purchase_price_check'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_purchase_price_check CHECK (purchase_price >= 0);
  END IF;
END $$;
