import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import AdminProductsClient from "./AdminProductsClient";
export default async function AdminProductsPage() {
  const supabase = await createServerSupabaseClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, categories(name,id), product_variants(id)").order("created_at", { ascending: false }),
    supabase.from("categories").select("id,name,parent_id").eq("is_active", true).order("sort_order"),
  ]);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">Products</h1>
          <p className="text-white/50 text-sm mt-1">{products?.length ?? 0} total</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-wood-500 text-white text-xs md:text-sm tracking-widest uppercase hover:bg-wood-600 transition-colors rounded-full">
          <Plus size={14}/> Add Product
        </Link>
      </div>
      <AdminProductsClient products={products ?? []} categories={categories ?? []} />
    </div>
  );
}
