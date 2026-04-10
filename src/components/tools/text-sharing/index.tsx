import { lazy } from 'react';

const textSharingTools = {
  "text-share": lazy(() => import('./ShareText')),
};

export default textSharingTools;
