"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { ChevronDown, ChevronRight, Search, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  children: Category[];
}

export default function ProductsPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryTree,  setCategoryTree]  = useState<CategoryTree[]>([]);
  const [products,      setProducts]      = useState<Product[]>([]);
  const [filtered,      setFiltered]      = useState<Product[]>([]);
  const [activeSlug,    setActiveSlug]    = useState<string | null>(null);
  const [expandedIds,   setExpandedIds]   = useState<Set<string>>(new Set());
  const [searchQuery,   setSearchQuery]   = useState("");
  const [loading,       setLoading]       = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  const supabase = createClient();

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("products").select("*, categories(*), product_variants(*)").eq("is_active", true).order("sort_order"),
    ]).then(([{ data: cats }, { data: prods }]) => {
      const categories = cats ?? [];
      setAllCategories(categories);

      // Build tree — top-level parents
      const parents = categories.filter((c) => !c.parent_id);
      const tree: CategoryTree[] = parents.map((p) => ({
        ...p,
        children: categories.filter((c) => c.parent_id === p.id),
      }));
      setCategoryTree(tree);

      // Expand all by default
      setExpandedIds(new Set(parents.map((p) => p.id)));

      setProducts(prods ?? []);
      setFiltered(prods ?? []);
      setLoading(false);
    });
  }, []);

  // Filter products when category or search changes
  useEffect(() => {
    let result = products;

    if (activeSlug) {
      const activeCat = allCategories.find((c) => c.slug === activeSlug);
      if (activeCat) {
        if (!activeCat.parent_id) {
          // Parent selected — show all children's products
          const childIds = allCategories.filter((c) => c.parent_id === activeCat.id).map((c) => c.id);
          const allIds = [activeCat.id, ...childIds];
          result = result.filter((p) => {
            const catId = (p.categories as Category)?.id;
            return allIds.includes(catId);
          });
        } else {
          result = result.filter((p) => (p.categories as Category)?.slug === activeSlug);
        }
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.categories as Category)?.name?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [activeSlug, searchQuery, products, allCategories]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectCategory = (slug: string | null) => {
    setActiveSlug(slug);
    setSidebarOpen(false);
  };

  const activeName = activeSlug
    ? allCategories.find((c) => c.slug === activeSlug)?.name
    : "All Products";

  const SidebarContent = () => (
    <div className="space-y-1">
      {/* All */}
      <button onClick={() => selectCategory(null)}
        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          !activeSlug
            ? "bg-charcoal-900 text-white"
            : "text-charcoal-800 hover:bg-cream-100"
        }`}>
        All Products
        <span className="float-right text-xs opacity-50">{products.length}</span>
      </button>

      {/* Category tree */}
      {categoryTree.map((parent) => {
        const isExpanded = expandedIds.has(parent.id);
        const isActive = activeSlug === parent.slug;
        const childCount = products.filter((p) => {
          const catId = (p.categories as Category)?.id;
          const childIds = allCategories.filter((c) => c.parent_id === parent.id).map((c) => c.id);
          return catId === parent.id || childIds.includes(catId);
        }).length;

        return (
          <div key={parent.id}>
            {/* Parent */}
            <div className={`flex items-center rounded-xl transition-all ${
              isActive ? "bg-gold-400/10" : "hover:bg-cream-100"
            }`}>
              <button onClick={() => selectCategory(parent.slug)}
                className={`flex-1 text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "text-gold-500" : "text-charcoal-900"
                }`}>
                {parent.name}
                <span className="float-right text-xs font-normal opacity-40 mt-0.5">{childCount}</span>
              </button>
              {parent.children.length > 0 && (
                <button onClick={() => toggleExpand(parent.id)}
                  className="p-2 text-charcoal-800/40 hover:text-charcoal-900">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
            </div>

            {/* Children */}
            {isExpanded && parent.children.length > 0 && (
              <div className="ml-4 border-l border-cream-200 pl-3 space-y-0.5 mt-0.5 mb-1">
                {parent.children.map((child) => {
                  const isChildActive = activeSlug === child.slug;
                  const childProductCount = products.filter((p) =>
                    (p.categories as Category)?.slug === child.slug
                  ).length;
                  return (
                    <button key={child.id} onClick={() => selectCategory(child.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                        isChildActive
                          ? "bg-gold-400 text-white font-medium"
                          : "text-charcoal-800/70 hover:bg-cream-100 hover:text-charcoal-900"
                      }`}>
                      {child.name}
                      <span className={`float-right text-[10px] mt-0.5 ${isChildActive ? "opacity-70" : "opacity-40"}`}>
                        {childProductCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Page header */}
      <div className="bg-charcoal-900 pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-2">Our Catalog</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Products</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search + mobile filter toggle */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-cream-200 rounded-xl text-sm text-charcoal-800 hover:border-gold-400 transition-colors">
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-100 sticky top-24">
              <p className="text-xs uppercase tracking-widest text-charcoal-800/40 px-4 mb-3">Categories</p>
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Sidebar Drawer */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-6 overflow-y-auto">
                <p className="text-xs uppercase tracking-widest text-charcoal-800/40 mb-4">Categories</p>
                <SidebarContent />
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-charcoal-900">{activeName}</h2>
                <p className="text-sm text-charcoal-800/40 mt-0.5">{filtered.length} products</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-cream-100">
                <p className="font-serif text-2xl text-charcoal-800/30 mb-2">No products found</p>
                <p className="text-sm text-charcoal-800/20">Try a different category or search term</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
