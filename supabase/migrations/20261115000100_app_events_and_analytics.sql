-- Customer activity tracking + the admin Analytics page query.
-- Safe to run more than once.

-- ─── 1. Activity events ─────────────────────────────────────────────────────
-- One row per meaningful customer action from the mobile app or website.
-- Purchases are NOT logged here: they're read straight from paid orders, which
-- can't be faked from a client.
--
-- anon_id is a random id generated on the device/browser (no personal data).
-- user_id is filled in when the customer is signed in.

create table if not exists public.app_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  event       text not null check (event in ('app_open', 'product_view', 'add_to_cart', 'checkout_start')),
  platform    text not null check (platform in ('ios', 'android', 'web')),
  anon_id     text not null check (char_length(anon_id) between 8 and 64),
  user_id     uuid references auth.users (id) on delete set null,
  product_id  text check (product_id is null or char_length(product_id) <= 128)
);

create index if not exists app_events_created_at_idx on public.app_events (created_at);
create index if not exists app_events_event_created_at_idx on public.app_events (event, created_at);

alter table public.app_events enable row level security;

-- Anyone may record an event, but only as themselves (or anonymously).
-- There is deliberately no SELECT policy: customers can't read events;
-- the admin page reads aggregates through get_customer_analytics() below.
drop policy if exists app_events_insert_own on public.app_events;
create policy app_events_insert_own
  on public.app_events
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

grant insert on public.app_events to anon, authenticated;

-- ─── 2. Analytics for the admin page ────────────────────────────────────────

create or replace function public.get_customer_analytics(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 30), 1), 365);
  v_today timestamptz := date_trunc('day', now());
  v_from timestamptz := date_trunc('day', now()) - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365) - 1);
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return (
    with
    -- A "visitor" is one device/browser (anon_id).
    ev as (
      select * from public.app_events where created_at >= v_from
    ),
    paid as (
      select o.*,
             coalesce(o.user_id::text, lower(o.customer_email)) as buyer,
             case when jsonb_typeof(o.items::jsonb) = 'array' then o.items::jsonb else '[]'::jsonb end as items_arr
        from public.orders o
       where o.payment_status in ('SUCCESSFUL', 'COMPLETED')
    ),
    paid_r as (
      select * from paid where created_at >= v_from
    ),
    attempts as (
      select payment_status from public.orders
       where created_at >= v_from
         and payment_status in ('SUCCESSFUL', 'COMPLETED', 'FAILED', 'REFUNDED')
    ),
    buyers_all as (
      select buyer, count(*) as n from paid group by buyer
    ),
    days as (
      select generate_series(v_from, v_today, interval '1 day') as d
    )
    select jsonb_build_object(
      'days', v_days,
      'tracking_since', (select min(created_at) from public.app_events),

      'kpis', jsonb_build_object(
        'active_visitors',      (select count(distinct anon_id) from ev),
        'active_today',         (select count(distinct anon_id) from ev where created_at >= v_today),
        'active_signed_in',     (select count(distinct user_id) from ev where user_id is not null),
        'new_signups',          (select count(*) from public.users where created_at >= v_from and coalesce(role, 'customer') <> 'admin'),
        'total_customers',      (select count(*) from public.users where coalesce(role, 'customer') <> 'admin'),
        'buyers',               (select count(distinct buyer) from paid_r),
        'paid_orders',          (select count(*) from paid_r),
        'revenue',              (select coalesce(sum(final_total), 0) from paid_r),
        'avg_order_value',      (select coalesce(round(avg(final_total)::numeric, 2), 0) from paid_r),
        'repeat_rate',          (select case when count(*) = 0 then 0
                                             else round(count(*) filter (where n >= 2)::numeric / count(*), 4) end
                                   from buyers_all),
        'payment_success_rate', (select case when count(*) = 0 then null
                                             else round(count(*) filter (where payment_status <> 'FAILED')::numeric / count(*), 4) end
                                   from attempts),
        'failed_payments',      (select count(*) from attempts where payment_status = 'FAILED'),
        'app_devices',          (select count(distinct token) from public.push_tokens),
        'abandoned_carts',      (select count(*) from public.carts c
                                  where jsonb_typeof(c.items::jsonb) = 'array'
                                    and jsonb_array_length(c.items::jsonb) > 0
                                    and c.updated_at >= v_from
                                    and not exists (
                                      select 1 from paid o
                                       where o.user_id = c.user_id and o.created_at >= c.updated_at
                                    ))
      ),

      'daily', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'date',     to_char(d, 'YYYY-MM-DD'),
                 'visitors', (select count(distinct anon_id) from ev
                               where created_at >= d and created_at < d + interval '1 day'),
                 'signups',  (select count(*) from public.users u
                               where u.created_at >= d and u.created_at < d + interval '1 day'
                                 and coalesce(u.role, 'customer') <> 'admin'),
                 'orders',   (select count(*) from paid_r
                               where created_at >= d and created_at < d + interval '1 day'),
                 'revenue',  (select coalesce(sum(final_total), 0) from paid_r
                               where created_at >= d and created_at < d + interval '1 day')
               ) order by d), '[]'::jsonb)
          from days
      ),

      'platforms', (
        select coalesce(jsonb_agg(jsonb_build_object('platform', platform, 'visitors', n) order by n desc), '[]'::jsonb)
          from (select platform, count(distinct anon_id) as n from ev group by platform) x
      ),

      -- Distinct visitors reaching each step; the last step is real buyers.
      'funnel', jsonb_build_object(
        'visited',   (select count(distinct anon_id) from ev),
        'viewed',    (select count(distinct anon_id) from ev where event = 'product_view'),
        'added',     (select count(distinct anon_id) from ev where event = 'add_to_cart'),
        'checkout',  (select count(distinct anon_id) from ev where event = 'checkout_start'),
        'purchased', (select count(distinct buyer) from paid_r)
      ),

      'top_viewed', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'id', x.product_id, 'name', coalesce(p.name, x.product_id), 'views', x.n, 'visitors', x.v
               ) order by x.n desc), '[]'::jsonb)
          from (select product_id, count(*) as n, count(distinct anon_id) as v
                  from ev where event = 'product_view' and product_id is not null
                 group by product_id order by count(*) desc limit 8) x
          left join public.products p on p.id::text = x.product_id
      ),

      'best_sellers', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'id', x.pid, 'name', coalesce(p.name, x.item_name, x.pid), 'units', x.units, 'revenue', x.revenue
               ) order by x.units desc), '[]'::jsonb)
          from (select it->>'id' as pid,
                       max(it->>'name') as item_name,
                       sum(coalesce((it->>'quantity')::int, 1)) as units,
                       round(sum(coalesce((it->>'price')::numeric, 0) * coalesce((it->>'quantity')::int, 1)), 2) as revenue
                  from paid_r, jsonb_array_elements(paid_r.items_arr) as it
                 group by it->>'id' order by 3 desc limit 8) x
          left join public.products p on p.id::text = x.pid
      ),

      'most_wishlisted', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'id', x.pid, 'name', coalesce(p.name, x.pid), 'saves', x.n
               ) order by x.n desc), '[]'::jsonb)
          from (select product_id::text as pid, count(*) as n
                  from public.wishlists group by product_id order by count(*) desc limit 8) x
          left join public.products p on p.id::text = x.pid
      ),

      'counties', (
        select coalesce(jsonb_agg(jsonb_build_object('county', county, 'orders', n) order by n desc), '[]'::jsonb)
          from (select coalesce(nullif(trim(delivery_state), ''), nullif(trim(delivery_city), ''), 'Unknown') as county,
                       count(*) as n
                  from paid_r group by 1 order by 2 desc limit 15) x
      ),

      'reviews', (
        select jsonb_build_object('count', count(*), 'average', coalesce(round(avg(rating)::numeric, 2), 0))
          from public.reviews where created_at >= v_from
      ),

      'app_devices_by_platform', (
        select coalesce(jsonb_agg(jsonb_build_object('platform', platform, 'devices', n) order by n desc), '[]'::jsonb)
          from (select coalesce(platform, 'unknown') as platform, count(*) as n
                  from public.push_tokens group by 1) x
      )
    )
  );
end;
$$;

revoke all on function public.get_customer_analytics(integer) from public, anon;
grant execute on function public.get_customer_analytics(integer) to authenticated;
