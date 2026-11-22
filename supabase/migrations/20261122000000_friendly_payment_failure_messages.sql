-- Customer-friendly wording for failed payments in the app inbox.
-- Before: the raw MTN MoMo reason was shown ("PAYER_NOT_FOUND. Nothing was
-- charged."), and an amount mismatch (where the customer DID pay) wrongly said
-- "Nothing was charged". Safe to run more than once.

create or replace function public.describe_payment_failure(p_reason text, p_ref text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(p_reason, '') ilike 'amount mismatch%' then
      'We received a payment that doesn''t match the total for order ' || p_ref || '. Our team will contact you to sort it out.'
    when upper(coalesce(p_reason, '')) like '%NOT_ENOUGH_FUNDS%' then
      'Your MoMo balance wasn''t enough for order ' || p_ref || '. Nothing was charged. Top up and try again.'
    when upper(coalesce(p_reason, '')) like '%LIMIT%' then
      'This payment is over your MoMo transaction limit. Nothing was charged.'
    when upper(coalesce(p_reason, '')) ~ '(REJECT|DECLIN|CANCEL)' then
      'The payment was declined on your phone, so nothing was charged. You can try again anytime.'
    when upper(coalesce(p_reason, '')) ~ '(EXPIRE|TIMEOUT|TIMED OUT)' then
      'The MoMo prompt wasn''t approved in time, so nothing was charged. You can try again.'
    when upper(coalesce(p_reason, '')) like '%PAYER_NOT_FOUND%' then
      'That phone number isn''t registered for MTN MoMo. Nothing was charged.'
    else
      'Order ' || p_ref || ' wasn''t paid, so nothing was charged. You can try again.'
  end
$$;

-- Same trigger as 20260925000010_notifications_inbox.sql, with only the FAILED
-- body changed to use describe_payment_failure().
create or replace function public.notify_order_status()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  ref   text;
  head  text;
  t     text;
  b     text;
begin
  if new.user_id is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and new.payment_status is not distinct from old.payment_status then
    return new;
  end if;

  -- 'ORDER-0642ca57-…' -> '#0642CA57'
  head := split_part(new.external_id, '-', 1);
  if upper(head) = 'ORDER' then
    head := split_part(new.external_id, '-', 2);
  end if;
  ref := '#' || upper(head);

  case new.payment_status
    when 'PENDING' then
      t := 'Waiting for your payment';
      b := 'Approve the MoMo prompt on your phone to finish order ' || ref || '.';
    when 'SUCCESSFUL' then
      t := 'Payment received';
      b := 'Order ' || ref || ' is paid. We''re preparing it now.';
    when 'COMPLETED' then
      t := 'Order complete';
      b := 'Order ' || ref || ' is complete. Tell us how it was.';
    when 'FAILED' then
      t := 'Payment didn''t go through';
      b := public.describe_payment_failure(new.failure_reason, ref);
    when 'REFUNDED' then
      t := 'Order refunded';
      b := 'Order ' || ref || ' was refunded.';
    when 'DISPUTED' then
      t := 'Order in dispute';
      b := 'We''re looking into order ' || ref || '. We''ll be in touch.';
    else
      return new;
  end case;

  insert into public.notifications (user_id, kind, title, body, href, data, dedupe_key)
  values (
    new.user_id, 'order', t, b, '/order/' || new.id,
    jsonb_build_object('order_id', new.id, 'status', new.payment_status)
      || case when new.payment_status = 'PENDING' then jsonb_build_object('push', false) else '{}'::jsonb end,
    'order:' || new.id || ':' || new.payment_status
  )
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;

  return new;
end;
$$;

revoke execute on function public.notify_order_status() from public, anon, authenticated;

-- Reword failed-payment notifications already in customers' inboxes.
update public.notifications n
   set body = public.describe_payment_failure(
                o.failure_reason,
                '#' || upper(case when upper(split_part(o.external_id, '-', 1)) = 'ORDER'
                                  then split_part(o.external_id, '-', 2)
                                  else split_part(o.external_id, '-', 1) end))
  from public.orders o
 where n.kind = 'order'
   and n.data->>'status' = 'FAILED'
   and n.data->>'order_id' = o.id::text;
