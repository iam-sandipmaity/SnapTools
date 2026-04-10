import { lazy } from 'react';

const linkTools = {
    "url-shortener": lazy(() => import("./UrlShortener")),
    "link-preview": lazy(() => import("./LinkPreview")),
    "url-parser": lazy(() => import("./UrlParser")),
    "url-to-qr-code": lazy(() => import("./UrlToQrCode")),
};

export default linkTools;
