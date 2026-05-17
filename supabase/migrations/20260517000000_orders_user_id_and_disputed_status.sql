-- Adds a user_id FK to the orders table so order ownership is verifiable
-- against auth.users instead of relying on client-supplied customer_email.
-- Also backfills legacy rows by matching on lowercased email.
--
-- Run via: supabase db push

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Backfill: link existing rows whose customer_email matches a known auth user
UPDATE orders o
SET user_id = u.id
FROM auth.users u
WHERE o.user_id IS NULL
  AND o.customer_email IS NOT NULL
  AND lower(o.customer_email) = lower(u.email);

-- external_id is now server-generated (uuid-suffixed). Enforce uniqueness so
-- the callback handler can never co-update two rows that happen to share
-- a legacy `ORDER-<timestamp>` value.
-- Disambiguate any pre-existing duplicates first by suffixing the row id,
-- otherwise the unique index creation will fail.
UPDATE orders
SET external_id = external_id || '-' || id::text
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY created_at) AS rn
    FROM orders
    WHERE external_id IS NOT NULL
  ) t
  WHERE t.rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_external_id_unique
  ON orders(external_id)
  WHERE external_id IS NOT NULL;
