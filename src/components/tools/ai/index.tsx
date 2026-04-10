import { lazy } from 'react';

const aiTools = {
    'ai-sarvam': lazy(() => import('./Sarvam')),
};

export default aiTools;
