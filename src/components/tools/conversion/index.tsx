import { lazy } from 'react';

const conversionTools = {
  "binary-decimal": lazy(() => import("./BinaryConverter")),
  "binary-hex": lazy(() => import("./BinaryConverter")),
  "hex-decimal": lazy(() => import("./HexDecimalConverter")),
  "base64": lazy(() => import("./Base64Converter")),
  "text-ascii": lazy(() => import("./TextAsciiConverter")),
  "timestamp-converter": lazy(() => import("./TimestampConverter")),
  "timezone-converter": lazy(() => import("./TimeZoneConverter")),
  "morse-code-converter": lazy(() => import("./MorseCodeConverter")),
  "crypto-converter": lazy(() => import("./CryptoConverter")),
};

export default conversionTools;
