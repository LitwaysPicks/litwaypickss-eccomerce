-- 1) Hide products instead of deleting them
-- 2) Deduct stock once an order is paid
--
-- Safe to run more than once.

-- ─── 1. Product visibility ──────────────────────────────────────────────────

alter table public.products
  add column if not exists is_hidden boolean not null default false;

create index if not exists products_is_hidden_idx
  on public.products (is_hidden) where is_hidden;

-- Hidden products are invisible to everyone except admins. This is a
-- RESTRICTIVE policy, so it is ANDed with whatever SELECT policies already
-- exist rather than replacing them. Enforcing it in the database (not in app
-- code) means app builds already installed on customers' phones stop showing
-- hidden products too.
drop policy if exists products_hide_hidden_from_customers on public.products;
create policy products_hide_hidden_from_customers
  on public.products
  as restrictive
  for select
  to public
  using (not is_hidden or (select public.is_admin()));

-- The catalog view must run with the caller's permissions so the policy above
-- applies to it as well (by default a view runs as its owner and skips RLS).
-- anon/authenticated can already read products and categories directly.
alter view public.products_with_categories set (security_invoker = true);

-- ─── 2. Stock deduction after purchase ──────────────────────────────────────

alter table public.orders
  add column if not exists stock_deducted_at timestamptz;

-- Deducts each item's quantity from products.stock exactly once per order.
-- The stock_deducted_at stamp makes a second call (payment callback and
-- status poll racing each other) a no-op. Stock never goes below zero.
create or replace function public.deduct_stock_for_order(p_order_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
begin
  update public.orders
     set stock_deducted_at = now()
   where id::text = p_order_id
     and stock_deducted_at is null
  returning items::jsonb into v_items;

  if not found then
    return;
  end if;

  update public.products p
     set stock = greatest(p.stock - x.qty, 0)
    from (
      select it->>'id' as product_id,
             sum(greatest(coalesce((it->>'quantity')::int, 1), 0)) as qty
        from jsonb_array_elements(coalesce(v_items, '[]'::jsonb)) as it
       group by 1
    ) x
   where p.id::text = x.product_id;
end;
$$;

revoke all on function public.deduct_stock_for_order(text) from public, anon, authenticated;
grant execute on function public.deduct_stock_for_order(text) to service_role;
