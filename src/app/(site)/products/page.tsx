"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { ChevronDown, ChevronRight, Search, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string; name: string; slug: string;
  parent_id: string | null; sort_order: number;
}
interface CategoryTree extends Category { children: Category[]; }

export default function ProductsPage() {
  const [allCats,     setAllCats]     = useState<Category[]>([]);
  const [tree,        setTree]        = useState<CategoryTree[]>([]);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [filtered,    setFiltered]    = useState<Product[]>([]);
  const [activeSlug,  setActiveSlug]  = useState<string | null>(null);
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set());
  const [search,      setSearch]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  useEffect(() => {
    const sb = createClient();
    Promise.all([
      sb.from("categories").select("*").eq("is_active", true).order("sort_order"),
      sb.from("products").select("*, categories(*), product_variants(*)").eq("is_active", true).order("sort_order"),
    ]).then(([{ data: cats }, { data: prods }]) => {
      const c = cats ?? [];
      setAllCats(c);
      const parents = c.filter(x => !x.parent_id);
      setTree(parents.map(p => ({ ...p, children: c.filter(x => x.parent_id === p.id) })));
      setExpanded(new Set(parents.map(p => p.id)));
      setProducts(prods ?? []);
      setFiltered(prods ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let r = products;
    if (activeSlug) {
      const cat = allCats.find(c => c.slug === activeSlug);
      if (cat) {
        const childIds = allCats.filter(c => c.parent_id === cat.id).map(c => c.id);
        const ids = [cat.id, ...childIds];
        r = r.filter(p => ids.includes((p.categories as Category)?.id));
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    setFiltered(r);
  }, [activeSlug, search, products, allCats]);

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const select = (slug: string | null) => { setActiveSlug(slug); setDrawerOpen(false); };

  const SidebarContent = () => (
    <div className="space-y-0.5">
      <button onClick={() => select(null)}
        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${!activeSlug ? "bg-charcoal-900 text-white" : "text-charcoal-800 hover:bg-cream-100"}`}>
        All Products
        <span className="text-xs opacity-40">{products.length}</span>
      </button>
      <div className="h-px bg-cream-200 my-2" />
      {tree.map(parent => {
        const isExp = expanded.has(parent.id);
        const isAct = activeSlug === parent.slug;
        const cnt = products.filter(p => {
          const cid = (p.categories as Category)?.id;
          return cid === parent.id || parent.children.some(c => c.id === cid);
        }).length;
        return (
          <div key={parent.id}>
            <div className={`flex items-center rounded-xl ${isAct ? "bg-gold-400/10" : "hover:bg-cream-100"}`}>
              <button onClick={() => select(parent.slug)}
                className={`flex-1 text-left px-4 py-2.5 text-sm font-semibold transition-colors ${isAct ? "text-gold-500" : "text-charcoal-900"}`}>
                {parent.name}
                <span className="float-right text-xs font-normal opacity-30 mt-0.5">{cnt}</span>
              </button>
              {parent.children.length > 0 && (
                <button onClick={() => toggle(parent.id)} className="p-2 text-charcoal-800/30 hover:text-charcoal-900">
                  {isExp ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}
                </button>
              )}
            </div>
            {isExp && parent.children.length > 0 && (
              <div className="ml-4 border-l-2 border-gold-400/30 pl-2 space-y-0.5 mt-0.5 mb-2">
                {parent.children.map(child => {
                  const isCA = activeSlug === child.slug;
                  const cc = products.filter(p => (p.categories as Category)?.slug === child.slug).length;
                  return (
                    <button key={child.id} onClick={() => select(child.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${isCA ? "bg-gold-400 text-white font-medium" : "text-charcoal-800/60 hover:bg-cream-100 hover:text-charcoal-900"}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCA ? "bg-white" : "bg-gold-400/50"}`} />
                        {child.name}
                      </span>
                      <span className={`text-[10px] ${isCA ? "opacity-70" : "opacity-30"}`}>{cc}</span>
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
      <div className="bg-charcoal-900 pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-2">Our Catalog</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Products</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400" />
          </div>
          <button onClick={() => setDrawerOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-cream-200 rounded-xl text-sm hover:border-gold-400 transition-colors">
            <SlidersHorizontal size={15}/> Filter
          </button>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-60 shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-100 sticky top-24">
              <p className="text-[10px] uppercase tracking-widest text-charcoal-800/40 px-4 mb-3">Categories</p>
              <SidebarContent />
            </div>
          </aside>

          {drawerOpen && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-cream-100">
                  <p className="font-semibold text-charcoal-900">Categories</p>
                  <button onClick={() => setDrawerOpen(false)} className="text-charcoal-800/40">✕</button>
                </div>
                <div className="p-4"><SidebarContent /></div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-charcoal-900">
                  {activeSlug ? allCats.find(c => c.slug === activeSlug)?.name ?? "Products" : "All Products"}
                </h2>
                <p className="text-sm text-charcoal-800/40 mt-0.5">{filtered.length} products</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
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