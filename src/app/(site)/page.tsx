"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Award, Headphones } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import PromotionsBanner from "@/components/home/PromotionsBanner";
import GallerySection from "@/components/home/GallerySection";
import VideoSection from "@/components/home/VideoSection";

interface Banner {
  id: string; title: string; subtitle: string | null;
  cta_text: string | null; cta_link: string | null; image_url: string | null;
}

const WHY_US = [
  { icon: Truck,      title: "Nationwide Freight",  desc: "White-glove delivery to all 50 states." },
  { icon: Award,      title: "Premium Quality",     desc: "Commercial-grade materials for high-traffic salons." },
  { icon: Shield,     title: "Warranty Protected",  desc: "Every piece backed by our warranty program." },
  { icon: Headphones, title: "Bilingual Support",   desc: "English & Vietnamese support, 6 days a week." },
];

export default function HomePage() {
  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [bIdx,      setBIdx]      = useState(0);
  const [products,  setProducts]  = useState<Product[]>([]);
  const [cats,      setCats]      = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [paused,    setPaused]    = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sb = createClient();
    Promise.all([
      sb.from("banners").select("*").eq("is_active", true).order("sort_order"),
      sb.from("products").select("*, categories(*), product_variants(*)").eq("is_active", true).order("sort_order"),
      sb.from("categories").select("*").eq("is_active", true).eq("parent_id" as string, null as unknown as string).order("sort_order"),
    ]).then(([{ data: b }, { data: p }, { data: c }]) => {
      setBanners(b ?? []);
      setProducts(p ?? []);
      setCats(c ?? []);
    });
  }, []);

  const nextBanner = useCallback(() => setBIdx(i => (i + 1) % Math.max(banners.length, 1)), [banners.length]);
  const prevBanner = () => setBIdx(i => (i - 1 + Math.max(banners.length, 1)) % Math.max(banners.length, 1));

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    timerRef.current = setInterval(nextBanner, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [nextBanner, paused, banners.length]);

  const banner = banners[bIdx];

  const filteredProducts = activeCat
    ? products.filter(p => {
        const cat = p.categories as Category | undefined;
        return cat?.slug === activeCat || cat?.parent_id === cats.find(c => c.slug === activeCat)?.id;
      })
    : products.filter(p => p.is_featured);

  return (
    <div className="w-full overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative w-full h-screen overflow-hidden bg-wood-900"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>

        {banners.map((b, i) => (
          <div key={b.id} className={"absolute inset-0 transition-opacity duration-1000 " + (i === bIdx ? "opacity-100" : "opacity-0")}>
            {b.image_url && (
              <Image src={b.image_url} alt={b.title} fill className="object-cover" priority={i === 0} sizes="100vw" quality={85}/>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-wood-900/80 via-wood-900/40 to-transparent"/>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-wood-900 via-wood-800 to-wood-700"/>
        )}

        <div className="relative h-full flex items-center">
          <div className="w-full px-12">
            <p className="text-gold-400 text-xs tracking-widest uppercase mb-4">Kashant C-Silan LLC</p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight max-w-3xl mb-6 whitespace-pre-line">
              {banner ? banner.title.replace(/\\n/g, "\n") : "Elevate Your Salon.\nElevate Your Brand."}
            </h1>
            {banner?.subtitle && (
              <p className="text-white/70 text-lg max-w-xl leading-relaxed mb-10">{banner.subtitle}</p>
            )}
            <div className="flex flex-wrap gap-4">
              {banner?.cta_link && banner?.cta_text ? (
                <Link href={banner.cta_link}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-wood-500 text-white text-sm tracking-widest uppercase hover:bg-wood-600 transition-colors rounded">
                  {banner.cta_text} <ArrowRight size={15}/>
                </Link>
              ) : (
                <Link href="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-wood-500 text-white text-sm tracking-widest uppercase hover:bg-wood-600 transition-colors rounded">
                  Shop Collection <ArrowRight size={15}/>
                </Link>
              )}
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/40 text-white text-sm tracking-widest uppercase hover:border-gold-400 hover:text-gold-400 transition-colors rounded">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button onClick={prevBanner}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-gold-400 text-white rounded-full flex items-center justify-center transition-all z-10">
              <ChevronLeft size={20}/>
            </button>
            <button onClick={nextBanner}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-gold-400 text-white rounded-full flex items-center justify-center transition-all z-10">
              <ChevronRight size={20}/>
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setBIdx(i)}
                  className={"transition-all rounded-full " + (i === bIdx ? "w-8 h-2 bg-gold-400" : "w-2 h-2 bg-white/40")}/>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── PRODUCT CENTER ───────────────────────────────────── */}
      <section className="w-full py-20 bg-cream-50">
        <div className="w-full px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-wood-400 text-xs tracking-widest uppercase mb-2">Our Collection</p>
              <h2 className="font-serif text-4xl font-bold text-wood-900">PRODUCT CENTER</h2>
            </div>
            <Link href="/products"
              className="inline-flex items-center gap-2 text-sm text-wood-500 hover:text-wood-700 transition-colors uppercase tracking-wider">
              View More <ArrowRight size={14}/>
            </Link>
          </div>

          {/* Category tabs */}
          <div className="flex gap-0 border-b border-wood-200 mb-10 overflow-x-auto">
            <button onClick={() => setActiveCat(null)}
              className={"px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-all " + (!activeCat ? "border-wood-500 text-wood-700" : "border-transparent text-wood-400 hover:text-wood-600")}>
              Featured
            </button>
            {cats.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.slug)}
                className={"px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-all " + (activeCat === cat.slug ? "border-wood-500 text-wood-700" : "border-transparent text-wood-400 hover:text-wood-600")}>
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          ) : (
            <div className="text-center py-16 text-wood-300">
              <p className="font-serif text-xl">No products yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PROMOTIONS ───────────────────────────────────────── */}
      <PromotionsBanner />

      {/* ── GALLERY ──────────────────────────────────────────── */}
      <GallerySection />

      {/* ── ABOUT + VIDEO ────────────────────────────────────── */}
      <section className="w-full py-20 bg-wood-50">
        <div className="w-full px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-wood-400 text-xs tracking-widest uppercase mb-3">Who We Are</p>
              <h2 className="font-serif text-4xl font-bold text-wood-900 mb-6">ABOUT KASHANT</h2>
              <p className="text-wood-600 leading-relaxed mb-4">
                Kashant C-Silan LLC was founded with one purpose: to give nail salon owners access to the same quality of furniture that luxury spas enjoy — without the luxury price tag or the hassle of overseas sourcing.
              </p>
              <p className="text-wood-600 leading-relaxed mb-8">
                We source, inspect, and ship every piece directly to your salon door. Our bilingual team speaks English and Vietnamese, making it easy to communicate your exact needs.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[{ value: "500+", label: "Salons Served" }, { value: "50", label: "States Covered" }, { value: "8", label: "Product Lines" }].map(({ value, label }) => (
                  <div key={label} className="text-center p-4 bg-white rounded border border-wood-200">
                    <p className="font-serif text-3xl font-bold text-wood-500">{value}</p>
                    <p className="text-xs text-wood-400 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <Link href="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-wood-500 text-white text-sm tracking-widest uppercase hover:bg-wood-600 transition-colors rounded">
                Learn More <ArrowRight size={14}/>
              </Link>
            </div>
            <VideoSection />
          </div>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────── */}
      <section className="w-full py-16 bg-wood-900">
        <div className="w-full px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gold-400/10 rounded mb-4">
                  <Icon size={22} className="text-gold-400"/>
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-wood-500 text-center">
        <div className="w-full max-w-2xl mx-auto px-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-3">Ready to Transform Your Salon?</h2>
          <p className="text-white/70 mb-8">Get a personalized freight quote. No commitment required.</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-wood-700 text-sm tracking-widest uppercase hover:bg-wood-50 transition-colors rounded font-semibold">
            Get Freight Quote <ArrowRight size={15}/>
          </Link>
        </div>
      </section>

    </div>
  );
}


