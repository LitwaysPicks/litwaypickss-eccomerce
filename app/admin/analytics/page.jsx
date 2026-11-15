"use client";
import { useMemo, useState } from "react";
import { useCustomerAnalytics } from "@/hooks/useCustomerAnalytics";
import { formatCurrency } from "@/lib/currency";
import TrendChart from "@/components/Admin/Charts/TrendChart";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const PLATFORM_LABELS = { ios: "iPhone app", android: "Android app", web: "Website" };

const num = (v) => Number(v ?? 0).toLocaleString("en-US");
const pct = (v) => (v == null || !Number.isFinite(Number(v)) ? "—" : `${(Number(v) * 100).toFixed(Number(v) >= 0.1 ? 0 : 1)}%`);
const share = (part, whole) => (whole > 0 ? part / whole : null);

// ── Building blocks ─────────────────────────────────────────────────────────

function Stat({ label, value, hint, loading }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl bg-white p-5 ring-1 ring-gray-100">
      <p className="mb-3 text-[11px] font-semibold uppercase leading-none tracking-widest text-gray-400">{label}</p>
      <p className="text-[1.75rem] font-bold leading-none tracking-tight text-gray-900 tabular-nums">
        {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded-lg bg-gray-100" /> : value}
      </p>
      {hint && <p className="mt-3 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function Card({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{eyebrow}</p>
        {title && <p className="mt-1 text-sm font-semibold text-gray-900">{title}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty({ children = "No data yet for this period." }) {
  return <p className="py-8 text-center text-sm text-gray-400">{children}</p>;
}

/** Horizontal bar rows: label · bar · value. One hue; text carries the numbers. */
function BarRows({ rows, max, format = num }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key ?? r.label} title={`${r.label}: ${format(r.value)}${r.note ? ` (${r.note})` : ""}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-gray-700">{r.label}</span>
            <span className="shrink-0 font-semibold text-gray-900 tabular-nums">
              {format(r.value)}
              {r.note && <span className="ml-1.5 text-xs font-normal text-gray-500">{r.note}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-orange-500 transition-[width] duration-500"
              style={{ width: `${top > 0 ? Math.max((r.value / top) * 100, r.value > 0 ? 2 : 0) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RankTable({ rows, columns }) {
  if (!rows?.length) return <Empty />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-widest text-gray-400">
          <th className="pb-2 font-semibold">#</th>
          <th className="pb-2 font-semibold">Product</th>
          {columns.map((c) => (
            <th key={c.key} className="pb-2 text-right font-semibold">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((r, i) => (
          <tr key={r.id ?? i}>
            <td className="py-2.5 pr-3 text-gray-400 tabular-nums">{i + 1}</td>
            <td className="max-w-0 truncate py-2.5 pr-3 text-gray-900">{r.name}</td>
            {columns.map((c) => (
              <td key={c.key} className="py-2.5 text-right text-gray-900 tabular-nums">
                {(c.format ?? num)(r[c.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, error, isFetching } = useCustomerAnalytics(days);

  const k = data?.kpis ?? {};
  const funnel = data?.funnel ?? {};

  const daily = useMemo(
    () =>
      (data?.daily ?? []).map((d) => ({
        ...d,
        label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" }),
      })),
    [data?.daily],
  );

  const funnelRows = [
    { key: "visited", label: "Visited the app or website", value: funnel.visited ?? 0 },
    { key: "viewed", label: "Viewed a product", value: funnel.viewed ?? 0 },
    { key: "added", label: "Added to cart", value: funnel.added ?? 0 },
    { key: "checkout", label: "Started checkout", value: funnel.checkout ?? 0 },
    { key: "purchased", label: "Paid for an order", value: funnel.purchased ?? 0 },
  ].map((r) => ({ ...r, note: funnel.visited ? pct(share(r.value, funnel.visited)) : undefined }));

  const totalPlatformVisitors = (data?.platforms ?? []).reduce((s, p) => s + p.visitors, 0);
  const platformRows = (data?.platforms ?? []).map((p) => ({
    key: p.platform,
    label: PLATFORM_LABELS[p.platform] ?? p.platform,
    value: p.visitors,
    note: pct(share(p.visitors, totalPlatformVisitors)),
  }));

  const countyRows = (data?.counties ?? []).map((c) => ({ key: c.county, label: c.county, value: c.orders }));

  const conversion = share(k.buyers ?? 0, k.active_visitors ?? 0);
  const noTracking = data && !data.tracking_since;

  if (isError) {
    const msg = error?.message ?? "";
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-gray-900">Analytics couldn&apos;t load</p>
        <p className="mt-2 text-sm text-gray-500">
          {/function .*get_customer_analytics|could not find the function/i.test(msg)
            ? "The analytics database update hasn't been applied yet. Run the app_events_and_analytics migration in Supabase, then refresh."
            : msg || "Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + range */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer analytics</h1>
          <p className="mt-1 text-sm text-gray-500">How customers use the app and website, and how much of it turns into orders.</p>
        </div>
        <div className="inline-flex self-start rounded-lg bg-gray-100 p-1" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              aria-pressed={days === r.days}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === r.days ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {noTracking && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Activity tracking is set up but no visits have been recorded yet. Visitor, platform and funnel
          numbers start filling in once customers use the updated website and the new app release.
          Sales and customer figures below already include your full history.
        </div>
      )}

      <div className={`space-y-6 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {/* Usage KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Active visitors" value={num(k.active_visitors)} hint={`${num(k.active_today)} today`} loading={isLoading} />
          <Stat label="Signed-in users" value={num(k.active_signed_in)} hint="Active while logged in" loading={isLoading} />
          <Stat label="New sign-ups" value={num(k.new_signups)} hint={`${num(k.total_customers)} customers in total`} loading={isLoading} />
          <Stat label="Visitor → buyer" value={pct(conversion)} hint={`${num(k.buyers)} buyers`} loading={isLoading} />
        </div>

        {/* Sales KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Revenue" value={formatCurrency(k.revenue ?? 0)} hint={`${num(k.paid_orders)} paid orders`} loading={isLoading} />
          <Stat label="Avg order value" value={formatCurrency(k.avg_order_value ?? 0)} loading={isLoading} />
          <Stat label="Repeat customers" value={pct(k.repeat_rate)} hint="Of all buyers, ordered 2+ times" loading={isLoading} />
          <Stat
            label="Payment success"
            value={pct(k.payment_success_rate)}
            hint={`${num(k.failed_payments)} failed payments`}
            loading={isLoading}
          />
        </div>

        {/* Visitors trend */}
        <Card eyebrow="Daily active visitors" title={`Last ${days} days`}>
          {isLoading ? <div className="h-60 animate-pulse rounded-lg bg-gray-50" /> : <TrendChart data={daily} dataKey="visitors" unit="visitors" />}
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card eyebrow="Shopping funnel" title="Visitors reaching each step">
            {isLoading ? <div className="h-48 animate-pulse rounded-lg bg-gray-50" /> : funnel.visited ? <BarRows rows={funnelRows} /> : <Empty />}
          </Card>
          <Card eyebrow="App vs website" title="Where visitors come from">
            {isLoading ? (
              <div className="h-48 animate-pulse rounded-lg bg-gray-50" />
            ) : platformRows.length ? (
              <BarRows rows={platformRows} />
            ) : (
              <Empty />
            )}
            <div className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-900 tabular-nums">{num(k.app_devices)}</span> phones have the app with notifications on
              {(data?.app_devices_by_platform ?? []).length > 0 && (
                <span className="text-gray-500">
                  {" "}(
                  {data.app_devices_by_platform
                    .map((d) => `${num(d.devices)} ${d.platform === "ios" ? "iPhone" : d.platform === "android" ? "Android" : d.platform}`)
                    .join(", ")}
                  )
                </span>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card eyebrow="New sign-ups" title="Per day">
            {isLoading ? <div className="h-48 animate-pulse rounded-lg bg-gray-50" /> : <TrendChart data={daily} dataKey="signups" kind="bar" height={200} unit="sign-ups" />}
          </Card>
          <Card eyebrow="Paid orders" title="Per day">
            {isLoading ? <div className="h-48 animate-pulse rounded-lg bg-gray-50" /> : <TrendChart data={daily} dataKey="orders" kind="bar" height={200} unit="orders" />}
          </Card>
        </div>

        {/* Product interest */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card eyebrow="Most viewed" title="Product pages opened">
            <RankTable rows={data?.top_viewed} columns={[{ key: "views", label: "Views" }]} />
          </Card>
          <Card eyebrow="Best sellers" title="Units sold">
            <RankTable
              rows={data?.best_sellers}
              columns={[
                { key: "units", label: "Units" },
                { key: "revenue", label: "Revenue", format: (v) => formatCurrency(v ?? 0) },
              ]}
            />
          </Card>
          <Card eyebrow="Most wishlisted" title="All time">
            <RankTable rows={data?.most_wishlisted} columns={[{ key: "saves", label: "Saves" }]} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card eyebrow="Orders by county" title={`Last ${days} days`} className="lg:col-span-2">
            {countyRows.length ? <BarRows rows={countyRows} /> : <Empty />}
          </Card>
          <Card eyebrow="Needs attention">
            <dl className="space-y-4 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-gray-600">Carts left without ordering</dt>
                <dd className="font-semibold text-gray-900 tabular-nums">{num(k.abandoned_carts)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-gray-600">Failed payments</dt>
                <dd className="font-semibold text-gray-900 tabular-nums">{num(k.failed_payments)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-gray-600">New reviews</dt>
                <dd className="font-semibold text-gray-900 tabular-nums">
                  {num(data?.reviews?.count)}
                  {data?.reviews?.count > 0 && (
                    <span className="ml-1.5 text-xs font-normal text-gray-500">avg {Number(data.reviews.average).toFixed(1)} / 5</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
