import { lazy } from 'react';

const colorTools = {
  "color-picker": lazy(() => import("./ColorPicker")),
  "hex-rgb": lazy(() => import("./components/HexRgbConverter")),
  "gradient-generator": lazy(() => import("./GradientGenerator")),
};

export default colorTools;
