"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, GripVertical, X, Upload } from "lucide-react";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM = {
  title:    "",
  subtitle: "",
  cta_text: "Shop Collection",
  cta_link: "/products",
};

export default function AdminBannersPage() {
  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const supabase = createClient();

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order");
    setBanners(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setPreview(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({
      title:    b.title,
      subtitle: b.subtitle ?? "",
      cta_text: b.cta_text ?? "",
      cta_link: b.cta_link ?? "",
    });
    setPreview(b.image_url);
    setImageFile(null);
    setError(null);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError(null);
    try {
      let image_url: string | null = editId
        ? (banners.find((b) => b.id === editId)?.image_url ?? null)
        : null;

      // Upload new image if selected
      if (imageFile) {
        const ext      = imageFile.name.split(".").pop();
        const fileName = `banner-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }

      const payload = {
        title:      form.title,
        subtitle:   form.subtitle || null,
        cta_text:   form.cta_text || null,
        cta_link:   form.cta_link || null,
        image_url,
      };

      if (editId) {
        const { error: err } = await supabase.from("banners").update(payload).eq("id", editId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("banners").insert([{
          ...payload,
          sort_order: banners.length,
          is_active:  true,
        }]);
        if (err) throw err;
      }

      setShowForm(false);
      fetchBanners();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    fetchBanners();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    fetchBanners();
  };

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const idx = banners.findIndex((b) => b.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    const a = banners[idx];
    const b = banners[swapIdx];

    await Promise.all([
      supabase.from("banners").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("banners").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchBanners();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">Banners</h1>
          <p className="text-charcoal-800/50 text-sm mt-1">Manage hero carousel slides</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-charcoal-900 text-white text-xs md:text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full">
          <Plus size={14} /> Add Banner
        </button>
      </div>

      {/* Banner list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {banners.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-charcoal-800/30 border border-cream-100">
              No banners yet — add your first one!
            </div>
          )}
          {banners.map((b, idx) => (
            <div key={b.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex transition-all ${
                b.is_active ? "border-cream-100" : "border-cream-200 opacity-60"
              }`}>
              {/* Thumbnail */}
              <div className="relative w-32 md:w-48 h-24 md:h-32 shrink-0 bg-charcoal-900">
                {b.image_url ? (
                  <Image src={b.image_url} alt={b.title} fill className="object-cover opacity-70" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-charcoal-900 to-charcoal-800" />
                )}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <p className="text-white text-xs font-serif font-bold text-center line-clamp-2 leading-snug">
                    {b.title}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex items-center justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-charcoal-900 truncate">{b.title}</p>
                  {b.subtitle && (
                    <p className="text-xs text-charcoal-800/50 truncate mt-0.5">{b.subtitle}</p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {b.cta_text && (
                      <span className="text-[10px] px-2 py-0.5 bg-cream-100 text-charcoal-800/60 rounded-full">
                        {b.cta_text} → {b.cta_link}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      b.is_active ? "bg-green-50 text-green-600" : "bg-cream-100 text-charcoal-800/40"
                    }`}>
                      {b.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Order buttons */}
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button onClick={() => moveOrder(b.id, "up")} disabled={idx === 0}
                      className="text-charcoal-800/30 hover:text-charcoal-900 disabled:opacity-20 text-xs leading-none p-1">
                      ▲
                    </button>
                    <button onClick={() => moveOrder(b.id, "down")} disabled={idx === banners.length - 1}
                      className="text-charcoal-800/30 hover:text-charcoal-900 disabled:opacity-20 text-xs leading-none p-1">
                      ▼
                    </button>
                  </div>
                  <button onClick={() => toggleActive(b.id, b.is_active)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                      b.is_active
                        ? "border-cream-200 text-charcoal-800/50 hover:border-yellow-400 hover:text-yellow-600"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}>
                    {b.is_active ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => openEdit(b)}
                    className="p-2 hover:bg-cream-100 rounded-lg text-charcoal-800/40 hover:text-charcoal-900 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-charcoal-800/40 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-cream-100">
              <h2 className="font-serif text-xl font-bold text-charcoal-900">
                {editId ? "Edit Banner" : "New Banner"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-charcoal-800/40 hover:text-charcoal-900">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Image upload */}
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-2 block">
                  Background Image
                </label>
                <label className="cursor-pointer block">
                  <div className="relative w-full h-36 rounded-xl border-2 border-dashed border-cream-200 hover:border-gold-400 transition-colors overflow-hidden bg-charcoal-900">
                    {preview ? (
                      <Image src={preview} alt="preview" fill className="object-cover opacity-70" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <Upload size={20} className="text-white/30" />
                        <p className="text-white/30 text-xs">Upload background image</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="text-xs text-charcoal-800/30 mt-1">Recommended: 1920×1080px. Leave empty for dark gradient.</p>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                  Title * <span className="normal-case text-charcoal-800/30">(use \n for line break)</span>
                </label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                  placeholder="Elevate Your Salon.\nElevate Your Brand." />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Subtitle</label>
                <textarea rows={2} value={form.subtitle}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 resize-none"
                  placeholder="Premium nail salon furniture for the modern US salon..." />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Button Text</label>
                  <input value={form.cta_text}
                    onChange={(e) => setForm((p) => ({ ...p, cta_text: e.target.value }))}
                    className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                    placeholder="Shop Collection" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Button Link</label>
                  <input value={form.cta_link}
                    onChange={(e) => setForm((p) => ({ ...p, cta_link: e.target.value }))}
                    className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                    placeholder="/products" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3.5 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Save Changes" : "Add Banner"}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-6 py-3.5 border border-cream-200 text-charcoal-800 text-sm uppercase tracking-widest hover:border-charcoal-900 transition-colors rounded-full">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
