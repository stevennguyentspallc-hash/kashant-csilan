import Link from "next/link";
import { ArrowRight, Truck, Shield, Award, Headphones } from "lucide-react";
import { getFeaturedProducts, getCategories } from "@/lib/supabase/queries";
import ProductCard from "@/components/products/ProductCard";

const CATEGORY_ICONS: Record<string, string> = {
  "pedicure-chairs":     "💺",
  "manicure-tables":     "🪑",
  "reception-desks":     "🗃️",
  "salon-chairs":        "💈",
  "nail-dryer-stations": "💨",
  "spa-beds":            "🛏️",
  "polish-rack-cabinet": "🗄️",
  "padset":              "🪆",
};

const STATIC_CATEGORIES = [
  { name: "Pedicure Chairs",     slug: "pedicure-chairs" },
  { name: "Manicure Tables",     slug: "manicure-tables" },
  { name: "Reception Desks",     slug: "reception-desks" },
  { name: "Salon Chairs",        slug: "salon-chairs" },
  { name: "Nail Dryer Stations", slug: "nail-dryer-stations" },
  { name: "Spa Beds",            slug: "spa-beds" },
  { name: "Polish Rack Cabinet", slug: "polish-rack-cabinet" },
  { name: "Padset",              slug: "padset" },
];

const WHY_US = [
  {
    icon: Truck,
    title: "Nationwide Freight",
    desc: "White-glove delivery to all 50 states with real-time tracking.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Commercial-grade materials built to last in high-traffic salons.",
  },
  {
    icon: Shield,
    title: "Warranty Protected",
    desc: "Every piece backed by our comprehensive warranty program.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    desc: "Bilingual support team available 6 days a week.",
  },
];

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [featuredProducts, categories] = await Promise.all([
      getFeaturedProducts(),
      getCategories(),
    ]);
  } catch {
    // DB not yet seeded — render static fallback
  }

  const displayCategories =
    categories.length > 0 ? categories : STATIC_CATEGORIES;

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-charcoal-900 overflow-hidden">
        {/* Gradient overlay as fallback bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-[#2a2010]" />

        {/* Decorative gold line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-gold-400 to-transparent opacity-40" />

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-6">
            Kashant C-Silan LLC
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight max-w-3xl">
            Elevate Your Salon.<br />
            <span className="text-gold-400">Elevate Your Brand.</span>
          </h1>
          <p className="mt-6 text-white/60 text-lg max-w-xl leading-relaxed">
            Premium nail salon furniture engineered for the modern US salon.
            From pedicure thrones to reception desks — every piece tells a
            story of luxury.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-400 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full font-medium"
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white text-sm tracking-widest uppercase hover:border-gold-400 hover:text-gold-400 transition-colors rounded-full"
            >
              Contact Us
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-20 flex flex-wrap gap-10">
            {[
              { value: "500+", label: "Salons Served" },
              { value: "50",   label: "States Covered" },
              { value: "8",    label: "Product Lines" },
              { value: "1-Day",label: "Quote Response" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-serif text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ────────────────────────────────────────── */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">
            Our Collections
          </p>
          <h2 className="font-serif text-4xl font-bold text-center text-charcoal-900 mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group bg-white rounded-2xl p-6 text-center hover:shadow-md transition-all border border-cream-100 hover:border-gold-400"
              >
                <span className="text-3xl block mb-3">
                  {CATEGORY_ICONS[cat.slug] ?? "🪑"}
                </span>
                <p className="font-medium text-sm text-charcoal-900 group-hover:text-gold-500 transition-colors">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">
              Editor&apos;s Pick
            </p>
            <h2 className="font-serif text-4xl font-bold text-center text-charcoal-900 mb-12">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 border border-charcoal-900 text-charcoal-900 text-sm tracking-widest uppercase hover:bg-charcoal-900 hover:text-white transition-colors rounded-full"
              >
                View All Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY CHOOSE US ─────────────────────────────────────── */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">
            Why Kashant
          </p>
          <h2 className="font-serif text-4xl font-bold text-center text-charcoal-900 mb-16">
            The Kashant Difference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-400/10 rounded-2xl mb-4">
                  <Icon size={24} className="text-gold-400" />
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-2">{title}</h3>
                <p className="text-sm text-charcoal-800/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-20 bg-charcoal-900 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-4xl font-bold text-white mb-4">
            Ready to Transform Your Salon?
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Get a personalized freight quote for your location. No commitment
            required — just tell us what you need.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gold-400 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full"
          >
            Get Freight Quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
