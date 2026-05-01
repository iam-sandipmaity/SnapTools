import { lazy } from 'react';

const unitTools = {
  "length-converter": lazy(() => import("./LengthConverter")),
  "temperature-converter": lazy(() => import("./TemperatureConverter")),
  "weight-converter": lazy(() => import("./WeightConverter")),
  "speed-converter": lazy(() => import("./SpeedConverter")),
  "area-converter": lazy(() => import("./AreaConverter")),
  "volume-converter": lazy(() => import("./VolumeConverter")),
  "pressure-converter": lazy(() => import("./PressureConverter")),
};

export default unitTools;
