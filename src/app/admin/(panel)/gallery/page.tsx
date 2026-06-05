"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, X } from "lucide-react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  tag: string | null;
  sort_order: number;
  is_active: boolean;
}

const TAGS = [
  "All",
  "Pedicure Chairs",
  "Manicure Tables",
  "Reception Desks",
  "Salon Chairs",
  "Spa Beds",
  "Full Salon",
];

export default function AdminGalleryPage() {
  const [items,     setItems]     = useState<GalleryItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);

  // Upload form state
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tag,     setTag]     = useState("");

  const supabase = createClient();

  const fetchGallery = async () => {
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const ext      = file.name.split(".").pop();
      const fileName = `gallery-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      const { error: dbErr } = await supabase.from("gallery").insert([{
        image_url:  urlData.publicUrl,
        caption:    caption || null,
        tag:        tag || null,
        sort_order: 0,
        is_active:  true,
      }]);
      if (dbErr) throw dbErr;

      setSuccess("Photo uploaded!");
      setFile(null);
      setPreview(null);
      setCaption("");
      setTag("");
      setTimeout(() => setSuccess(null), 3000);
      fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await supabase.from("gallery").delete().eq("id", id);
      // Extract filename and delete from storage
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }
      fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("gallery").update({ is_active: !current }).eq("id", id);
    fetchGallery();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">Gallery</h1>
        <p className="text-charcoal-800/50 text-sm mt-1">{items.length} photos</p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100 mb-8">
        <h2 className="font-semibold text-charcoal-900 mb-4">Upload New Photo</h2>

        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>}

        <div className="flex flex-col md:flex-row gap-6">
          {/* File picker */}
          <label className="cursor-pointer shrink-0">
            <div className="w-full md:w-40 h-40 rounded-2xl border-2 border-dashed border-cream-200 hover:border-gold-400 transition-colors flex flex-col items-center justify-center overflow-hidden bg-cream-50">
              {preview ? (
                <div className="relative w-full h-full">
                  <Image src={preview} alt="preview" fill className="object-cover rounded-2xl" />
                  <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-cream-200 mb-2" />
                  <p className="text-xs text-charcoal-800/40 text-center px-2">Click to upload</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Caption</label>
              <input value={caption} onChange={(e) => setCaption(e.target.value)}
                className="w-full border border-cream-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400"
                placeholder="Beautiful pedicure area setup..." />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Tag</label>
              <select value={tag} onChange={(e) => setTag(e.target.value)}
                className="w-full border border-cream-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 bg-white">
                <option value="">No tag</option>
                {TAGS.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleUpload} disabled={!file || uploading}
              className="w-full py-3 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full disabled:opacity-40">
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
              item.is_active ? "border-transparent" : "border-red-200 opacity-50"
            }`}>
              <Image src={item.image_url} alt={item.caption ?? "Gallery"} fill className="object-cover" />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => toggleActive(item.id, item.is_active)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    item.is_active
                      ? "bg-yellow-400 text-charcoal-900"
                      : "bg-green-400 text-white"
                  }`}>
                  {item.is_active ? "Hide" : "Show"}
                </button>
                <button onClick={() => handleDelete(item.id, item.image_url)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Tag badge */}
              {item.tag && (
                <span className="absolute top-2 left-2 bg-white/90 text-charcoal-900 text-[10px] px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-charcoal-800/30">
          <Upload size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No photos yet — upload your first one above!</p>
        </div>
      )}
    </div>
  );
}
