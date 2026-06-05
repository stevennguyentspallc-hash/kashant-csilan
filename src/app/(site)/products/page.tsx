"use client";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import ProductsFilter from "./ProductsFilter";
import { useSearchParams } from "next/navigation";

function ProductsContent() {
  const searchParams  = useSearchParams();
  const category      = searchParams.get("category") ?? undefined;
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from("products").select("*, categories(*), product_variants(*)").eq("is_active", true).order("sort_order"),
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    ]).then(([{ data: prods }, { data: cats }]) => {
      let filtered = prods ?? [];
      if (category) filtered = filtered.filter((p: Product) => (p.categories as Category)?.slug === category);
      setProducts(filtered);
      setCategories(cats ?? []);
      setLoading(false);
    });
  }, [category]);

  return (
    <div className="min-h-screen bg-cream-50 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-3">Our Catalog</p>
          <h1 className="font-serif text-5xl font-bold text-charcoal-900">All Products</h1>
          {category && (
            <p className="mt-3 text-charcoal-800/50 text-sm capitalize">
              Filtered by: {category.replace(/-/g, " ")}
            </p>
          )}
        </div>

        <ProductsFilter categories={categories} activeCategory={category} />

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-charcoal-800/40 mb-2">No products yet</p>
            <p className="text-sm text-charcoal-800/30">Add products in your admin dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
