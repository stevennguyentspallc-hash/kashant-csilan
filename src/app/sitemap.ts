import { MetadataRoute } from "next";

const BASE_URL = "https://kashant-csilan.vercel.app";

const STATIC_ROUTES = [
  { url: "/",          priority: 1.0,  changeFrequency: "weekly"  },
  { url: "/products",  priority: 0.9,  changeFrequency: "daily"   },
  { url: "/about",     priority: 0.7,  changeFrequency: "monthly" },
  { url: "/gallery",   priority: 0.6,  changeFrequency: "weekly"  },
  { url: "/contact",   priority: 0.8,  changeFrequency: "monthly" },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ url, priority, changeFrequency }) => ({
    url:              `${BASE_URL}${url}`,
    lastModified:     new Date(),
    changeFrequency,
    priority,
  }));

  // Dynamic product pages - fetch from Supabase
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=slug,updated_at&is_active=eq.true`,
      {
        headers: {
          apikey:        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        next: { revalidate: 3600 },
      }
    );
    const products = await res.json();
    productPages = (products ?? []).map((p: { slug: string; updated_at: string }) => ({
      url:              `${BASE_URL}/products/${p.slug}`,
      lastModified:     new Date(p.updated_at),
      changeFrequency:  "weekly" as const,
      priority:         0.8,
    }));
  } catch {
    // fallback: no product pages
  }

  return [...staticPages, ...productPages];
}
