"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Lightbox from "@/components/ui/Lightbox";
import { X } from "lucide-react";

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  tag: string | null;
}

const TAGS = ["All", "Full Salon", "Pedicure Chairs", "Manicure Tables", "Reception Desks", "Head Spa", "Custom Furniture"];

export default function GalleryPage() {
  const [items,     setItems]     = useState<GalleryItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [lightbox,  setLightbox]  = useState<number | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.from("gallery")
      .select("id, image_url, caption, tag")
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Gallery fetch error:", error);
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = activeTag === "All"
    ? items
    : items.filter(i => i.tag === activeTag);

  const images = filtered.map(i => ({ url: i.image_url, alt: i.caption ?? "Gallery" }));

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-wood-900 pt-32 pb-16 px-6 text-center">
        <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-3">Our Work</p>
        <h1 className="font-serif text-5xl font-bold text-white mb-3">Salon Gallery</h1>
        <p className="text-white/50 text-base max-w-xl mx-auto">
          Real salons. Real transformations. See how our furniture looks across the US.
        </p>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tag filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {TAGS.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className={`px-5 py-2 rounded text-sm tracking-wide border transition-all ${
                  activeTag === tag
                    ? "bg-wood-500 text-white border-wood-500"
                    : "bg-white text-wood-700 border-wood-200 hover:border-wood-400"
                }`}>
                {tag}
                {tag !== "All" && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({items.filter(i => i.tag === tag).length})
                  </span>
                )}
              </button>
            ))}
            {activeTag !== "All" && (
              <button onClick={() => setActiveTag("All")}
                className="px-3 py-2 rounded text-sm text-wood-400 hover:text-wood-600 flex items-center gap-1">
                <X size={13}/> Clear
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="break-inside-avoid aspect-square bg-wood-100 animate-pulse rounded mb-2"/>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-2">
              {filtered.map((item, i) => (
                <div key={item.id}
                  className="break-inside-avoid cursor-pointer group rounded overflow-hidden relative mb-2"
                  onClick={() => setLightbox(i)}>
                  <Image
                    src={item.image_url}
                    alt={item.caption ?? "Gallery"}
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    quality={75}
                  />
                  {item.tag && (
                    <span className="absolute top-2 left-2 bg-white/90 text-wood-800 text-[10px] px-2 py-0.5 rounded-full">
                      {item.tag}
                    </span>
                  )}
                  {item.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-wood-300">
              <p className="font-serif text-2xl mb-2">No photos in this category</p>
              <button onClick={() => setActiveTag("All")}
                className="text-sm text-wood-500 hover:text-wood-700 underline">Show all photos</button>
            </div>
          )}
        </div>
      </section>

      {lightbox !== null && (
        <Lightbox images={images} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}