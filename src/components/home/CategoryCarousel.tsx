"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export default function CategoryCarousel() {
  const router  = useRouter();
  const [cards,   setCards]   = useState<CategoryCard[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sb = createClient();
    // Get top-level categories only
    sb.from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .is("parent_id", null)
      .order("sort_order")
      .then(async ({ data: cats }) => {
        if (!cats) return;
        // For each category, get first product image
        const cards: CategoryCard[] = await Promise.all(
          cats.map(async (cat) => {
            // Get all subcategory ids
            const { data: subs } = await sb
              .from("categories")
              .select("id")
              .eq("parent_id", cat.id);
            const allIds = [cat.id, ...(subs ?? []).map((s: {id: string}) => s.id)];

            // Get first product with image in this category tree
            const { data: products } = await sb
              .from("products")
              .select("product_variants(image_url)")
              .in("category_id", allIds)
              .eq("is_active", true)
              .limit(5);

            let image: string | null = null;
            if (products) {
              for (const p of products) {
                const variants = (p as {product_variants: {image_url: string | null}[]}).product_variants;
                const found = variants?.find(v => v.image_url);
                if (found?.image_url) { image = found.image_url; break; }
              }
            }
            return { id: cat.id, name: cat.name, slug: cat.slug, image };
          })
        );
        setCards(cards.filter(c => c.image)); // only show categories with images
      });
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % cards.length), [cards.length]);
  const prev = () => setCurrent(c => (c - 1 + cards.length) % cards.length);

  useEffect(() => {
    if (paused || cards.length <= 1) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, cards.length]);

  if (cards.length === 0) return null;

  // Get indices for left, center, right
  const getIdx = (offset: number) => (current + offset + cards.length) % cards.length;

  return (
    <section className="py-20 bg-charcoal-900 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">Our Collections</p>
        <h2 className="font-serif text-4xl font-bold text-center text-white mb-12">Shop by Category</h2>

        <div className="relative flex items-center justify-center gap-4 h-[420px]">
          {/* Prev button */}
          <button onClick={prev}
            className="absolute left-0 z-20 w-12 h-12 bg-gold-400 hover:bg-gold-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 shrink-0">
            <ChevronLeft size={22} />
          </button>

          {/* Cards */}
          <div className="flex items-center justify-center gap-4 w-full px-16">
            {[-1, 0, 1].map((offset) => {
              const idx   = getIdx(offset);
              const card  = cards[idx];
              const isCenter = offset === 0;
              return (
                <div key={card.id}
                  onClick={() => {
                    if (isCenter) router.push(`/products?category=${card.slug}`);
                    else setCurrent(idx);
                  }}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 shrink-0 ${
                    isCenter
                      ? "w-[420px] h-[380px] z-10 scale-100"
                      : "w-[280px] h-[300px] z-0 scale-95 opacity-60"
                  }`}>
                  {/* Background image */}
                  {card.image && (
                    <Image src={card.image} alt={card.name} fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 420px"
                      quality={80} />
                  )}

                  {/* Dark overlay — stronger on sides */}
                  <div className={`absolute inset-0 transition-all duration-500 ${
                    isCenter
                      ? "bg-gradient-to-t from-black/80 via-black/20 to-black/30"
                      : "bg-black/60"
                  }`} />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                    <h3 className={`font-serif font-bold text-white text-center transition-all duration-500 ${isCenter ? "text-2xl mb-4" : "text-lg mb-2"}`}>
                      {card.name}
                    </h3>
                    {isCenter && (
                      <button
                        onClick={() => router.push(`/products?category=${card.slug}`)}
                        className="px-6 py-2.5 bg-gold-400 hover:bg-gold-500 text-white text-xs tracking-widest uppercase rounded-full transition-colors font-medium">
                        View Products →
                      </button>
                    )}
                  </div>

                  {/* Gold border on center */}
                  {isCenter && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-gold-400/60 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Next button */}
          <button onClick={next}
            className="absolute right-0 z-20 w-12 h-12 bg-gold-400 hover:bg-gold-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 shrink-0">
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {cards.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`transition-all rounded-full ${i === current ? "w-6 h-2 bg-gold-400" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}