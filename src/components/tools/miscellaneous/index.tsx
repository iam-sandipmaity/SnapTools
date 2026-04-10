import { lazy } from 'react';

const miscellaneousTools = {
  "uuid_generator": lazy(() => import('./UuidGenerator')),
  "number-words": lazy(() => import('./NumberToWords')),
  "words-number": lazy(() => import('./WordsToNumber')),
  "file-corruptor": lazy(() => import('./FileCorruptor')),
  "random-ip-generator": lazy(() => import('./RandomIpGenerator')),
  "webcam-test": lazy(() => import('./WebcamTest')),
  "ascii-art-generator": lazy(() => import('./ASCIIArtGenerator')),
};

export default miscellaneousTools;
