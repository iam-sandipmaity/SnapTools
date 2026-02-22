export * from './XChaCha20';
export { default } from './XChaCha20';
import CryptoJS from 'crypto-js';

// ---------------------------------------------------------------------------
// XChaCha20-Poly1305 — pure TypeScript, draft-irtf-cfrg-xchacha-03 compliant
//
// XChaCha20 extends ChaCha20 with a 192-bit (24-byte) nonce instead of 96-bit.
// This eliminates nonce-collision risk for randomly generated nonces, making it
// safe to generate nonces with crypto.getRandomValues() without a counter.
//
// Construction:
//   subkey = HChaCha20(key, nonce[0..15])          -- 256-bit subkey
//   keystream = ChaCha20(subkey, counter, [0,0,0,0] || nonce[16..23])
//
// HChaCha20 verified against draft-irtf-cfrg-xchacha-03 Section 2.2 vector.
// Round-trip encryption/decryption verified with random keys and nonces.
// ---------------------------------------------------------------------------

// ---- ChaCha20 primitives ---------------------------------------------------

function quarterRound(s: Uint32Array, a: number, b: number, c: number, d: number): void {
  s[a] = (s[a] + s[b]) >>> 0; s[d] ^= s[a]; s[d] = (s[d] << 16 | s[d] >>> 16) >>> 0;
  s[c] = (s[c] + s[d]) >>> 0; s[b] ^= s[c]; s[b] = (s[b] << 12 | s[b] >>> 20) >>> 0;
  s[a] = (s[a] + s[b]) >>> 0; s[d] ^= s[a]; s[d] = (s[d] <<  8 | s[d] >>> 24) >>> 0;
  s[c] = (s[c] + s[d]) >>> 0; s[b] ^= s[c]; s[b] = (s[b] <<  7 | s[b] >>> 25) >>> 0;
}

function readU32LE(b: Uint8Array, off: number): number {
  return ((b[off]) | (b[off+1] << 8) | (b[off+2] << 16) | (b[off+3] << 24)) >>> 0;
}

function writeU32LE(view: DataView, off: number, v: number): void {
  view.setUint32(off, v, true);
}

/**
 * HChaCha20: 256-bit key + 128-bit input → 256-bit subkey.
 * Same as ChaCha20 block but: no counter, input fills words 12-15,
 * and the output is words 0-3 and 12-15 WITHOUT the final state addition.
 */
function hchacha20(key: Uint8Array, nonce16: Uint8Array): Uint8Array {
  const s = new Uint32Array(16);
  s[0] = 0x61707865; s[1] = 0x3320646e; s[2] = 0x79622d32; s[3] = 0x6b206574;
  for (let i = 0; i < 8; i++) s[4 + i] = readU32LE(key, i * 4);
  for (let i = 0; i < 4; i++) s[12 + i] = readU32LE(nonce16, i * 4);

  // 20 rounds — no final addition, no counter position
  for (let i = 0; i < 10; i++) {
    quarterRound(s, 0, 4,  8, 12); quarterRound(s, 1, 5,  9, 13);
    quarterRound(s, 2, 6, 10, 14); quarterRound(s, 3, 7, 11, 15);
    quarterRound(s, 0, 5, 10, 15); quarterRound(s, 1, 6, 11, 12);
    quarterRound(s, 2, 7,  8, 13); quarterRound(s, 3, 4,  9, 14);
  }

  const out = new Uint8Array(32);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 4; i++) writeU32LE(view, i * 4,      s[i]);
  for (let i = 0; i < 4; i++) writeU32LE(view, 16 + i * 4, s[12 + i]);
  return out;
}

function chacha20Block(key: Uint8Array, counter: number, nonce12: Uint8Array): Uint8Array {
  const s = new Uint32Array(16);
  s[0] = 0x61707865; s[1] = 0x3320646e; s[2] = 0x79622d32; s[3] = 0x6b206574;
  for (let i = 0; i < 8; i++) s[4 + i] = readU32LE(key, i * 4);
  s[12] = counter >>> 0;
  for (let i = 0; i < 3; i++) s[13 + i] = readU32LE(nonce12, i * 4);

  const w = new Uint32Array(s);
  for (let i = 0; i < 10; i++) {
    quarterRound(w, 0, 4,  8, 12); quarterRound(w, 1, 5,  9, 13);
    quarterRound(w, 2, 6, 10, 14); quarterRound(w, 3, 7, 11, 15);
    quarterRound(w, 0, 5, 10, 15); quarterRound(w, 1, 6, 11, 12);
    quarterRound(w, 2, 7,  8, 13); quarterRound(w, 3, 4,  9, 14);
  }
  const out = new Uint8Array(64);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 16; i++) writeU32LE(view, i * 4, (w[i] + s[i]) >>> 0);
  return out;
}

function xchacha20Xor(key: Uint8Array, nonce24: Uint8Array, counter: number, data: Uint8Array): Uint8Array {
  // Derive subkey from key + first 16 bytes of nonce via HChaCha20
  const subkey = hchacha20(key, nonce24.subarray(0, 16));

  // Inner ChaCha20 nonce: 4 zero bytes || last 8 bytes of xchacha nonce
  const innerNonce = new Uint8Array(12);
  innerNonce.set(nonce24.subarray(16, 24), 4);

  const out = new Uint8Array(data.length);
  for (let pos = 0, blk = 0; pos < data.length; pos += 64, blk++) {
    const ks  = chacha20Block(subkey, counter + blk, innerNonce);
    const len = Math.min(64, data.length - pos);
    for (let i = 0; i < len; i++) out[pos + i] = data[pos + i] ^ ks[i];
  }
  return out;
}

// ---- Poly1305 MAC ----------------------------------------------------------

function poly1305Mac(key: Uint8Array, msg: Uint8Array): Uint8Array {
  const rBytes = new Uint8Array(key.slice(0, 16));
  // Clamp r
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

function poly1305KeyGen(key: Uint8Array, nonce24: Uint8Array): Uint8Array {
  // Generate Poly1305 one-time key using block counter=0 and the derived inner nonce
  const subkey     = hchacha20(key, nonce24.subarray(0, 16));
  const innerNonce = new Uint8Array(12);
  innerNonce.set(nonce24.subarray(16, 24), 4);
  return chacha20Block(subkey, 0, innerNonce).subarray(0, 32);
}

function pad16(n: number) { return (16 - (n % 16)) % 16; }

function buildMacData(aad: Uint8Array, ciphertext: Uint8Array): Uint8Array {
  const aadPad = pad16(aad.length);
  const ctPad  = pad16(ciphertext.length);
  const buf    = new Uint8Array(aad.length + aadPad + ciphertext.length + ctPad + 16);
  const view   = new DataView(buf.buffer);
  let off = 0;
  buf.set(aad, off);        off += aad.length + aadPad;
  buf.set(ciphertext, off); off += ciphertext.length + ctPad;
  view.setUint32(off, aad.length,        true); off += 4;
  view.setUint32(off, 0,                 true); off += 4;
  view.setUint32(off, ciphertext.length, true); off += 4;
  view.setUint32(off, 0,                 true);
  return buf;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ---- XChaCha20-Poly1305 AEAD -----------------------------------------------

export function xchacha20poly1305Seal(
  key: Uint8Array,
  nonce24: Uint8Array,
  plaintext: Uint8Array,
  aad: Uint8Array = new Uint8Array(0)
): Uint8Array {
  const otk        = poly1305KeyGen(key, nonce24);
  const ciphertext = xchacha20Xor(key, nonce24, 1, plaintext);
  const tag        = poly1305Mac(otk, buildMacData(aad, ciphertext));
  const out        = new Uint8Array(ciphertext.length + 16);
  out.set(ciphertext, 0);
  out.set(tag, ciphertext.length);
  return out;
}

export function xchacha20poly1305Open(
  key: Uint8Array,
  nonce24: Uint8Array,
  sealed: Uint8Array,
  aad: Uint8Array = new Uint8Array(0)
): Uint8Array {
  if (sealed.length < 16) throw new Error('Ciphertext too short');
  const ciphertext = sealed.subarray(0, sealed.length - 16);
  const tag        = sealed.subarray(sealed.length - 16);
  const otk        = poly1305KeyGen(key, nonce24);
  const expected   = poly1305Mac(otk, buildMacData(aad, ciphertext));
  if (!timingSafeEqual(tag, expected)) throw new Error('Authentication failed — wrong key or tampered data');
  return xchacha20Xor(key, nonce24, 1, ciphertext);
}

// ---- Key derivation & wire format ------------------------------------------

async function deriveKey32(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const raw  = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, raw, 256);
  return new Uint8Array(bits);
}

// Wire format: base64(salt[16] || nonce[24] || sealed[...])
// sealed = ciphertext || poly1305_tag[16]

async function encryptMsg(message: string, password: string): Promise<string> {
  const salt   = crypto.getRandomValues(new Uint8Array(16));
  const nonce  = crypto.getRandomValues(new Uint8Array(24)); // 192-bit nonce
  const key    = await deriveKey32(password, salt);
  const sealed = xchacha20poly1305Seal(key, nonce, new TextEncoder().encode(message));

  const out = new Uint8Array(16 + 24 + sealed.length);
  out.set(salt,   0);
  out.set(nonce, 16);
  out.set(sealed, 40);
  return btoa(String.fromCharCode(...out));
}

async function decryptMsg(ciphertext: string, password: string): Promise<string> {
  const buf = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  if (buf.length < 16 + 24 + 16) throw new Error('Invalid ciphertext format');
  const salt   = buf.slice(0,  16);
  const nonce  = buf.slice(16, 40);
  const sealed = buf.slice(40);
  const key    = await deriveKey32(password, salt);
  return new TextDecoder().decode(xchacha20poly1305Open(key, nonce, sealed));
}

// ---- CryptoJS namespace attachment -----------------------------------------

(CryptoJS as any).XChaCha20 = {
  encrypt(message: string, key: string) {
    return encryptMsg(message, key).then(encoded => ({ toString: () => encoded }));
  },
  decrypt(ciphertext: string, key: string) {
    return decryptMsg(ciphertext, key).then(plain => ({ toString: () => plain }));
  },
};

export default (CryptoJS as any).XChaCha20;