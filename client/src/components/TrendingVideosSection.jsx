import React, { useState, useEffect, useRef } from 'react';
import { Youtube, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { api } from '../services/api';
import { VideoSkeleton } from './skeletons/VideoSkeleton';

export const TrendingVideosSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
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
            <VideoCard key={video._id} video={video} onClick={() => setSelectedVideo(video)} />
          ))}
      </div>

      {/* Video Popup Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          {/* Close Background Overlay */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedVideo(null)} />
          
          {/* Close Button */}
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white transition-colors z-[110] p-2 bg-black/50 rounded-full"
            aria-label="Close modal"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Video Container */}
          <div className="relative w-full max-w-[400px] h-[80vh] md:h-[90vh] max-h-[850px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 z-[105]">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1&autoplay=1&mute=0`}
              title={selectedVideo.title}
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

const VideoCard = ({ video, onClick }) => {
  return (
    <div
      className="snap-start flex-shrink-0 w-[240px] sm:w-[270px] aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-white relative group transition-transform duration-300 hover:scale-[1.02]"
    >
      {/* Embedded YouTube Shorts Player (Muted, Background) */}
      <iframe
        src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${video.youtubeId}&controls=0`}
        title={video.title}
        className="w-full h-full object-cover rounded-2xl pointer-events-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        tabIndex={-1}
      />

      {/* Click Overlay to Open Modal */}
      <div 
        className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center group/overlay"
        onClick={onClick}
        title="Click to watch"
      >
         <div className="bg-black/40 p-3 rounded-full opacity-0 group-hover/overlay:opacity-100 transition-opacity backdrop-blur-sm">
            <Play className="w-8 h-8 text-white fill-white" />
         </div>
      </div>

      {/* Top Channel Header Pill Overlay */}
      <div className="absolute top-3 left-3 right-3 pointer-events-none z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/20">
        <img 
          src="/logo.png" 
          alt="Janki Jiyana House Logo" 
          className="w-7 h-7 rounded-xl bg-white object-contain shrink-0 shadow-sm p-0.5" 
        />
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
  );
};
