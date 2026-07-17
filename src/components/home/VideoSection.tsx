"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  description: string | null;
}

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([w-]{11})/);
  return match ? match[1] : null;
}

export default function VideoSection() {
  const [videos,  setVideos]  = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    createClient()
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setVideos(data ?? []));
  }, []);

  if (videos.length === 0) {
    return (
      <div className="relative aspect-video bg-wood-900 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="text-center text-white/30">
          <Play size={40} className="mx-auto mb-2 opacity-30"/>
          <p className="text-sm">Video coming soon</p>
        </div>
      </div>
    );
  }

  const video = videos[current];
  const ytId  = getYouTubeId(video?.youtube_url);

  const handlePrev = () => { setCurrent(i => (i - 1 + videos.length) % videos.length); setPlaying(false); };
  const handleNext = () => { setCurrent(i => (i + 1) % videos.length); setPlaying(false); };

  return (
    <div className="space-y-3">
      <div className="relative aspect-video bg-wood-900 rounded-lg overflow-hidden shadow-2xl">
        {playing && ytId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <>
            {ytId ? (
              <Image
                src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                alt={video.title}
                fill
                className="object-cover opacity-80"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-wood-800 to-wood-900"/>
            )}
            <div className="absolute inset-0 bg-wood-900/30"/>
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group">
              <div className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
                <Play size={28} className="text-wood-800 ml-1.5" fill="currentColor"/>
              </div>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
              <p className="text-white font-semibold">{video.title}</p>
              {video.description && (
                <p className="text-white/70 text-sm mt-0.5">{video.description}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails for multiple videos */}
      {videos.length > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={handlePrev}
            className="w-8 h-8 bg-wood-100 hover:bg-wood-200 rounded-full flex items-center justify-center transition-colors shrink-0">
            <ChevronLeft size={14} className="text-wood-700"/>
          </button>
          <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
            {videos.map((v, i) => {
              const id = getYouTubeId(v.youtube_url);
              return (
                <button key={v.id}
                  onClick={() => { setCurrent(i); setPlaying(false); }}
                  className={`relative w-20 h-12 rounded overflow-hidden shrink-0 border-2 transition-all ${
                    i === current ? "border-gold-400" : "border-transparent opacity-60 hover:opacity-100"
                  }`}>
                  {id ? (
                    <Image
                      src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                      alt={v.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-wood-200 flex items-center justify-center">
                      <Play size={12} className="text-wood-500"/>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={handleNext}
            className="w-8 h-8 bg-wood-100 hover:bg-wood-200 rounded-full flex items-center justify-center transition-colors shrink-0">
            <ChevronRight size={14} className="text-wood-700"/>
          </button>
        </div>
      )}
    </div>
  );
}