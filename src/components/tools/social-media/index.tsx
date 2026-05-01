import { lazy } from 'react';

const socialMedia = {
  "yt-thumbnail": lazy(() => import("./YoutubeThumbnailDownloader")),
  "yt-video": lazy(() => import("./YoutubeVideoDownloader")),
  "tweet-generator": lazy(() => import("./TweetGenerator")),
  "instagram-post": lazy(() => import("./InstagramPostGenerator")),
  "instagram-downloader": lazy(() => import("./instagram-downloader")),
  "yt-trending": lazy(() => import("./YoutubeTrendingVideos")),
  "yt-tags": lazy(() => import("./YoutubeTagsExtractor")),
  "yt-most-viewed": lazy(() => import("./YoutubeMostViewedVideos")),
  "youtube-stats": lazy(() => import("./YoutubeStats")),
};

export default socialMedia;
