"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  start_date: string | null;
  end_date: string | null;
}

export default function PromotionsBanner() {
  const [promos,   setPromos]   = useState<Promotion[]>([]);
  const [current,  setCurrent]  = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setPromos(data);
      });
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % promos.length), [promos.length]);
  const prev = () => setCurrent((c) => (c - 1 + promos.length) % promos.length);

  useEffect(() => {
    if (isPaused || promos.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, isPaused, promos.length]);

  if (promos.length === 0) return null;

  const promo = promos[current];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-1">Limited Time</p>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">Current Promotions</h2>
          </div>
          <Link href="/promotions"
            className="inline-flex items-center gap-2 text-sm text-charcoal-800/50 hover:text-gold-400 transition-colors uppercase tracking-wider">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div
          className="relative rounded-3xl overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background */}
          <div className="relative h-72 md:h-96 bg-charcoal-900">
            {promo.image_url ? (
              <Image src={promo.image_url} alt={promo.title} fill className="object-cover opacity-50" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-gold-500/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/90 via-charcoal-900/60 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex items-center px-8 md:px-16">
              <div className="max-w-xl">
                {promo.badge && (
                  <span className="inline-flex items-center gap-1.5 bg-gold-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
                    <Tag size={11} /> {promo.badge}
                  </span>
                )}
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                  {promo.title}
                </h3>
                {promo.description && (
                  <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                    {promo.description}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  {promo.cta_text && promo.cta_link && (
                    <Link href={promo.cta_link}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gold-400 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full font-medium">
                      {promo.cta_text} <ArrowRight size={14} />
                    </Link>
                  )}
                  {(promo.start_date || promo.end_date) && (
                    <p className="text-white/40 text-xs">
                      {promo.end_date && `Ends ${new Date(promo.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          {promos.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {promos.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`transition-all rounded-full ${i === current ? "w-5 h-1.5 bg-gold-400" : "w-1.5 h-1.5 bg-white/30"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
