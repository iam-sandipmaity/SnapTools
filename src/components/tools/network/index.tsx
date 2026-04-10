import { lazy } from 'react';

const networkTools = {
  'url-encoder-decoder': lazy(() => import('./UrlEncoderDecoder')),
};

export default networkTools;
