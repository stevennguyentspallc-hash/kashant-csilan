"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  sort_order: number;
}

const FALLBACK: Banner[] = [
  {
    id: "fallback-1",
    title: "Elevate Your Salon.\nElevate Your Brand.",
    subtitle: "Premium nail salon furniture engineered for the modern US salon. From pedicure thrones to reception desks — every piece tells a story of luxury.",
    cta_text: "Shop Collection",
    cta_link: "/products",
    image_url: null,
    sort_order: 0,
  },
];

export default function HeroCarousel() {
  const [banners,  setBanners]  = useState<Banner[]>(FALLBACK);
  const [current,  setCurrent]  = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data);
      });
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  // Auto-advance every 5s
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused, banners.length]);

  const banner = banners[current];

  return (
    <section
      className="relative min-h-screen flex items-center bg-charcoal-900 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image with fade transition */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {b.image_url ? (
            <Image
              src={b.image_url}
              alt={b.title}
              fill
              className="object-cover"
              priority={i === 0}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800/90 to-[#2a2010]/80" />
        </div>
      ))}

      {/* Decorative gold line */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-gold-400 to-transparent opacity-40" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-6">
          Kashant C-Silan LLC
        </p>

        <h1
          key={banner.id}
          className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight max-w-3xl animate-fadeIn"
          style={{ whiteSpace: "pre-line" }}
        >
          {banner.title.includes("\\n")
            ? banner.title.replace(/\\n/g, "\n")
            : banner.title}
        </h1>

        {banner.subtitle && (
          <p className="mt-6 text-white/60 text-lg max-w-xl leading-relaxed">
            {banner.subtitle}
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          {banner.cta_text && banner.cta_link && (
            <Link
              href={banner.cta_link}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-400 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full font-medium"
            >
              {banner.cta_text} <ArrowRight size={16} />
            </Link>
          )}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white text-sm tracking-widest uppercase hover:border-gold-400 hover:text-gold-400 transition-colors rounded-full"
          >
            Contact Us
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 flex flex-wrap gap-10">
          {[
            { value: "500+",  label: "Salons Served"   },
            { value: "50",    label: "States Covered"  },
            { value: "8",     label: "Product Lines"   },
            { value: "1-Day", label: "Quote Response"  },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-serif text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows — only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all rounded-full ${
                  i === current
                    ? "w-6 h-2 bg-gold-400"
                    : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
