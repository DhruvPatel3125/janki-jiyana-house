import React, { useState, useEffect, useRef } from 'react';
import { Youtube, ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { VideoSkeleton } from './skeletons/VideoSkeleton';

export const TrendingVideosSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await api.getVideos();
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load trending videos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && videos.length === 0) return null;

  return (
    <section className="mx-3 sm:mx-6 lg:mx-8 py-6 space-y-4 sm:space-y-6">
      {/* Header Title Matching Reference Image */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Our Trending Video
            </span>
            <span className="bg-rose-100 text-rose-600 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Youtube className="w-3.5 h-3.5 fill-rose-600" /> Shorts & Demos
            </span>
          </div>
          <div className="h-1 w-24 bg-brand-600 rounded-full mt-1.5"></div>
        </div>

        {/* Scroll Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-xs active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-xs active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track of Vertical 9:16 Shorts Cards */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
      >
        {loading
          ? [1, 2, 3, 4].map((idx) => <VideoSkeleton key={idx} />)
          : videos.map((video) => (
            <div
              key={video._id}
              className="snap-start flex-shrink-0 w-[240px] sm:w-[270px] aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-white relative group transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* Embedded YouTube Shorts Player */}
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&enablejsapi=1`}
                title={video.title}
                className="w-full h-full object-cover rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />

              {/* Top Channel Header Pill Overlay */}
              <div className="absolute top-3 left-3 right-3 pointer-events-none z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  JJ
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-white truncate leading-tight">
                    {video.channelName || 'Janki Jiyana House'}
                  </p>
                  <p className="text-[9px] text-teal-300 font-bold uppercase tracking-wider">
                    Official Channel
                  </p>
                </div>
              </div>

              {/* Bottom Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-sm">
                  {video.title}
                </p>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};
