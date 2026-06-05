"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Weight, Ruler, Clock, ChevronRight } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import QuoteModal from "./QuoteModal";

export default function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.product_variants?.[0] ?? null
  );
  const [showModal, setShowModal] = useState(false);

  const currentImage =
    selectedVariant?.image_url ?? product.product_variants?.[0]?.image_url ?? null;

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image — click to detail */}
        <Link href={`/products/${product.slug}`}>
          <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden cursor-pointer">
            {currentImage ? (
              <Image
                src={currentImage} alt={product.name}
                fill className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-serif text-cream-200">K</span>
              </div>
            )}
            {product.categories && (
              <span className="absolute top-3 left-3 bg-white/90 text-charcoal-900 text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
                {product.categories.name}
              </span>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-5">
          {/* Name — click to detail */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1 hover:text-gold-500 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Specs */}
          <div className="flex flex-wrap gap-3 text-xs text-charcoal-800/50 my-3">
            {product.dimensions && (
              <span className="flex items-center gap-1">
                <Ruler size={11} /> {product.dimensions}
              </span>
            )}
            {product.weight_lbs && (
              <span className="flex items-center gap-1">
                <Weight size={11} /> {product.weight_lbs} lbs
              </span>
            )}
            {product.lead_time && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {product.lead_time}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-charcoal-800/40">Color:</span>
              <div className="flex gap-1.5">
                {product.product_variants.map((v) => (
                  <button
                    key={v.id}
                    title={v.color_name}
                    onClick={() => setSelectedVariant(v)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-gold-400 scale-110"
                        : "border-transparent hover:border-charcoal-800/30"
                    }`}
                    style={{ backgroundColor: v.color_hex ?? "#ccc" }}
                  />
                ))}
              </div>
              {selectedVariant && (
                <span className="text-xs text-charcoal-800/50">
                  {selectedVariant.color_name}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          {product.price_usd && (
            <p className="text-sm font-semibold text-charcoal-900 mb-4">
              Starting at ${product.price_usd.toLocaleString()}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 py-2.5 bg-charcoal-900 text-white text-xs tracking-widest uppercase rounded-full hover:bg-gold-500 transition-colors"
            >
              Get Freight Quote
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="px-3 py-2.5 border border-cream-200 rounded-full hover:border-gold-400 transition-colors flex items-center"
            >
              <ChevronRight size={14} />
            </Link>
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
