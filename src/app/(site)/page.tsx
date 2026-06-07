"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Truck, Shield, Award, Headphones } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import HeroCarousel from "@/components/home/HeroCarousel";
import PromotionsBanner from "@/components/home/PromotionsBanner";

const CATEGORY_ICONS: Record<string, string> = {
  "pedicure-spa":      "💺",
  "furniture":         "🪑",
  "custom-furniture":  "🔨",
  "head-spa":          "🧖",
};

const STATIC_CATEGORIES = [
  { name: "Pedicure Spa",     slug: "pedicure-spa"     },
  { name: "Furniture",        slug: "furniture"        },
  { name: "Custom Furniture", slug: "custom-furniture" },
  { name: "Head Spa",         slug: "head-spa"         },
];

const WHY_US = [
  { icon: Truck,      title: "Nationwide Freight",   desc: "White-glove delivery to all 50 states with real-time tracking." },
  { icon: Award,      title: "Premium Quality",      desc: "Commercial-grade materials built to last in high-traffic salons." },
  { icon: Shield,     title: "Warranty Protected",   desc: "Every piece backed by our comprehensive warranty program." },
  { icon: Headphones, title: "Dedicated Support",    desc: "Bilingual support team available 6 days a week." },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories,       setCategories]       = useState<Category[]>([]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("products").select("*, categories(*), product_variants(*)").eq("is_featured", true).eq("is_active", true).order("sort_order"),
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    ]).then(([{ data: prods }, { data: cats }]) => {
      setFeaturedProducts(prods ?? []);
      setCategories(cats ?? []);
    });
  }, []);

  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;

  return (
    <>
      <HeroCarousel />

      {/* CATEGORIES */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">Our Collections</p>
          <h2 className="font-serif text-4xl font-bold text-center text-charcoal-900 mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayCategories.map((cat) => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                className="group bg-white rounded-2xl p-6 text-center hover:shadow-md transition-all border border-cream-100 hover:border-gold-400">
                <span className="text-3xl block mb-3">{CATEGORY_ICONS[cat.slug] ?? "🪑"}</span>
                <p className="font-medium text-sm text-charcoal-900 group-hover:text-gold-500 transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTIONS */}
      <PromotionsBanner />

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">Editor&apos;s Pick</p>
            <h2 className="font-serif text-4xl font-bold text-center text-charcoal-900 mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="text-center mt-12">
              <Link href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 border border-charcoal-900 text-charcoal-900 text-sm tracking-widest uppercase hover:bg-charcoal-900 hover:text-white transition-colors rounded-full">
                View All Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">Why Kashant</p>
          <h2 className="font-serif text-4xl font-bold text-center text-charcoal-900 mb-16">The Kashant Difference</h2>
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

      {/* CTA */}
      <section className="py-20 bg-charcoal-900 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Ready to Transform Your Salon?</h2>
          <p className="text-white/60 mb-8 leading-relaxed">Get a personalized freight quote for your location. No commitment required.</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gold-400 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full">
            Get Freight Quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
