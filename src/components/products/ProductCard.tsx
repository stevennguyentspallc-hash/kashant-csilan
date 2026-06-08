"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Weight, Ruler, Clock } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import QuoteModal from "./QuoteModal";
import Lightbox from "@/components/ui/Lightbox";

export default function ProductCard({ product }: { product: Product }) {
  const variants  = product.product_variants ?? [];
  const images    = variants.filter(v => v.image_url).map(v => ({ url: v.image_url!, alt: v.color_name }));
  const [imgIdx,   setImgIdx]   = useState(0);
  const [selVar,   setSelVar]   = useState<ProductVariant | null>(variants[0] ?? null);
  const [modal,    setModal]    = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [hovered,  setHovered]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextImg = useCallback(() => {
    if (images.length > 1) setImgIdx(i => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (hovered && images.length > 1) {
      timerRef.current = setInterval(nextImg, 1500);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (!hovered) setImgIdx(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hovered, nextImg, images.length]);

  const currentImage = images[imgIdx]?.url ?? null;

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>

        {/* Image */}
        <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden cursor-pointer"
          onClick={() => images.length > 0 && setLightbox(true)}>
          {currentImage ? (
            <Image src={currentImage} alt={product.name} fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75} />
          ) : (
            <Link href={`/products/${product.slug}`}>
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-serif text-cream-200">K</span>
              </div>
            </Link>
          )}
          {product.categories && (
            <span className="absolute top-3 left-3 bg-white/90 text-charcoal-900 text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
              {(product.categories as { name: string }).name}
            </span>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={`transition-all rounded-full ${i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1 hover:text-gold-500 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          <div className="flex flex-wrap gap-3 text-xs text-charcoal-800/50 my-3">
            {product.dimensions && <span className="flex items-center gap-1"><Ruler size={11}/> {product.dimensions}</span>}
            {product.weight_lbs && <span className="flex items-center gap-1"><Weight size={11}/> {product.weight_lbs} lbs</span>}
            {product.lead_time  && <span className="flex items-center gap-1"><Clock size={11}/> {product.lead_time}</span>}
          </div>

          {variants.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-charcoal-800/40">Color:</span>
              <div className="flex gap-1.5">
                {variants.map((v, i) => (
                  <button key={v.id} title={v.color_name}
                    onClick={() => { setSelVar(v); setImgIdx(i < images.length ? i : 0); }}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${selVar?.id === v.id ? "border-gold-400 scale-110" : "border-transparent hover:border-charcoal-800/30"}`}
                    style={{ backgroundColor: v.color_hex ?? "#ccc" }} />
                ))}
              </div>
              {selVar && <span className="text-xs text-charcoal-800/50">{selVar.color_name}</span>}
            </div>
          )}

          {product.price_usd && (
            <p className="text-sm font-semibold text-charcoal-900 mb-4">
              Starting at ${product.price_usd.toLocaleString()}
            </p>
          )}

          <button onClick={() => setModal(true)}
            className="w-full py-2.5 bg-charcoal-900 text-white text-xs tracking-widest uppercase rounded-full hover:bg-gold-500 transition-colors">
            Get Freight Quote
          </button>
        </div>
      </div>

      {modal    && <QuoteModal product={product} selectedVariant={selVar} onClose={() => setModal(false)} />}
      {lightbox && images.length > 0 && (
        <Lightbox images={images} startIndex={imgIdx} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}