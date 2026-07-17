"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Lightbox from "@/components/ui/Lightbox";

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  tag: string | null;
}

export default function GallerySection() {
  const [items,    setItems]    = useState<GalleryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    createClient()
      .from("gallery")
      .select("id, image_url, caption, tag")
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
        setLoading(false);
      });
  }, []);

  const images = items.map(i => ({ url: i.image_url, alt: i.caption ?? "Gallery" }));

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-wood-400 text-xs tracking-widest2 uppercase mb-2">Inspiration</p>
            <h2 className="font-serif text-4xl font-bold text-wood-900">SALON GALLERY</h2>
          </div>
          <Link href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-wood-500 hover:text-wood-700 transition-colors uppercase tracking-wider">
            View More <ArrowRight size={14}/>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-wood-100 animate-pulse rounded"/>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {items.map((item, i) => (
              <div key={item.id}
                className="aspect-square bg-wood-100 rounded overflow-hidden relative group cursor-pointer"
                onClick={() => setLightbox(i)}>
                <Image
                  src={item.image_url}
                  alt={item.caption ?? "Gallery"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  quality={75}
                />
                {item.tag && (
                  <span className="absolute top-2 left-2 bg-white/90 text-wood-800 text-[10px] px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                )}
                <div className="absolute inset-0 bg-wood-900/0 group-hover:bg-wood-900/20 transition-all"/>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-wood-100 rounded overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-5xl text-wood-200">K</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <Lightbox images={images} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}
