import { lazy } from 'react';

const socialMedia = {
  "yt-thumbnail": lazy(() => import("./YoutubeThumbnailDownloader")),
  "yt-video": lazy(() => import("./YoutubeVideoDownloader")),
  "tweet-generator": lazy(() => import("./TweetGenerator")),
  "instagram-post": lazy(() => import("./InstagramPostGenerator")),
  "yt-trending": lazy(() => import("./YoutubeTrendingVideos")),
  "yt-tags": lazy(() => import("./YoutubeTagsExtractor")),
};

export default socialMedia;
