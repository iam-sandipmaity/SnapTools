export * from './ChaCha20Poly1305';
export { default } from './ChaCha20Poly1305';
import CryptoJS from 'crypto-js';

// ---------------------------------------------------------------------------
// ChaCha20-Poly1305 — RFC 8439 compliant pure-TypeScript implementation
// Verified against RFC 8439 Section 2.8.2 test vectors
// ---------------------------------------------------------------------------

// ---- ChaCha20 ---------------------------------------------------------------

function quarterRound(s: Uint32Array, a: number, b: number, c: number, d: number) {
  s[a] = (s[a] + s[b]) >>> 0; s[d] ^= s[a]; s[d] = (s[d] << 16 | s[d] >>> 16) >>> 0;
  s[c] = (s[c] + s[d]) >>> 0; s[b] ^= s[c]; s[b] = (s[b] << 12 | s[b] >>> 20) >>> 0;
  s[a] = (s[a] + s[b]) >>> 0; s[d] ^= s[a]; s[d] = (s[d] <<  8 | s[d] >>> 24) >>> 0;
  s[c] = (s[c] + s[d]) >>> 0; s[b] ^= s[c]; s[b] = (s[b] <<  7 | s[b] >>> 25) >>> 0;
}

function readKey32(b: Uint8Array): Uint32Array {
  const v = new DataView(b.buffer, b.byteOffset);
  const k = new Uint32Array(8);
  for (let i = 0; i < 8; i++) k[i] = v.getUint32(i * 4, true);
  return k;
}

function readNonce32(b: Uint8Array): [number, number, number] {
  const v = new DataView(b.buffer, b.byteOffset);
  return [v.getUint32(0, true), v.getUint32(4, true), v.getUint32(8, true)];
}

function chacha20Block(key32: Uint32Array, counter: number, nonce32: [number, number, number]): Uint8Array {
  const s = new Uint32Array(16);
  s[0] = 0x61707865; s[1] = 0x3320646e; s[2] = 0x79622d32; s[3] = 0x6b206574;
  for (let i = 0; i < 8; i++) s[4 + i] = key32[i];
  s[12] = counter >>> 0;
  s[13] = nonce32[0]; s[14] = nonce32[1]; s[15] = nonce32[2];

  const w = new Uint32Array(s);
  for (let i = 0; i < 10; i++) {
    quarterRound(w, 0, 4,  8, 12); quarterRound(w, 1, 5,  9, 13);
    quarterRound(w, 2, 6, 10, 14); quarterRound(w, 3, 7, 11, 15);
    quarterRound(w, 0, 5, 10, 15); quarterRound(w, 1, 6, 11, 12);
    quarterRound(w, 2, 7,  8, 13); quarterRound(w, 3, 4,  9, 14);
  }

  const out = new Uint8Array(64);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 16; i++) view.setUint32(i * 4, (w[i] + s[i]) >>> 0, true);
  return out;
}

function chacha20Xor(key: Uint8Array, counter: number, nonce: Uint8Array, data: Uint8Array): Uint8Array {
  const k = readKey32(key);
  const n = readNonce32(nonce);
  const out = new Uint8Array(data.length);
  for (let pos = 0, blk = 0; pos < data.length; pos += 64, blk++) {
    const ks  = chacha20Block(k, counter + blk, n);
    const len = Math.min(64, data.length - pos);
    for (let i = 0; i < len; i++) out[pos + i] = data[pos + i] ^ ks[i];
  }
  return out;
}

// ---- Poly1305 ---------------------------------------------------------------

function poly1305Mac(key: Uint8Array, msg: Uint8Array): Uint8Array {
  // Clamp r (first 16 bytes of key)
  const rBytes = new Uint8Array(key.slice(0, 16));
  rBytes[3]  &= 15; rBytes[7]  &= 15; rBytes[11] &= 15; rBytes[15] &= 15;
  rBytes[4]  &= 252; rBytes[8]  &= 252; rBytes[12] &= 252;

  let r = 0n;
  for (let i = 15; i >= 0; i--) r = (r << 8n) | BigInt(rBytes[i]);

  let s = 0n;
  for (let i = 31; i >= 16; i--) s = (s << 8n) | BigInt(key[i]);

  const P = (1n << 130n) - 5n;
  let acc = 0n;

  for (let i = 0; i < msg.length; i += 16) {
    const chunk = msg.subarray(i, Math.min(i + 16, msg.length));
    let n = 0n;
    for (let j = chunk.length - 1; j >= 0; j--) n = (n << 8n) | BigInt(chunk[j]);
    n |= 1n << BigInt(chunk.length * 8);
    acc = (acc + n) * r % P;
  }

  acc = (acc + s) & ((1n << 128n) - 1n);
  const tag = new Uint8Array(16);
  let tmp = acc;
  for (let i = 0; i < 16; i++) { tag[i] = Number(tmp & 0xffn); tmp >>= 8n; }
  return tag;
}

function poly1305KeyGen(key: Uint8Array, nonce: Uint8Array): Uint8Array {
  const block = chacha20Block(readKey32(key), 0, readNonce32(nonce));
  return block.slice(0, 32);
}

// ---- MAC data construction --------------------------------------------------

function pad16(n: number) { return (16 - (n % 16)) % 16; }

function buildMacData(aad: Uint8Array, ciphertext: Uint8Array): Uint8Array {
  const aadPad = pad16(aad.length);
  const ctPad  = pad16(ciphertext.length);
  const buf = new Uint8Array(aad.length + aadPad + ciphertext.length + ctPad + 16);
  const view = new DataView(buf.buffer);
  let off = 0;
  buf.set(aad, off); off += aad.length + aadPad;
  buf.set(ciphertext, off); off += ciphertext.length + ctPad;
  // lengths as 64-bit LE
  view.setUint32(off,     aad.length,        true); off += 4;
  view.setUint32(off,     0,                 true); off += 4;
  view.setUint32(off,     ciphertext.length, true); off += 4;
  view.setUint32(off,     0,                 true);
  return buf;
}

// ---- High-level seal / open -------------------------------------------------

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Encrypt plaintext with ChaCha20-Poly1305.
 * @param key   32-byte key
 * @param nonce 12-byte nonce (must be unique per key)
 * @param plaintext  message bytes
 * @param aad   additional authenticated data (may be empty)
 * @returns ciphertext || tag (plaintext.length + 16 bytes)
 */
export function chacha20poly1305Seal(
  key: Uint8Array, nonce: Uint8Array,
  plaintext: Uint8Array, aad: Uint8Array = new Uint8Array(0)
): Uint8Array {
  const otk        = poly1305KeyGen(key, nonce);
  const ciphertext = chacha20Xor(key, 1, nonce, plaintext);
  const tag        = poly1305Mac(otk, buildMacData(aad, ciphertext));
  const out        = new Uint8Array(ciphertext.length + 16);
  out.set(ciphertext, 0);
  out.set(tag, ciphertext.length);
  return out;
}

/**
 * Decrypt and authenticate a ChaCha20-Poly1305 sealed message.
 * @returns plaintext, or throws if authentication fails
 */
export function chacha20poly1305Open(
  key: Uint8Array, nonce: Uint8Array,
  sealed: Uint8Array, aad: Uint8Array = new Uint8Array(0)
): Uint8Array {
  if (sealed.length < 16) throw new Error('Ciphertext too short');
  const ciphertext = sealed.subarray(0, sealed.length - 16);
  const tag        = sealed.subarray(sealed.length - 16);
  const otk        = poly1305KeyGen(key, nonce);
  const expected   = poly1305Mac(otk, buildMacData(aad, ciphertext));
  if (!timingSafeEqual(tag, expected)) throw new Error('Authentication failed — wrong key or tampered data');
  return chacha20Xor(key, 1, nonce, ciphertext);
}

// ---- Key derivation from password -------------------------------------------

async function deriveKey32(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const raw = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, raw, 256);
  return new Uint8Array(bits);
}

// ---- Wire format ------------------------------------------------------------
// base64( salt[16] || nonce[12] || sealed[...] )
// where sealed = ciphertext || poly1305_tag[16]

async function encryptMsg(message: string, password: string): Promise<string> {
  const salt  = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const key   = await deriveKey32(password, salt);
  const pt    = new TextEncoder().encode(message);
  const sealed = chacha20poly1305Seal(key, nonce, pt);

  const out = new Uint8Array(16 + 12 + sealed.length);
  out.set(salt, 0); out.set(nonce, 16); out.set(sealed, 28);
  return btoa(String.fromCharCode(...out));
}

async function decryptMsg(ciphertext: string, password: string): Promise<string> {
  const buf = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  if (buf.length < 16 + 12 + 16) throw new Error('Invalid ciphertext format');
  const salt   = buf.slice(0,  16);
  const nonce  = buf.slice(16, 28);
  const sealed = buf.slice(28);
  const key    = await deriveKey32(password, salt);
  const pt     = chacha20poly1305Open(key, nonce, sealed);
  return new TextDecoder().decode(pt);
}

// ---- CryptoJS namespace attachment ------------------------------------------

(CryptoJS as any).ChaCha20Poly1305 = {
  encrypt(message: string, key: string) {
    return encryptMsg(message, key).then(encoded => ({ toString: () => encoded }));
  },
  decrypt(ciphertext: string, key: string) {
    return decryptMsg(ciphertext, key).then(plain => ({ toString: () => plain }));
  },
};

export default (CryptoJS as any).ChaCha20Poly1305;