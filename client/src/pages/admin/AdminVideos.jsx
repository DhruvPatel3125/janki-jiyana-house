import React, { useState, useEffect } from 'react';
import { Youtube, Plus, Trash2, ExternalLink, ShieldCheck, Video as VideoIcon, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useConfirm } from '../../context/ConfirmContext';

export const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { confirm } = useConfirm();

  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    channelName: 'Janki Jiyana House',
  });

  const fetchVideos = async () => {
    try {
      const data = await api.getAllVideosAdmin();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showErrorToast('Please enter a video title');
      return;
    }
    if (!formData.youtubeUrl.trim()) {
      showErrorToast('Please enter a YouTube video / Shorts link');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.createVideo(formData);
      showSuccessToast('Trending video added successfully! ❤️');
      setFormData({ title: '', youtubeUrl: '', channelName: 'Janki Jiyana House' });
      setIsModalOpen(false);
      fetchVideos();
    } catch (err) {
      showErrorToast(err.message || 'Failed to add video. Check YouTube link.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const isConfirmed = await confirm({
      title: 'Delete Video',
      message: `Are you sure you want to delete "${title}"?`,
      confirmText: 'Delete Video',
      isDanger: true
    });
    if (!isConfirmed) return;
    try {
      await api.deleteVideo(id);
      showSuccessToast('Video removed successfully');
      fetchVideos();
    } catch (err) {
      showErrorToast(err.message || 'Failed to delete video');
    }
  };

  const handleToggleActive = async (video) => {
    try {
      await api.updateVideo(video._id, { isActive: !video.isActive });
      showSuccessToast(`Video ${video.isActive ? 'hidden' : 'activated'} on homepage`);
      fetchVideos();
    } catch (err) {
      showErrorToast(err.message || 'Failed to update video status');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm mt-4">Loading trending videos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Youtube className="w-7 h-7 text-rose-600 fill-rose-600 shrink-0" /> Manage Trending Videos
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Add YouTube Shorts or product demo video links to feature on the Homepage "Our Trending Video" section.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Trending Video
        </button>
      </div>

      {/* Videos List Grid - Compact Admin View */}
      {videos.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
          <VideoIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Videos Added Yet</h3>
          <p className="text-slate-500 text-xs">
            Click "Add Trending Video" above to paste your YouTube Shorts link.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between p-3.5 space-y-3 hover:border-teal-200"
            >
              {/* Compact Video Preview Container (Max Height 260px) */}
              <div className="relative w-full aspect-[9/16] max-h-[260px] mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                  title={video.title}
                  className="w-full h-full object-cover rounded-xl"
                  allowFullScreen
                />
              </div>

              {/* Video Info & Controls */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block truncate">
                    {video.channelName || 'Janki Jiyana House'}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-xs line-clamp-2 mt-0.5 leading-snug">
                    {video.title}
                  </h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="truncate text-[10px]">ID: {video.youtubeId}</span>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 hover:underline shrink-0 p-0.5"
                      title="Open in YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleActive(video)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        video.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {video.isActive ? 'Active' : 'Hidden'}
                    </button>

                    <button
                      onClick={() => handleDelete(video._id, video.title)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Youtube className="w-6 h-6 fill-rose-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Add YouTube Video / Short</h2>
              <p className="text-slate-500 text-xs">
                Paste any YouTube Shorts or Video URL to feature it on the homepage carousel.
              </p>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Surat Wholesale Warehouse Product Demo"
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">YouTube URL or Shorts Link *</label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="e.g. https://youtube.com/shorts/xypZguaBxB8"
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500 bg-slate-50"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports YouTube Shorts links (shorts/ID) & standard video links.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Channel Name</label>
                <input
                  type="text"
                  value={formData.channelName}
                  onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                  placeholder="Janki Jiyana House"
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-all"
                >
                  {submitLoading ? 'Saving...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
