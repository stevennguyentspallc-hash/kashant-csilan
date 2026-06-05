import { Suspense } from "react";
import { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/supabase/queries";
import ProductCard from "@/components/products/ProductCard";
import ProductsFilter from "./ProductsFilter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our full catalog of premium nail salon furniture. Pedicure chairs, manicure tables, reception desks, spa beds and more. All specifications in US measurements.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams;

  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [products, categories] = await Promise.all([
      getProducts(category),
      getCategories(),
    ]);
  } catch {
    // fallback empty
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page header */}
        <div className="mb-12 text-center">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-3">
            Our Catalog
          </p>
          <h1 className="font-serif text-5xl font-bold text-charcoal-900">
            All Products
          </h1>
          {category && (
            <p className="mt-3 text-charcoal-800/50 text-sm capitalize">
              Filtered by: {category.replace(/-/g, " ")}
            </p>
          )}
        </div>

        {/* Filter bar */}
        <Suspense fallback={null}>
          <ProductsFilter categories={categories} activeCategory={category} />
        </Suspense>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-charcoal-800/40 mb-2">
              No products yet
            </p>
            <p className="text-sm text-charcoal-800/30">
              Add products in your Supabase dashboard to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
