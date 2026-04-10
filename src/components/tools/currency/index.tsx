import { lazy } from 'react';

const currencyTools = {
  "currency-converter": lazy(() => import("./CurrencyConverter")),
  "crypto-converter": lazy(() => import("./CryptoConverter")),
};

export default currencyTools;
