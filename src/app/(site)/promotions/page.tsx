"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag, Calendar } from "lucide-react";
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

export default function PromotionsPage() {
  const [promos,  setPromos]  = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

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
        setPromos(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-wood-900 pt-32 pb-20 px-6 text-center">
        <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-4">Limited Time Offers</p>
        <h1 className="font-serif text-5xl font-bold text-white mb-4">Promotions</h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Exclusive deals on premium nail salon furniture. Don&apos;t miss out!
        </p>
      </section>

      {/* Promotions grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : promos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promos.map((promo) => (
                <div key={promo.id} className="group bg-wood-50 rounded-3xl overflow-hidden shadow-sm hover:border-gold-400/40 transition-colors border border-wood-800">
                  {/* Image */}
                  <div className="relative h-56 bg-wood-900">
                    {promo.image_url ? (
                      <Image src={promo.image_url} alt={promo.title} fill className="object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-wood-900 to-gold-500/20" />
                    )}
                    {promo.badge && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-gold-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                          <Tag size={11} /> {promo.badge}
                        </span>
                      </div>
                    )}
                    {promo.end_date && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 bg-wood-900/85 text-charcoal-900 text-xs px-3 py-1.5 rounded-full">
                          <Calendar size={11} />
                          Ends {new Date(promo.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-2">{promo.title}</h3>
                    {promo.description && (
                      <p className="text-charcoal-800/70 text-sm leading-relaxed mb-6">{promo.description}</p>
                    )}
                    {promo.cta_text && promo.cta_link && (
                      <Link href={promo.cta_link}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-wood-500 text-white text-sm tracking-widest uppercase hover:bg-wood-600 transition-colors rounded-full">
                        {promo.cta_text} <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-charcoal-800/50">
              <Tag size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No active promotions at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
