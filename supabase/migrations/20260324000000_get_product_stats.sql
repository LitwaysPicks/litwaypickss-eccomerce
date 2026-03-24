-- Run this in your Supabase SQL editor or via: supabase db push
-- Aggregates product stats server-side so the admin dashboard never pulls
-- thousands of rows to the browser just to count/sum them.

CREATE OR REPLACE FUNCTION get_product_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_products', COUNT(*),
    'inventory_value', COALESCE(SUM(price * stock), 0),
    'low_stock',       COUNT(*) FILTER (WHERE stock > 0 AND stock <= 10),
    'out_of_stock',    COUNT(*) FILTER (WHERE stock = 0),
    'featured',        COUNT(*) FILTER (WHERE featured = true),
    'average_price',   COALESCE(AVG(price), 0)
  )
  FROM products;
$$;
