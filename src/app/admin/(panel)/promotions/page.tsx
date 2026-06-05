"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import Image from "next/image";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  is_active: boolean;
}

const EMPTY = {
  title: "", description: "", badge: "",
  cta_text: "Shop Now", cta_link: "/products",
  start_date: "", end_date: "",
};

export default function AdminPromotionsPage() {
  const [promos,    setPromos]    = useState<Promotion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const supabase = createClient();

  const fetch = async () => {
    const { data } = await supabase.from("promotions").select("*").order("sort_order");
    setPromos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => {
    setEditId(null); setForm(EMPTY);
    setImageFile(null); setPreview(null);
    setError(null); setShowForm(true);
  };

  const openEdit = (p: Promotion) => {
    setEditId(p.id);
    setForm({
      title:       p.title,
      description: p.description ?? "",
      badge:       p.badge ?? "",
      cta_text:    p.cta_text ?? "Shop Now",
      cta_link:    p.cta_link ?? "/products",
      start_date:  p.start_date ?? "",
      end_date:    p.end_date ?? "",
    });
    setPreview(p.image_url);
    setImageFile(null); setError(null); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError(null);
    try {
      let image_url: string | null = editId
        ? (promos.find((p) => p.id === editId)?.image_url ?? null)
        : null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `promo-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images").upload(fileName, imageFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
          image_url = urlData.publicUrl;
        }
      }

      const payload = {
        title:       form.title,
        description: form.description || null,
        badge:       form.badge || null,
        cta_text:    form.cta_text || null,
        cta_link:    form.cta_link || null,
        start_date:  form.start_date || null,
        end_date:    form.end_date || null,
        image_url,
      };

      if (editId) {
        await supabase.from("promotions").update(payload).eq("id", editId);
      } else {
        await supabase.from("promotions").insert([{ ...payload, sort_order: promos.length, is_active: true }]);
      }

      setShowForm(false);
      fetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    fetch();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("promotions").update({ is_active: !current }).eq("id", id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">Promotions</h1>
          <p className="text-charcoal-800/50 text-sm mt-1">{promos.length} promotions</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-charcoal-900 text-white text-xs md:text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full">
          <Plus size={14} /> Add Promotion
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {promos.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-charcoal-800/30 border border-cream-100">
              No promotions yet — add your first one!
            </div>
          )}
          {promos.map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex ${p.is_active ? "border-cream-100" : "border-cream-200 opacity-60"}`}>
              {/* Thumbnail */}
              <div className="relative w-32 md:w-48 h-24 md:h-32 shrink-0 bg-charcoal-900">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.title} fill className="object-cover opacity-70" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-charcoal-900 to-gold-500/20" />
                )}
                {p.badge && (
                  <span className="absolute top-2 left-2 bg-gold-400 text-white text-[9px] px-2 py-0.5 rounded-full uppercase">
                    {p.badge}
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 flex items-center justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-charcoal-900 truncate">{p.title}</p>
                  {p.description && <p className="text-xs text-charcoal-800/50 truncate mt-0.5">{p.description}</p>}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.end_date && (
                      <span className="text-[10px] px-2 py-0.5 bg-cream-100 text-charcoal-800/60 rounded-full">
                        Ends {new Date(p.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-50 text-green-600" : "bg-cream-100 text-charcoal-800/40"}`}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(p.id, p.is_active)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                      p.is_active
                        ? "border-cream-200 text-charcoal-800/50 hover:border-yellow-400 hover:text-yellow-600"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}>
                    {p.is_active ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="p-2 hover:bg-cream-100 rounded-lg text-charcoal-800/40 hover:text-charcoal-900 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-charcoal-800/40 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-cream-100">
              <h2 className="font-serif text-xl font-bold text-charcoal-900">{editId ? "Edit Promotion" : "New Promotion"}</h2>
              <button onClick={() => setShowForm(false)} className="text-charcoal-800/40 hover:text-charcoal-900"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

              {/* Image */}
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-2 block">Background Image</label>
                <label className="cursor-pointer block">
                  <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-cream-200 hover:border-gold-400 transition-colors overflow-hidden bg-charcoal-900">
                    {preview
                      ? <Image src={preview} alt="preview" fill className="object-cover opacity-70" />
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><Upload size={20} className="text-white/30" /><p className="text-white/30 text-xs">Upload image</p></div>
                    }
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setImageFile(f);
                      if (f) setPreview(URL.createObjectURL(f));
                    }} />
                </label>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                  placeholder="Summer Sale — 20% Off All Pedicure Chairs" />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 resize-none"
                  placeholder="Limited time offer for nail salon owners..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Badge</label>
                  <input value={form.badge} onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                    className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                    placeholder="20% OFF" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Button Text</label>
                  <input value={form.cta_text} onChange={(e) => setForm((p) => ({ ...p, cta_text: e.target.value }))}
                    className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                    placeholder="Shop Now" />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Button Link</label>
                <input value={form.cta_link} onChange={(e) => setForm((p) => ({ ...p, cta_link: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                  placeholder="/products" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                    className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                    className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3.5 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Save Changes" : "Add Promotion"}
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
