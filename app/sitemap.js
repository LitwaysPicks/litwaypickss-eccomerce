import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://litwaypicks.com";

const STATIC_ROUTES = [
  { path: "", priority: 1.0 },
  { path: "/shop", priority: 0.9 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/shipping", priority: 0.5 },
  { path: "/returns", priority: 0.5 },
  { path: "/privacy", priority: 0.4 },
  { path: "/terms", priority: 0.4 },
];

export default async function sitemap() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at"),
    supabase.from("categories").select("slug"),
  ]);

  const staticUrls = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    priority,
  }));

  const productUrls = (products ?? []).map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    priority: 0.8,
  }));

  const categoryUrls = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/shop/${c.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [...staticUrls, ...productUrls, ...categoryUrls];
}
