import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), product_variants(id)")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Products</h1>
          <p className="text-charcoal-800/50 text-sm mt-1">{products?.length ?? 0} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-100 bg-cream-50">
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Product</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Category</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Price</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Colors</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {products && products.length > 0 ? products.map((p: {
              id: string;
              name: string;
              slug: string;
              price_usd: number | null;
              is_active: boolean;
              is_featured: boolean;
              categories: { name: string } | null;
              product_variants: { id: string }[];
            }) => (
              <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-sm text-charcoal-900">{p.name}</p>
                  <p className="text-xs text-charcoal-800/40">{p.slug}</p>
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-800/60">
                  {p.categories?.name ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-900">
                  {p.price_usd ? `$${p.price_usd.toLocaleString()}` : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-800/60">
                  {p.product_variants?.length ?? 0} colors
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    p.is_active
                      ? "bg-green-50 text-green-600"
                      : "bg-cream-100 text-charcoal-800/40"
                  }`}>
                    {p.is_active ? "Active" : "Hidden"}
                  </span>
                  {p.is_featured && (
                    <span className="ml-2 text-xs px-3 py-1 rounded-full bg-gold-400/10 text-gold-500">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/products/edit?id=${p.id}`}
                      className="p-2 hover:bg-cream-100 rounded-lg transition-colors text-charcoal-800/40 hover:text-charcoal-900"
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteProductButton productId={p.id} />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-charcoal-800/30 text-sm">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-gold-400 hover:underline">
                    Add your first product
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
