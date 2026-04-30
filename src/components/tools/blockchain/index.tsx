import { lazy } from 'react';

const blockchainTools = {
  'eth-validator': lazy(() => import('./Ethvalidation')),
  'nft-rarity': lazy(() => import('./NftRarityCalculator')),
  'wallet-generator': lazy(() => import('./CryptoWalletGenerator')),
};

export default blockchainTools;

