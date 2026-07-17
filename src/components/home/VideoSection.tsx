"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

interface Video {
  id: string; title: string; youtube_url: string; description: string | null;
}

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([w-]{11})/);
  return match ? match[1] : null;
};

export default function VideoSection() {
  const [videos,  setVideos]  = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    createClient().from("videos").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setVideos(data ?? []));
  }, []);

  if (videos.length === 0) return (
    <div className="relative aspect-video bg-wood-900 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
      <div className="text-center text-white/30">
        <Play size={40} className="mx-auto mb-2 opacity-30"/>
        <p className="text-sm">Video coming soon</p>
      </div>
    </div>
  );

  const video = videos[current];
  const ytId  = getYouTubeId(video.youtube_url);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video bg-wood-900 rounded-lg overflow-hidden shadow-2xl group">
        {playing && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            {ytId && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-80"/>
            )}
            <div className="absolute inset-0 bg-wood-900/40"/>
            <button onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group">
              <div className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                <Play size={24} className="text-wood-800 ml-1"/>
              </div>
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-semibold text-sm drop-shadow">{video.title}</p>
              {video.description && <p className="text-white/70 text-xs mt-0.5">{video.description}</p>}
            </div>
          </>
        )}
      </div>

      {/* Multiple video navigation */}
      {videos.length > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrent(i => (i-1+videos.length)%videos.length); setPlaying(false); }}
            className="w-8 h-8 bg-wood-100 hover:bg-wood-200 rounded-full flex items-center justify-center transition-colors">
            <ChevronLeft size={14} className="text-wood-700"/>
          </button>
          <div className="flex-1 flex gap-2 overflow-x-auto">
            {videos.map((v, i) => {
              const id = getYouTubeId(v.youtube_url);
              return (
                <button key={v.id} onClick={() => { setCurrent(i); setPlaying(false); }}
                  className={`relative w-16 h-10 rounded overflow-hidden shrink-0 border-2 transition-all ${i === current ? "border-gold-400" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  {id && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                      alt={v.title} className="w-full h-full object-cover"/>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={() => { setCurrent(i => (i+1)%videos.length); setPlaying(false); }}
            className="w-8 h-8 bg-wood-100 hover:bg-wood-200 rounded-full flex items-center justify-center transition-colors">
            <ChevronRight size={14} className="text-wood-700"/>
          </button>
        </div>
      )}
    </div>
  );
}