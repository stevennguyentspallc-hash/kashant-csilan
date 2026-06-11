"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Weight, Ruler, Clock, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/supabase/queries";
import type { Product, ProductVariant } from "@/types";
import QuoteModal from "@/components/products/QuoteModal";
import Lightbox from "@/components/ui/Lightbox";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product,   setProduct]   = useState<Product | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [selVar,    setSelVar]    = useState<ProductVariant | null>(null);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [modal,     setModal]     = useState(false);
  const [lightbox,  setLightbox]  = useState(false);
  const [paused,    setPaused]    = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then(({ slug }) => {
      getProductBySlug(slug).then(data => {
        setProduct(data);
        setSelVar(data?.product_variants?.[0] ?? null);
        setLoading(false);
      });
    });
  }, [params]);

  const variants = product?.product_variants ?? [];
  const images   = variants.filter(v => v.image_url).map(v => ({ url: v.image_url!, alt: v.color_name }));

  const next = useCallback(() => {
    if (images.length > 1) setImgIdx(i => (i + 1) % images.length);
  }, [images.length]);
  const prev = () => { if (images.length > 1) setImgIdx(i => (i - 1 + images.length) % images.length); };

  useEffect(() => {
    if (paused || images.length <= 1) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, images.length]);

  const currentImage = images[imgIdx]?.url ?? null;

  if (loading) return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center pt-24">
      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center pt-24">
      <p className="font-serif text-3xl text-charcoal-800/40 mb-4">Product not found</p>
      <Link href="/products" className="text-gold-400 text-sm hover:underline">← Back to Products</Link>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-cream-50 pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-charcoal-800/50 hover:text-gold-400 transition-colors mb-10">
            <ArrowLeft size={14}/> Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Images */}
            <div className="space-y-4"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}>

              {/* Main image */}
              <div className="relative aspect-square bg-cream-100 rounded-3xl overflow-hidden cursor-zoom-in"
                onClick={() => images.length > 0 && setLightbox(true)}>
                {currentImage ? (
                  <Image src={currentImage} alt={product.name} fill
                    className="object-cover transition-opacity duration-500"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={85} priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-8xl text-cream-200">K</span>
                  </div>
                )}

                {/* Prev/Next arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); prev(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-charcoal-900 rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 hover:opacity-100">
                      <ChevronLeft size={18}/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); next(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-charcoal-900 rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 hover:opacity-100">
                      <ChevronRight size={18}/>
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                          className={`transition-all rounded-full ${i === imgIdx ? "w-5 h-1.5 bg-gold-400" : "w-1.5 h-1.5 bg-white/60 hover:bg-white"}`} />
                      ))}
                    </div>
                  </>
                )}

                {/* Click to zoom hint */}
                {images.length > 0 && (
                  <div className="absolute top-3 right-3 bg-black/30 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                    🔍 Click to zoom
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => { setImgIdx(i); setSelVar(variants[i] ?? null); }}
                      className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? "border-gold-400 scale-105" : "border-cream-200 hover:border-charcoal-800/30"}`}>
                      <Image src={img.url} alt={img.alt} fill className="object-cover"
                        sizes="64px" quality={60} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {product.categories && (
                <span className="text-xs tracking-widest uppercase text-gold-400 mb-3">
                  {(product.categories as { name: string }).name}
                </span>
              )}
              <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-4">{product.name}</h1>
              {product.price_usd && (
                <p className="text-2xl font-semibold text-charcoal-900 mb-6">
                  Starting at ${product.price_usd.toLocaleString()}
                </p>
              )}
              {product.description && (
                <p className="text-charcoal-800/60 leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>
              )}

              {/* Color picker */}
              {variants.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-charcoal-800/50 mb-3">
                    Color — {selVar?.color_name}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {variants.map((v, i) => (
                      <button key={v.id} title={v.color_name}
                        onClick={() => { setSelVar(v); setImgIdx(i < images.length ? i : 0); }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selVar?.id === v.id ? "border-gold-400 scale-110 ring-2 ring-gold-400/30" : "border-cream-200 hover:border-charcoal-800/40"}`}
                        style={{ backgroundColor: v.color_hex ?? "#ccc" }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-white rounded-2xl border border-cream-100">
                <p className="col-span-2 text-xs uppercase tracking-widest text-charcoal-800/40 mb-1">Specifications</p>
                {product.dimensions && (
                  <div className="flex items-start gap-2">
                    <Ruler size={14} className="text-gold-400 mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Dimensions</p>
                      <p className="text-sm text-charcoal-900 whitespace-pre-line">{product.dimensions}</p>
                    </div>
                  </div>
                )}
                {product.weight_lbs && (
                  <div className="flex items-start gap-2">
                    <Weight size={14} className="text-gold-400 mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Weight</p>
                      <p className="text-sm text-charcoal-900">{product.weight_lbs} lbs</p>
                    </div>
                  </div>
                )}
                {product.lead_time && (
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-gold-400 mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Lead Time</p>
                      <p className="text-sm text-charcoal-900">{product.lead_time}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Package size={14} className="text-gold-400 mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Shipping</p>
                    <p className="text-sm text-charcoal-900">Freight — all 50 states</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setModal(true)}
                className="w-full py-4 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full font-medium">
                Get Freight Quote
              </button>
              <p className="text-center text-xs text-charcoal-800/40 mt-3">Free quote · Respond within 1 business day</p>
            </div>
          </div>
        </div>
      </div>

      {modal   && <QuoteModal product={product} selectedVariant={selVar} onClose={() => setModal(false)} />}
      {lightbox && images.length > 0 && (
        <Lightbox images={images} startIndex={imgIdx} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}