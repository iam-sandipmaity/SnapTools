import { lazy } from 'react';

const seoandweb = {
    "meta-generator": lazy(() => import('./MetaTagGenerator').then(m => ({ default: m.MetaTagGenerator }))),
    "ogen-preview": lazy(() => import('./OpenGraphPreview').then(m => ({ default: m.OpenGraphPreview }))),
    "website-screenshot": lazy(() => import('./WebsiteScreenshotTool').then(m => ({ default: m.WebsiteScreenshotTool }))),
};
  
export default seoandweb;
