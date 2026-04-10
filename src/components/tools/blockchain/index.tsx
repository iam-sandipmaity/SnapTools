import { lazy } from 'react';

const blockchainTools = {
    'eth-validator': lazy(() => import('./Ethvalidation')),
};

export default blockchainTools;
