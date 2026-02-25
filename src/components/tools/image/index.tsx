import { lazy } from 'react';

type ImageToolComponentMap = {
  [key: string]: React.LazyExoticComponent<React.ComponentType<any>>;
};

// Lazy load each image tool to split into separate chunks
// Image tools use heavy libraries (browser-image-compression, pica)
const imageTools: ImageToolComponentMap = {
  "image-compressor": lazy(() => import('./ImageCompressor')),
  "image-size-increaser": lazy(() => import('./ImageSizeIncreaser')),
  "image-base64": lazy(() => import('./ImageBase64Converter')),
  "image-format-converter": lazy(() => import('./ImageFormatConverter')),
  "image-dimension-changer": lazy(() => import('./ImageDimensionChanger')),
  "image-cropper": lazy(() => import('./ImageCropper')),
  "image-color-inverter": lazy(() => import('./ImageColorInverter')),
  "image-black-and-white": lazy(() => import('./ImageBlackAndWhite')),
  "image-filter-effects": lazy(() => import('./ImageFilterEffects')),
  "image-metadata-editor": lazy(() => import('./Imagemetadataeditor')),
};

export default imageTools;
