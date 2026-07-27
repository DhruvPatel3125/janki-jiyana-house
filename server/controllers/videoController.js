import Video from '../models/Video.js';

// Helper to extract 11-character YouTube Video ID from any YouTube URL
export const extractYoutubeId = (url) => {
  if (!url) return '';
  const trimmed = url.trim();

  // Match /shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Match watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Match youtu.be/VIDEO_ID
  const beMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (beMatch && beMatch[1]) return beMatch[1];

  // Match embed/VIDEO_ID
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Fallback: If 11 chars string provided directly
  if (trimmed.length === 11) return trimmed;

  return '';
};

// @desc    Get active trending videos for homepage
// @route   GET /api/videos
// @access  Public
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch videos' });
  }
};

// @desc    Get all videos for Admin Panel
// @route   GET /api/videos/admin
// @access  Private/Admin
export const getAllVideosAdmin = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch admin videos' });
  }
};

// @desc    Add a new trending YouTube video / Short
// @route   POST /api/videos
// @access  Private/Admin
export const createVideo = async (req, res) => {
  try {
    const { title, youtubeUrl, channelName } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Video title is required' });
    }

    if (!youtubeUrl || !youtubeUrl.trim()) {
      return res.status(400).json({ message: 'YouTube URL is required' });
    }

    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({
        message: 'Invalid YouTube URL. Please provide a valid YouTube Shorts or Video link (e.g. https://youtube.com/shorts/xypZguaBxB8)',
      });
    }

    const newVideo = new Video({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      youtubeId,
      channelName: channelName ? channelName.trim() : 'Janki Jiyana House',
      isActive: true,
    });

    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create video' });
  }
};

// @desc    Update video details or status
// @route   PUT /api/videos/:id
// @access  Private/Admin
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (req.body.title) video.title = req.body.title.trim();
    if (req.body.channelName) video.channelName = req.body.channelName.trim();
    if (typeof req.body.isActive === 'boolean') video.isActive = req.body.isActive;

    if (req.body.youtubeUrl) {
      const youtubeId = extractYoutubeId(req.body.youtubeUrl);
      if (!youtubeId) {
        return res.status(400).json({ message: 'Invalid YouTube URL link' });
      }
      video.youtubeUrl = req.body.youtubeUrl.trim();
      video.youtubeId = youtubeId;
    }

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update video' });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private/Admin
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.deleteOne();
    res.json({ message: 'Video removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete video' });
  }
};
