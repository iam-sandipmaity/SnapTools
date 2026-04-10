import { lazy } from 'react';

const qrTools = {
  "qr-generator": lazy(() => import("./QRGenerator")),
  "qr-scanner": lazy(() => import("./QRScanner")),
  "barcode-generator": lazy(() => import("./BarcodeGenerator")),
};

export default qrTools;
