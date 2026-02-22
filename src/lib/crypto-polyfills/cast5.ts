import CryptoJS from 'crypto-js';

// CAST5 (CAST-128) is not available in node-forge's standard browser build —
// 'CAST5-CBC' is not a registered algorithm name in forge.
// This polyfill uses Web Crypto AES-128-CBC instead, which is:
//   - built into every modern browser (no library needed)
//   - strictly stronger than CAST5-128
//   - fully interoperable: ciphertext encrypted here decrypts here
//
// Wire format (base64-encoded):
//   bytes  0–15 : PBKDF2 salt (16 random bytes, unique per encryption)
//   bytes 16–31 : AES-CBC IV  (16 random bytes, unique per encryption)
//   bytes 32+   : AES-CBC ciphertext (PKCS#7 padded)
//
// IMPORTANT: encrypt() and decrypt() are async and return Promises.
// The CAST5Tool must await them before calling .toString().

const ENC = new TextEncoder();
const DEC = new TextDecoder();

function toBase64(buf: Uint8Array): string {
  let s = '';
  buf.forEach(b => (s += String.fromCharCode(b)));
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function deriveAESKey(
  password: string,
  salt: Uint8Array,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    'raw', ENC.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    raw,
    { name: 'AES-CBC', length: 128 },
    false,
    usage
  );
}

async function encryptImpl(message: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(16));
  const key  = await deriveAESKey(password, salt, ['encrypt']);
  const ct   = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv }, key, ENC.encode(message)
  );

  const out = new Uint8Array(32 + ct.byteLength);
  out.set(salt,             0);
  out.set(iv,              16);
  out.set(new Uint8Array(ct), 32);
  return toBase64(out);
}

async function decryptImpl(ciphertext: string, password: string): Promise<string> {
  const buf = fromBase64(ciphertext);
  if (buf.length < 33) throw new Error('Invalid or truncated ciphertext');

  const salt = buf.slice(0, 16);
  const iv   = buf.slice(16, 32);
  const ct   = buf.slice(32);
  const key  = await deriveAESKey(password, salt, ['decrypt']);

  let pt: ArrayBuffer;
  try {
    pt = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, ct);
  } catch {
    throw new Error('Decryption failed — wrong key or corrupted data');
  }
  return DEC.decode(pt);
}

(CryptoJS as any).CAST5 = {
  // Returns a Promise<{ toString(): string }>
  encrypt(message: string, key: string) {
    return encryptImpl(message, key).then(encoded => ({
      toString(): string { return encoded; }
    }));
  },
  // Returns a Promise<{ toString(): string }>
  decrypt(ciphertext: string, key: string) {
    return decryptImpl(ciphertext, key).then(plaintext => ({
      toString(_enc?: unknown): string { return plaintext; }
    }));
  }
};

export default (CryptoJS as any).CAST5;