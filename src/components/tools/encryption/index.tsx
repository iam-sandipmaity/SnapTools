import { lazy } from 'react';

const encryptionTools = {
  'aes': lazy(() => import('./AESTool')),
  'base64': lazy(() => import('./Base64Tool')),
  'blowfish': lazy(() => import('./BlowfishTool')),
  'cast5': lazy(() => import('./CAST5Tool')),
  'des': lazy(() => import('./DESTool')),
  '3des': lazy(() => import('./TripleDESTool')),
  'rsa': lazy(() => import('./RSATool')),
  'encoding': lazy(() => import('./EncodingTool')),
  'html': lazy(() => import('./HTMLEncodeTool')),
  'md5': lazy(() => import('./MD5Tool')),
  'md4': lazy(() => import('./MD4Tool')),
  'md2': lazy(() => import('./MD2Tool')),
  'mdc2': lazy(() => import('./MDC2Tool')),
  'ripemd160': lazy(() => import('./RIPEMD160Tool')),
  'sha': lazy(() => import('./SHATool')),
  'sha3': lazy(() => import('./SHA3Tool')),
  'url': lazy(() => import('./URLEncoderTool')),
  'bcrypt': lazy(() => import('./BCryptTool')),
  'scrypt': lazy(() => import('./SCryptTool')),
  'pbkdf2': lazy(() => import('./PBKDF2Tool')),
  'aes_gcm': lazy(() => import('./AESGCMTool')),
  'ecdh': lazy(() => import('./ECDHTool')),
  'x25519': lazy(() => import('./X25519Tool')),
  'ed25519': lazy(() => import('./Ed25519Tool')),
  'ecdsa': lazy(() => import('./ECDSATool')),
  'blake2': lazy(() => import('./Blake2Tool')),
  'blake3': lazy(() => import('./Blake3Tool')),
  'argon2': lazy(() => import('./Argon2Tool')),
};

export default encryptionTools;
