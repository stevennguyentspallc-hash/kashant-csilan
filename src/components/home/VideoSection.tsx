"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  description: string | null;
}

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1];
      return id ? id.split("?")[0].split("&")[0].trim().substring(0, 11) : null;
    }
    if (url.includes("v=")) {
      const id = url.split("v=")[1];
      return id ? id.split("&")[0].trim().substring(0, 11) : null;
    }
    if (url.includes("/embed/")) {
      const id = url.split("/embed/")[1];
      return id ? id.split("?")[0].trim().substring(0, 11) : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function VideoSection() {
  const [videos,  setVideos]  = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    createClient()
      .from("videos").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => { setVideos(data ?? []); });
  }, []);

  useEffect(() => { setPlaying(false); }, [current]);

  if (videos.length === 0) {
    return (
      <div className="relative aspect-video bg-wood-900 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="text-center text-white/30">
          <Play size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Video coming soon</p>
        </div>
      </div>
    );
  }

  const video = videos[current];
  const ytId = getYouTubeId(video?.youtube_url);
  const thumbUrl = ytId ? "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg" : null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-video bg-wood-900 rounded-lg overflow-hidden shadow-2xl">
        {playing && ytId ? (
          <iframe
            key={ytId + "-iframe"}
            src={"https://www.youtube.com/embed/" + ytId + "?autoplay=1&rel=0"}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          />
        ) : (
          <>
            {thumbUrl && (
              <div
                className="absolute inset-0 opacity-80"
                style={{ backgroundImage: "url(" + thumbUrl + ")", backgroundSize: "cover", backgroundPosition: "center" }}
              />
            )}
            {!thumbUrl && <div className="absolute inset-0 bg-gradient-to-br from-wood-800 to-wood-900" />}
            <div className="absolute inset-0 bg-black/20" />
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              onClick={() => setPlaying(true)}
            >
              <div className="w-20 h-20 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
                <Play size={28} className="text-wood-800 ml-1.5" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 pointer-events-none">
              <p className="text-white font-semibold">{video.title}</p>
              {video.description && <p className="text-white/70 text-sm mt-0.5">{video.description}</p>}
            </div>
          </>
        )}
      </div>

      {videos.length > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(i => (i - 1 + videos.length) % videos.length)}
            className="w-8 h-8 bg-wood-100 hover:bg-wood-200 rounded-full flex items-center justify-center shrink-0">
            <ChevronLeft size={14} className="text-wood-700" />
          </button>
          <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
            {videos.map((v, i) => {
              const id = getYouTubeId(v.youtube_url);
              return (
                <button key={v.id} onClick={() => setCurrent(i)}
                  className={"relative w-20 h-12 rounded overflow-hidden shrink-0 border-2 transition-all " + (i === current ? "border-gold-400" : "border-transparent opacity-60 hover:opacity-100")}
                  style={id ? { backgroundImage: "url(https://img.youtube.com/vi/" + id + "/mqdefault.jpg)", backgroundSize: "cover" } : {}}>
                  {!id && <div className="w-full h-full bg-wood-200" />}
                </button>
              );
            })}
          </div>
          <button onClick={() => setCurrent(i => (i + 1) % videos.length)}
            className="w-8 h-8 bg-wood-100 hover:bg-wood-200 rounded-full flex items-center justify-center shrink-0">
            <ChevronRight size={14} className="text-wood-700" />
          </button>
        </div>
      )}
    </div>
  );
}