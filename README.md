# Litway Picks E-commerce

Storefront + admin dashboard for **Litway Picks**, a Liberian e-commerce
business. Customers shop, check out with **MTN Mobile Money (MoMo)**, and
track their orders; admins manage products, orders, customers, and site
settings.

Built on Next.js 16 (App Router), React 19, Supabase, and Tailwind 4.

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Route Handlers) |
| UI | React 19, Tailwind CSS 4, lucide-react, motion |
| State (client) | Zustand (cart, wishlist), TanStack Query (admin) |
| Auth & DB | Supabase (Postgres + Auth + RLS) |
| Payments | MTN MoMo Collection API |
| Email | Nodemailer (Gmail SMTP) |
| Notifications | sonner |
| Charts | recharts |

> ⚠️ This codebase pins **Next.js 16.x**, which has breaking changes from
> earlier versions (cookies, params, and route-handler signatures are now
> async). Before editing, read the relevant guide in
> `node_modules/next/dist/docs/` — see `AGENTS.md`.

---

## Prerequisites

- Node.js ≥ 20
- npm (or pnpm/yarn/bun)
- A Supabase project (URL + anon key + service-role key)
- An MTN MoMo Collection sandbox or production account
- A Gmail account with an [app password](https://support.google.com/accounts/answer/185833) for transactional email

---

## Local setup

```bash
# 1. Install deps
npm install

# 2. Create your local env file
cp .env.example .env.local   # or create .env — see "Environment variables" below

# 3. Apply database migrations to your Supabase project
#    (requires the Supabase CLI: https://supabase.com/docs/guides/cli)
supabase db push

# 4. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

The site is available at `/`; the admin dashboard at `/admin`. To access
admin routes you need a row in `public.users` with `role = 'admin'` for
your authenticated user.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint over the project |

---

## Environment variables

All of these are read at runtime. Names prefixed with `NEXT_PUBLIC_` are
exposed to the browser; everything else is **server-only** and must never
appear in client components.

### Required

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — **server only**, bypasses RLS |
| `NEXT_PUBLIC_BASE_URL` | Public site URL, e.g. `https://litwaypicks.com` |
| `MOMO_SUBSCRIPTION_KEY` | MTN MoMo subscription key (Collection product) |
| `MOMO_API_USER_ID` | MoMo API user UUID |
| `MOMO_API_KEY` | MoMo API key |
| `MOMO_ENVIRONMENT` | `sandbox` or `mtnliberia` |
| `MOMO_CALLBACK_SECRET` | HMAC secret for verifying webhook callbacks — **callback rejects all requests if missing** |
| `GMAIL_APP_USER` | Gmail address used as the SMTP sender |
| `GMAIL_APP_PASSWORD` | Gmail [app password](https://support.google.com/accounts/answer/185833) |

### Optional

| Variable | Default / notes |
|---|---|
| `MOMO_BASE_URL` | Overrides MoMo base URL; otherwise derived from `MOMO_ENVIRONMENT` |
| `MOMO_CALLBACK_URL` | Overrides webhook URL; otherwise `${NEXT_PUBLIC_BASE_URL}/api/momo/callback` |
| `NEXT_PUBLIC_SITE_URL` | Used in sitemap / canonical URLs |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | If using Cloudinary uploads |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary admin credentials |

---

## Database

Migrations live in `supabase/migrations/` and are applied with
`supabase db push`. The two current migrations:

- `20260324000000_get_product_stats.sql` — RPC for aggregated product stats used by the admin dashboard.
- `20260517000000_orders_user_id_and_disputed_status.sql` — adds `orders.user_id` (FK to `auth.users`), backfills legacy rows from `customer_email`, and enforces a unique index on `orders.external_id`.

Core tables expected:

- `users` — profile rows keyed to `auth.users.id`. Must include a `role` column (`'admin'` | `'customer'`).
- `products` — catalog (`price`, `sale_price`, `stock`, `image_urls`, etc.).
- `orders` — checkout records, payment state, line items (jsonb), delivery details.
- `notifications` — admin notification feed.
- `reviews`, `categories`, `wishlist` — supporting tables.

Row-Level Security is on for all customer-facing tables. Server actions
and route handlers use the service-role client (`lib/supabase/admin.js`)
only after they've validated the session.

---

## Project structure

```
app/
  (site)/                  Customer-facing routes (shop, cart, checkout, account, etc.)
  admin/                   Admin dashboard (products, orders, customers, settings)
  api/
    momo/                  MoMo payment route handlers
      pay/                   POST — initiate request-to-pay (auth required)
      status/[referenceId]/  GET  — poll transaction status
      callback/              POST — webhook (HMAC-verified)
      order/[referenceId]/   GET  — fetch order (owner or admin)
      transactions/         GET  — list orders (admin)
      balance/              GET  — merchant balance (admin)
      config/               GET  — public MoMo config sanity check
    orders/[id]/status/    PATCH — admin status mutator
  actions/                 Server actions (auth, products, orders, reviews, etc.)
components/                Reusable UI: admin, auth, products, common
hooks/                     TanStack Query hooks (admin dashboards)
lib/
  supabase/                Server, client, and admin Supabase factories
  momo/                    MoMo service + phone formatter
  api-auth.js              requireUserApi / requireAdminApi guards
  cart-context.jsx         Cart state (Zustand)
  email.js                 Nodemailer transactional templates
  notifications.js         Admin notification helpers
  session.js               getServerUser / requireAdmin
supabase/migrations/       SQL migrations
```

---

## Features

### Storefront
- Product catalog with filtering, search, categories, and per-product galleries.
- Cart (size/color variants), wishlist, account page with order history and product reviews.
- Checkout with MTN MoMo (single supported payment method).
- Real-time payment status polling + server-driven order confirmation page.

### Admin (`/admin`, role `admin` required)
- Products: CRUD, image upload, stock & pricing management.
- Categories.
- Customers: list, search, role management.
- Orders: filter by status, update status (PENDING / SUCCESSFUL / COMPLETED / FAILED / REFUNDED / DISPUTED).
- Settings: site / store configuration.
- Notifications: in-app feed for new orders, failures, low stock, disputes.

### Payments — MTN MoMo
The MoMo flow is intentionally defensive. Key invariants:

1. **`POST /api/momo/pay`** requires an authenticated session. It accepts
   item IDs + quantities only — **never trusts client-supplied prices,
   subtotals, or discounts**. The server re-fetches every product from
   the DB and recomputes the total. That total is what's sent to MoMo
   *and* what's persisted to the `orders` row.
2. **`processId` / `externalId`** is server-generated (`ORDER-<uuid>`)
   and constrained to be unique at the DB level — no collision risk.
3. **`POST /api/momo/callback`** rejects every request unless
   `MOMO_CALLBACK_SECRET` is set and the request carries a valid
   `x-momo-signature` HMAC over the raw body. On `SUCCESSFUL`, the
   callback also verifies that the paid amount and currency match the
   order — a mismatch records `DISPUTED`, never `SUCCESSFUL`.
4. **`GET /api/momo/status/[referenceId]`** performs the same amount/
   currency verification before transitioning an order. Terminal-status
   writes are gated on a prior `PENDING` state so concurrent polls and
   webhook callbacks can race without double-firing emails or
   notifications.
5. **`GET /api/momo/order/[referenceId]`** is owner-or-admin only.
   `/api/momo/transactions` and `/api/momo/balance` are admin-only.
6. **`PATCH /api/orders/[id]/status`** is admin-only.
7. Order ownership in `orders` is established via `user_id` (FK to
   `auth.users`). Legacy rows without `user_id` fall back to email
   match. The migration backfills `user_id` from `customer_email`.

### Email
Transactional emails (order placed, failed, completed, refunded,
password reset, etc.) are sent via Gmail SMTP through Nodemailer. See
`lib/email.js`.

---

## Deployment

The app is built for Vercel (or any Node-runtime Next.js host).

1. Push to your hosting provider.
2. Set every env var listed under **Environment variables** in the
   provider dashboard. `MOMO_CALLBACK_SECRET` is mandatory in
   production — the callback endpoint returns `500` without it.
3. In your MoMo developer portal, configure the webhook URL to
   `https://<your-domain>/api/momo/callback` and configure the same
   HMAC secret used here.
4. Run `supabase db push` against the production database.
5. Make sure your first admin user has `role = 'admin'` in
   `public.users` — there's no public signup for admin roles.

---

## License

Proprietary. © Litway Picks. Not for redistribution.
