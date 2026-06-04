"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Weight, Ruler, Clock, Package } from "lucide-react";
import { getProductBySlug } from "@/lib/supabase/queries";
import type { Product, ProductVariant } from "@/types";
import QuoteModal from "@/components/products/QuoteModal";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      const { slug } = await params;
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
        setSelectedVariant(data?.product_variants?.[0] ?? null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center pt-24">
        <p className="font-serif text-3xl text-charcoal-800/40 mb-4">Product not found</p>
        <Link href="/products" className="text-gold-400 text-sm hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const currentImage =
    selectedVariant?.image_url ?? product.product_variants?.[0]?.image_url ?? null;

  return (
    <>
      <div className="min-h-screen bg-cream-50 pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-charcoal-800/50 hover:text-gold-400 transition-colors mb-10"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-cream-100 rounded-3xl overflow-hidden">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-8xl text-cream-200">K</span>
                  </div>
                )}
              </div>

              {/* Variant image thumbnails */}
              {product.product_variants && product.product_variants.length > 1 && (
                <div className="flex gap-3">
                  {product.product_variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedVariant?.id === v.id
                          ? "border-gold-400"
                          : "border-cream-200 hover:border-charcoal-800/30"
                      }`}
                    >
                      {v.image_url ? (
                        <Image src={v.image_url} alt={v.color_name} fill className="object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: v.color_hex ?? "#ccc" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {product.categories && (
                <span className="text-xs tracking-widest uppercase text-gold-400 mb-3">
                  {product.categories.name}
                </span>
              )}
              <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-4">
                {product.name}
              </h1>

              {product.price_usd && (
                <p className="text-2xl font-semibold text-charcoal-900 mb-6">
                  Starting at ${product.price_usd.toLocaleString()}
                </p>
              )}

              {product.description && (
                <p className="text-charcoal-800/60 leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              {/* Color picker */}
              {product.product_variants && product.product_variants.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-charcoal-800/50 mb-3">
                    Select Color — {selectedVariant?.color_name}
                  </p>
                  <div className="flex gap-3">
                    {product.product_variants.map((v) => (
                      <button
                        key={v.id}
                        title={v.color_name}
                        onClick={() => setSelectedVariant(v)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedVariant?.id === v.id
                            ? "border-gold-400 scale-110 ring-2 ring-gold-400/30"
                            : "border-cream-200 hover:border-charcoal-800/40"
                        }`}
                        style={{ backgroundColor: v.color_hex ?? "#ccc" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-white rounded-2xl border border-cream-100">
                <p className="col-span-2 text-xs uppercase tracking-widest text-charcoal-800/40 mb-2">
                  Specifications
                </p>
                {product.dimensions && (
                  <div className="flex items-start gap-2">
                    <Ruler size={14} className="text-gold-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Dimensions</p>
                      <p className="text-sm text-charcoal-900">{product.dimensions}</p>
                    </div>
                  </div>
                )}
                {product.weight_lbs && (
                  <div className="flex items-start gap-2">
                    <Weight size={14} className="text-gold-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Weight</p>
                      <p className="text-sm text-charcoal-900">{product.weight_lbs} lbs</p>
                    </div>
                  </div>
                )}
                {product.lead_time && (
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-gold-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Lead Time</p>
                      <p className="text-sm text-charcoal-900">{product.lead_time}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Package size={14} className="text-gold-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal-800/40">Shipping</p>
                    <p className="text-sm text-charcoal-900">Freight — all 50 states</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-4 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full font-medium"
              >
                Get Freight Quote
              </button>
              <p className="text-center text-xs text-charcoal-800/40 mt-3">
                Free quote · Respond within 1 business day
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <QuoteModal
          product={product}
          selectedVariant={selectedVariant}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
