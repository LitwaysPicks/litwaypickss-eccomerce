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
