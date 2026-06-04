"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types";

interface Variant {
  id?: string;
  color_name: string;
  color_hex: string;
  image_file: File | null;
  image_preview: string | null;
  image_url: string | null;
}

export default function EditProductPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const productId   = searchParams.get("id");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", slug: "", category_id: "", description: "",
    price_usd: "", dimensions: "", weight_lbs: "",
    lead_time: "", is_featured: false, is_active: true,
  });

  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      setCategories(data ?? []);
    });

    if (!productId) return;
    supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", productId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setForm({
          name:        data.name ?? "",
          slug:        data.slug ?? "",
          category_id: data.category_id ?? "",
          description: data.description ?? "",
          price_usd:   data.price_usd?.toString() ?? "",
          dimensions:  data.dimensions ?? "",
          weight_lbs:  data.weight_lbs?.toString() ?? "",
          lead_time:   data.lead_time ?? "",
          is_featured: data.is_featured ?? false,
          is_active:   data.is_active ?? true,
        });
        setVariants(
          (data.product_variants ?? []).map((v: {
            id: string;
            color_name: string;
            color_hex: string | null;
            image_url: string | null;
          }) => ({
            id:            v.id,
            color_name:    v.color_name,
            color_hex:     v.color_hex ?? "#ffffff",
            image_file:    null,
            image_preview: v.image_url,
            image_url:     v.image_url,
          }))
        );
        setFetching(false);
      });
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color_name: "", color_hex: "#ffffff", image_file: null, image_preview: null, image_url: null },
    ]);
  };

  const removeVariant = (i: number) => setVariants((prev) => prev.filter((_, idx) => idx !== i));

  const updateVariant = (i: number, field: keyof Variant, value: string | File | null) => {
    setVariants((prev) =>
      prev.map((v, idx) => {
        if (idx !== i) return v;
        if (field === "image_file" && value instanceof File) {
          return { ...v, image_file: value, image_preview: URL.createObjectURL(value) };
        }
        return { ...v, [field]: value };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Update product
      const { error: productErr } = await supabase
        .from("products")
        .update({
          name:        form.name,
          slug:        form.slug,
          category_id: form.category_id || null,
          description: form.description || null,
          price_usd:   form.price_usd ? parseFloat(form.price_usd) : null,
          dimensions:  form.dimensions || null,
          weight_lbs:  form.weight_lbs ? parseFloat(form.weight_lbs) : null,
          lead_time:   form.lead_time || null,
          is_featured: form.is_featured,
          is_active:   form.is_active,
        })
        .eq("id", productId);

      if (productErr) throw productErr;

      // Delete old variants and re-insert
      await supabase.from("product_variants").delete().eq("product_id", productId);

      for (const [idx, variant] of variants.entries()) {
        if (!variant.color_name) continue;
        let image_url = variant.image_url;

        if (variant.image_file) {
          const ext      = variant.image_file.name.split(".").pop();
          const fileName = `${productId}-${idx}-${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(fileName, variant.image_file, { upsert: true });

          if (!uploadErr) {
            const { data: urlData } = supabase.storage
              .from("product-images")
              .getPublicUrl(fileName);
            image_url = urlData.publicUrl;
          }
        }

        await supabase.from("product_variants").insert([{
          product_id: productId,
          color_name: variant.color_name,
          color_hex:  variant.color_hex,
          image_url,
          sort_order: idx,
        }]);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-charcoal-800/40 hover:text-charcoal-900">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Edit Product</h1>
          <p className="text-charcoal-800/50 text-sm mt-1">{form.name}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
          <h2 className="font-semibold text-charcoal-900 mb-5">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Product Name *</label>
              <input name="name" required value={form.name} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors bg-cream-50" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors bg-white">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Description</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none" />
            </div>
          </div>
        </div>

        {/* Pricing & Specs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
          <h2 className="font-semibold text-charcoal-900 mb-5">Pricing & Specifications</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Price (USD)</label>
              <input name="price_usd" type="number" step="0.01" value={form.price_usd} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Lead Time</label>
              <input name="lead_time" value={form.lead_time} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Dimensions (in)</label>
              <input name="dimensions" value={form.dimensions} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Weight (lbs)</label>
              <input name="weight_lbs" type="number" step="0.1" value={form.weight_lbs} onChange={handleChange}
                className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
          </div>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 accent-gold-400" />
              <span className="text-sm text-charcoal-800">Featured on homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-gold-400" />
              <span className="text-sm text-charcoal-800">Active (visible to public)</span>
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-charcoal-900">Colors & Images</h2>
            <button type="button" onClick={addVariant}
              className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-500 uppercase tracking-wider">
              <Plus size={14} /> Add Color
            </button>
          </div>
          <div className="space-y-4">
            {variants.map((v, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-cream-50 rounded-xl">
                <label className="cursor-pointer shrink-0">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-cream-200 hover:border-gold-400 transition-colors flex items-center justify-center overflow-hidden bg-white">
                    {v.image_preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.image_preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={18} className="text-cream-200" />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      updateVariant(i, "image_file", file);
                    }} />
                </label>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-charcoal-800/40 mb-1 block">Color Name</label>
                    <input value={v.color_name} onChange={(e) => updateVariant(i, "color_name", e.target.value)}
                      className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-400 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-charcoal-800/40 mb-1 block">Color Swatch</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={v.color_hex} onChange={(e) => updateVariant(i, "color_hex", e.target.value)}
                        className="w-10 h-10 rounded-lg border border-cream-200 cursor-pointer p-1 bg-white" />
                      <input value={v.color_hex} onChange={(e) => updateVariant(i, "color_hex", e.target.value)}
                        className="flex-1 border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-400 bg-white font-mono" />
                    </div>
                  </div>
                </div>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)}
                    className="text-charcoal-800/30 hover:text-red-400 transition-colors mt-1">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-8 py-3.5 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/products"
            className="px-8 py-3.5 border border-cream-200 text-charcoal-800 text-sm tracking-widest uppercase hover:border-charcoal-900 transition-colors rounded-full">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
