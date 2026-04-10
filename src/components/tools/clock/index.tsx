import { lazy } from 'react';

const clockTools = {
  "current-time": lazy(() => import("./CurrentTime")),
  "stopwatch": lazy(() => import("./Stopwatch")),
  "timer": lazy(() => import("./Timer")),
  "world-clock": lazy(() => import("./WorldClock")),
};

export default clockTools;
