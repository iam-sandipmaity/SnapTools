import { lazy } from 'react';

const VideoCompressor = lazy(() => import('./VideoCompressor'));
const AudioConverter = lazy(() => import('./AudioConverter'));
const GifMaker = lazy(() => import('./GifMaker'));
const AudioTrimmer = lazy(() => import('./AudioTrimmer'));
const VideoToAudio = lazy(() => import('./VideoToAudio'));
const AudioJoiner = lazy(() => import('./AudioJoiner'));
const VideoTrimmer = lazy(() => import('./VideoTrimmer'));

export const mediaTools = {
    "video-compressor": VideoCompressor,
    "audio-converter": AudioConverter,
    "gif-maker": GifMaker,
    "audio-trimmer": AudioTrimmer,
    "video-to-audio": VideoToAudio,
    "audio-joiner": AudioJoiner,
    "video-trimmer": VideoTrimmer,
};

export default mediaTools;
