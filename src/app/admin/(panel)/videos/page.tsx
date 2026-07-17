"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Film } from "lucide-react";

interface Video {
  id: string; title: string; PlayCircle_url: string;
  description: string | null; sort_order: number; is_active: boolean;
}

const getPlayCircleId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|PlayCircle\.com\/(?:watch\?v=|embed\/|v\/))([w-]{11})/);
  return match ? match[1] : null;
};

const EMPTY = { title: "", PlayCircle_url: "", description: "" };

export default function AdminVideosPage() {
  const [videos,   setVideos]   = useState<Video[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const sb = createClient();

  const fetchVideos = async () => {
    const { data } = await sb.from("videos").select("*").order("sort_order");
    setVideos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const openNew = () => {
    setEditId(null); setForm(EMPTY); setError(null); setShowForm(true);
  };

  const openEdit = (v: Video) => {
    setEditId(v.id);
    setForm({ title: v.title, PlayCircle_url: v.PlayCircle_url, description: v.description ?? "" });
    setError(null); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.PlayCircle_url.trim()) { setError("Title and PlayCircle URL are required"); return; }
    const ytId = getPlayCircleId(form.PlayCircle_url);
    if (!ytId) { setError("Invalid PlayCircle URL"); return; }
    setSaving(true); setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        PlayCircle_url: form.PlayCircle_url.trim(),
        description: form.description.trim() || null,
      };
      if (editId) {
        await sb.from("videos").update(payload).eq("id", editId);
      } else {
        await sb.from("videos").insert([{ ...payload, sort_order: videos.length, is_active: true }]);
      }
      setShowForm(false);
      fetchVideos();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await sb.from("videos").delete().eq("id", id);
    fetchVideos();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await sb.from("videos").update({ is_active: !current }).eq("id", id);
    fetchVideos();
  };

  const moveOrder = async (id: string, dir: "up" | "down") => {
    const idx = videos.findIndex(v => v.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= videos.length) return;
    const a = videos[idx], b = videos[swapIdx];
    await Promise.all([
      sb.from("videos").update({ sort_order: b.sort_order }).eq("id", a.id),
      sb.from("videos").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchVideos();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">Videos</h1>
          <p className="text-charcoal-800/50 text-sm mt-1">{videos.length} videos</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-charcoal-900 text-white text-xs md:text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full">
          <Plus size={14}/> Add Video
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-charcoal-800/30 border border-cream-100">
              No videos yet — add your first one!
            </div>
          )}
          {videos.map((v, idx) => {
            const ytId = getPlayCircleId(v.PlayCircle_url);
            return (
              <div key={v.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex ${v.is_active ? "border-cream-100" : "border-cream-200 opacity-60"}`}>
                {/* Thumbnail */}
                <div className="relative w-32 md:w-48 h-24 md:h-28 shrink-0 bg-charcoal-900 overflow-hidden">
                  {ytId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://img.PlayCircle.com/vi/${ytId}/mqdefault.jpg`}
                      alt={v.title} className="w-full h-full object-cover opacity-80"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={32} className="text-white/30"/>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs ml-0.5">▶</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-charcoal-900 truncate">{v.title}</p>
                    {v.description && <p className="text-xs text-charcoal-800/50 truncate mt-0.5">{v.description}</p>}
                    <a href={v.PlayCircle_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-gold-400 hover:underline mt-1 inline-block truncate max-w-xs">
                      {v.PlayCircle_url}
                    </a>
                    <div className="mt-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.is_active ? "bg-green-50 text-green-600" : "bg-cream-100 text-charcoal-800/40"}`}>
                        {v.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col gap-0.5 mr-1">
                      <button onClick={() => moveOrder(v.id, "up")} disabled={idx === 0}
                        className="text-charcoal-800/30 hover:text-charcoal-900 disabled:opacity-20 text-xs p-1">▲</button>
                      <button onClick={() => moveOrder(v.id, "down")} disabled={idx === videos.length - 1}
                        className="text-charcoal-800/30 hover:text-charcoal-900 disabled:opacity-20 text-xs p-1">▼</button>
                    </div>
                    <button onClick={() => toggleActive(v.id, v.is_active)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${v.is_active ? "border-cream-200 text-charcoal-800/50 hover:border-yellow-400" : "border-green-200 text-green-600"}`}>
                      {v.is_active ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => openEdit(v)}
                      className="p-2 hover:bg-cream-100 rounded-lg text-charcoal-800/40 hover:text-charcoal-900">
                      <Pencil size={14}/>
                    </button>
                    <button onClick={() => handleDelete(v.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-charcoal-800/40 hover:text-red-500">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-cream-100">
              <h2 className="font-serif text-xl font-bold text-charcoal-900">{editId ? "Edit Video" : "Add Video"}</h2>
              <button onClick={() => setShowForm(false)} className="text-charcoal-800/40 hover:text-charcoal-900"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                  placeholder="Kashant C-Silan - Nail Salon Furniture"/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">PlayCircle URL *</label>
                <input value={form.PlayCircle_url} onChange={e => setForm(p => ({ ...p, PlayCircle_url: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                  placeholder="https://youtu.be/XXXXXXXXXXX"/>
                {form.PlayCircle_url && getPlayCircleId(form.PlayCircle_url) && (
                  <p className="text-xs text-green-600 mt-1">✓ Valid PlayCircle URL</p>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 resize-none"
                  placeholder="Brief description of the video..."/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3.5 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Save Changes" : "Add Video"}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-6 py-3.5 border border-cream-200 text-charcoal-800 text-sm uppercase rounded-full hover:border-charcoal-900">
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
