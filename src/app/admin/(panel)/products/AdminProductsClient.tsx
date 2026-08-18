"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Pencil } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

interface Category { id: string; name: string; parent_id: string | null; }
interface Product {
  id: string; name: string; slug: string;
  price_usd: number | null; is_active: boolean; is_featured: boolean;
  categories: { name: string; id: string } | null;
  product_variants: { id: string }[];
}

interface Props { products: Product[]; categories: Category[]; }

export default function AdminProductsClient({ products, categories }: Props) {
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [status,    setStatus]    = useState("");

  const parents = categories.filter(c => !c.parent_id);
  const kids    = (pid: string) => categories.filter(c => c.parent_id === pid);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat    = !catFilter || p.categories?.id === catFilter;
      const matchStatus = !status
        || (status === "active"   &&  p.is_active)
        || (status === "hidden"   && !p.is_active)
        || (status === "featured" &&  p.is_featured);
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, status]);

  const inputCls = "border border-wood-300 rounded-xl px-3 py-2 text-sm text-charcoal-900 bg-wood-900 focus:outline-none focus:border-gold-400";

  return (
    <div>
      {/* Filters */}
      <div className="bg-wood-50 rounded-2xl p-4 shadow-sm border border-wood-800 mb-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-800/60"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className={`w-full pl-9 pr-4 py-2 placeholder:text-charcoal-800/40 ${inputCls}`}/>
        </div>

        {/* Category filter */}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className={`min-w-40 ${inputCls}`}>
          <option value="">All Categories</option>
          {parents.map(parent => (
            <optgroup key={parent.id} label={parent.name}>
              <option value={parent.id}>{parent.name}</option>
              {kids(parent.id).map(child => (
                <option key={child.id} value={child.id}>　{child.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Status filter */}
        <select value={status} onChange={e => setStatus(e.target.value)}
          className={`min-w-32 ${inputCls}`}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
          <option value="featured">Featured</option>
        </select>

        {/* Result count */}
        <div className="flex items-center text-sm text-charcoal-800/60 px-2">
          {filtered.length} results
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="bg-wood-50 rounded-2xl p-4 border border-wood-800 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm text-charcoal-900 truncate">{p.name}</p>
                <p className="text-xs text-charcoal-800/60 mt-0.5">{p.categories?.name ?? "—"}</p>
                <div className="flex gap-2 mt-2 flex-wrap items-center">
                  {p.price_usd && <span className="text-xs font-semibold text-charcoal-900">${p.price_usd.toLocaleString()}</span>}
                  <span className="text-xs text-charcoal-800/60">{p.product_variants?.length ?? 0} colors</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-500/15 text-green-400" : "bg-wood-900 text-charcoal-800/50"}`}>
                    {p.is_active ? "Active" : "Hidden"}
                  </span>
                  {p.is_featured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-400/15 text-gold-400">Featured</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link href={`/admin/products/edit?id=${p.id}`}
                  className="p-2 hover:bg-wood-100 rounded-lg text-charcoal-800/60 hover:text-white transition-colors">
                  <Pencil size={14}/>
                </Link>
                <DeleteProductButton productId={p.id}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-wood-50 rounded-2xl shadow-sm border border-wood-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-wood-800 bg-wood-900">
              {["Product","Category","Price","Colors","Status",""].map(h => (
                <th key={h} className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/60">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-800">
            {filtered.length > 0 ? filtered.map(p => (
              <tr key={p.id} className="hover:bg-wood-100 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-sm text-charcoal-900">{p.name}</p>
                  <p className="text-xs text-charcoal-800/50">{p.slug}</p>
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-800/80">{p.categories?.name ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-charcoal-900">{p.price_usd ? `$${p.price_usd.toLocaleString()}` : "—"}</td>
                <td className="px-6 py-4 text-sm text-charcoal-800/80">{p.product_variants?.length ?? 0}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${p.is_active ? "bg-green-500/15 text-green-400" : "bg-wood-900 text-charcoal-800/50"}`}>
                    {p.is_active ? "Active" : "Hidden"}
                  </span>
                  {p.is_featured && <span className="ml-2 text-xs px-3 py-1 rounded-full bg-gold-400/15 text-gold-400">Featured</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/products/edit?id=${p.id}`}
                      className="p-2 hover:bg-wood-100 rounded-lg text-charcoal-800/60 hover:text-white transition-colors">
                      <Pencil size={14}/>
                    </Link>
                    <DeleteProductButton productId={p.id}/>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-charcoal-800/40 text-sm">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
