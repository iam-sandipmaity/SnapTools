import { lazy } from 'react';

// Note: text-share is now imported from text-sharing folder to avoid duplication
import { lazy as lazyTextShare } from 'react';
const ShareTextLazy = lazyTextShare(() => import("../text-sharing/ShareText"));

const fileTools = {
  "file-share": lazy(() => import("./ShareFile")),
  "text-share": ShareTextLazy,
};

export default fileTools;
