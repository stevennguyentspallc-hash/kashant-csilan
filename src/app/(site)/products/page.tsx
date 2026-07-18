"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { ChevronDown, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";

interface CatTree extends Category { children: Category[]; }

function ProductsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const urlCategory  = searchParams.get("category") ?? "";
  const urlSearch    = searchParams.get("q") ?? "";

  const [allCats,   setAllCats]   = useState<Category[]>([]);
  const [tree,      setTree]      = useState<CatTree[]>([]);
  const [products,  setProducts]  = useState<Product[]>([]);
  const [filtered,  setFiltered]  = useState<Product[]>([]);
  const [search,    setSearch]    = useState(urlSearch);
  const [loading,   setLoading]   = useState(true);
  const [drawer,    setDrawer]    = useState(false);

  // Sync URL params to state
  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);

  useEffect(() => {
    const sb = createClient();
    Promise.all([
      sb.from("categories").select("*").eq("is_active", true).order("sort_order"),
      sb.from("products").select("*, categories(*), product_variants(*)").eq("is_active", true).order("sort_order"),
    ]).then(([{ data: cats }, { data: prods }]) => {
      const c = (cats ?? []) as Category[];
      setAllCats(c);
      const parents = c.filter(x => !x.parent_id);
      setTree(parents.map(p => ({ ...p, children: c.filter(x => x.parent_id === p.id) })));
      setProducts(prods ?? []);
      setLoading(false);
    });
  }, []);

  // Filter whenever URL params or products change
  useEffect(() => {
    let r = [...products];
    if (urlCategory) {
      const cat = allCats.find(c => c.slug === urlCategory);
      if (cat) {
        const childIds = allCats.filter(c => c.parent_id === cat.id).map(c => c.id);
        const ids = [cat.id, ...childIds];
        r = r.filter(p => ids.includes((p.categories as Category | undefined)?.id ?? ""));
      }
    }
    if (urlSearch.trim()) {
      const q = urlSearch.toLowerCase();
      r = r.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.categories as Category | undefined)?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [urlCategory, urlSearch, products, allCats]);

  // Navigate with URL params
  const selectCategory = (slug: string | null) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (search.trim()) params.set("q", search.trim());
    router.push(`/products?${params.toString()}`);
    setDrawer(false);
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (urlCategory) params.set("category", urlCategory);
    if (value.trim()) params.set("q", value.trim());
    router.push(`/products?${params.toString()}`);
  }, [urlCategory, router]);

  const clearSearch = () => handleSearch("");
  const clearCategory = () => selectCategory(null);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    setExpanded(new Set(allCats.filter(c => !c.parent_id).map(c => c.id)));
  }, [allCats]);

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const SidebarContent = () => (
    <div className="space-y-0.5">
      <button onClick={() => selectCategory(null)}
        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${!urlCategory ? "bg-charcoal-900 text-white" : "text-charcoal-800 hover:bg-cream-100"}`}>
        All Products
        <span className="text-xs opacity-40">{products.length}</span>
      </button>
      <div className="h-px bg-cream-200 my-2" />
      {tree.map(parent => {
        const isExp = expanded.has(parent.id);
        const isAct = urlCategory === parent.slug;
        const cnt = products.filter(p => {
          const cid = (p.categories as Category | undefined)?.id ?? "";
          return cid === parent.id || parent.children.some(c => c.id === cid);
        }).length;
        return (
          <div key={parent.id}>
            <div className={`flex items-center rounded-xl ${isAct ? "bg-gold-400/10" : "hover:bg-cream-100"}`}>
              <button onClick={() => selectCategory(parent.slug)}
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
                  const isCA = urlCategory === child.slug;
                  const cc = products.filter(p => (p.categories as Category | undefined)?.slug === child.slug).length;
                  return (
                    <button key={child.id} onClick={() => selectCategory(child.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${isCA ? "bg-gold-400 text-white font-medium" : "text-charcoal-800/60 hover:bg-cream-100 hover:text-charcoal-900"}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCA ? "bg-white" : "bg-gold-400/50"}`}/>
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

  const activeName = urlCategory
    ? allCats.find(c => c.slug === urlCategory)?.name ?? "Products"
    : "All Products";

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-charcoal-900 pt-28 pb-12 px-8 w-full">
        <div className="w-full max-w-screen-2xl mx-auto">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-2">Our Catalog</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Products</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-800/40"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(search); }}
              placeholder="Search products... (Enter to search)"
              className="w-full pl-10 pr-10 py-3 bg-white border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400"/>
            {search && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-800/30 hover:text-charcoal-900">
                <X size={14}/>
              </button>
            )}
          </div>
          <button onClick={() => handleSearch(search)}
            className="px-5 py-3 bg-charcoal-900 text-white text-sm rounded-xl hover:bg-gold-500 transition-colors">
            Search
          </button>
          <button onClick={() => setDrawer(true)}
            className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-cream-200 rounded-xl text-sm hover:border-gold-400 transition-colors">
            <SlidersHorizontal size={15}/> Filter
          </button>
        </div>

        {/* Active filters */}
        {(urlCategory || urlSearch) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {urlCategory && (
              <span className="inline-flex items-center gap-1.5 bg-gold-400/10 text-gold-500 text-xs px-3 py-1.5 rounded-full">
                Category: {allCats.find(c => c.slug === urlCategory)?.name}
                <button onClick={clearCategory} className="hover:text-gold-600"><X size={11}/></button>
              </span>
            )}
            {urlSearch && (
              <span className="inline-flex items-center gap-1.5 bg-charcoal-900/10 text-charcoal-800 text-xs px-3 py-1.5 rounded-full">
                Search: "{urlSearch}"
                <button onClick={clearSearch} className="hover:text-charcoal-900"><X size={11}/></button>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-100 sticky top-24">
              <p className="text-[10px] uppercase tracking-widest text-charcoal-800/40 px-4 mb-3">Categories</p>
              <SidebarContent/>
            </div>
          </aside>

          {/* Mobile drawer */}
          {drawer && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)}/>
              <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-cream-100">
                  <p className="font-semibold text-charcoal-900 text-sm">Categories</p>
                  <button onClick={() => setDrawer(false)} className="text-charcoal-800/40 text-lg">✕</button>
                </div>
                <div className="p-4"><SidebarContent/></div>
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="flex-1 min-w-0 w-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-charcoal-900">{activeName}</h2>
                <p className="text-sm text-charcoal-800/40 mt-0.5">{filtered.length} products</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-[4/3] bg-cream-200"/>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-cream-200 rounded w-3/4"/>
                      <div className="h-3 bg-cream-200 rounded w-1/2"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p}/>)}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-cream-100">
                <p className="font-serif text-2xl text-charcoal-800/30 mb-2">No products found</p>
                <p className="text-sm text-charcoal-800/20 mb-4">Try a different keyword or category</p>
                <button onClick={() => { clearSearch(); clearCategory(); }}
                  className="px-6 py-2.5 bg-charcoal-900 text-white text-xs tracking-widest uppercase rounded-full hover:bg-gold-500 transition-colors">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <ProductsContent/>
    </Suspense>
  );
}
