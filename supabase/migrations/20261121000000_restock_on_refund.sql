-- Put stock back when a paid order is refunded (or marked failed), and take it
-- out again if the order is moved back to a paid status.
-- Builds on 20261115000000_product_visibility_and_stock.sql. Safe to run more than once.

alter table public.orders
  add column if not exists stock_restocked_at timestamptz;

-- Deduct: runs when the order is (or becomes again) paid. Skips orders whose
-- stock is already out; re-deducts an order that was restocked earlier.
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
     set stock_deducted_at = now(),
         stock_restocked_at = null
   where id::text = p_order_id
     and (stock_deducted_at is null or stock_restocked_at is not null)
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

-- Restock: returns each item's quantity, but only for an order whose stock
-- was actually deducted and hasn't been returned yet. A repeat call is a no-op.
create or replace function public.restock_order(p_order_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
begin
  update public.orders
     set stock_restocked_at = now()
   where id::text = p_order_id
     and stock_deducted_at is not null
     and stock_restocked_at is null
  returning items::jsonb into v_items;

  if not found then
    return;
  end if;

  update public.products p
     set stock = p.stock + x.qty
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
revoke all on function public.restock_order(text) from public, anon, authenticated;
grant execute on function public.restock_order(text) to service_role;
