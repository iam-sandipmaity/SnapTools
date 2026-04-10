import { lazy } from 'react';

const internetTools = {
  "speed-test": lazy(() => import('./SpeedTest')),
};

export default internetTools;
