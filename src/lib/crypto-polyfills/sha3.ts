// ---------------------------------------------------------------------------
// NIST SHA-3 (FIPS 202) — pure TypeScript implementation
// Verified against official NIST test vectors for all four output sizes.
//
// NOTE: CryptoJS.SHA3 implements Keccak-256 (padding byte 0x01), which is
// NOT the same as NIST SHA-3 (padding byte 0x06). This polyfill produces
// correct NIST SHA-3 hashes.
// ---------------------------------------------------------------------------

// Keccak-f round constants, derived from the LFSR defined in FIPS 202.
function buildRC(): bigint[] {
  let R = 1;
  const rc: bigint[] = [];
  for (let r = 0; r < 24; r++) {
    let rcval = 0n;
    for (let j = 0; j < 7; j++) {
      if (R & 1) rcval ^= 1n << BigInt((1 << j) - 1);
      R = ((R << 1) ^ ((R >> 7) * 0x71)) & 0xff;
    }
    rc.push(rcval);
  }
  return rc;
}
const RC64 = buildRC();

// Rotation offsets per lane, computed from FIPS 202 Section 3.2.2
function buildROT(): number[] {
  const rot = new Array<number>(25).fill(0);
  let x = 1, y = 0;
  for (let t = 0; t < 24; t++) {
    rot[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64;
    [x, y] = [y, (2 * x + 3 * y) % 5];
  }
  return rot;
}
const ROT = buildROT();

function rotl64(x: bigint, n: number): bigint {
  if (n === 0) return x;
  return BigInt.asUintN(64, (x << BigInt(n)) | (x >> BigInt(64 - n)));
}

function keccakF(A: bigint[]): void {
  for (let r = 0; r < 24; r++) {
    // θ (Theta)
    const C = new Array<bigint>(5);
    for (let x = 0; x < 5; x++) C[x] = A[x] ^ A[x+5] ^ A[x+10] ^ A[x+15] ^ A[x+20];
    for (let x = 0; x < 5; x++) {
      const d = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1);
      for (let y = 0; y < 5; y++) A[x + 5 * y] ^= d;
    }
    // ρ (Rho) + π (Pi)
    const B = new Array<bigint>(25).fill(0n);
    for (let x = 0; x < 5; x++)
      for (let y = 0; y < 5; y++)
        B[y + 5 * ((2 * x + 3 * y) % 5)] = rotl64(A[x + 5 * y], ROT[x + 5 * y]);
    // χ (Chi)
    for (let x = 0; x < 5; x++)
      for (let y = 0; y < 5; y++)
        A[x + 5 * y] = B[x + 5 * y] ^ (~B[(x + 1) % 5 + 5 * y] & B[(x + 2) % 5 + 5 * y]);
    // ι (Iota)
    A[0] ^= RC64[r];
  }
}

/**
 * Core Keccak sponge. delim = 0x06 for NIST SHA-3, 0x01 for Keccak.
 */
function keccak(msg: Uint8Array, rateBits: number, outBytes: number, delim: number): Uint8Array {
  const rateBytes = rateBits / 8;
  const padLen = rateBytes - (msg.length % rateBytes);
  const padded = new Uint8Array(msg.length + padLen);
  padded.set(msg);
  padded[msg.length]       = delim;
  padded[padded.length - 1] ^= 0x80;

  const A: bigint[] = new Array(25).fill(0n);

  for (let blk = 0; blk < padded.length; blk += rateBytes) {
    for (let i = 0; i < rateBytes / 8; i++) {
      let w = 0n;
      for (let j = 7; j >= 0; j--) w = (w << 8n) | BigInt(padded[blk + i * 8 + j]);
      A[i] ^= w;
    }
    keccakF(A);
  }

  const out = new Uint8Array(outBytes);
  for (let i = 0; i < outBytes; i++)
    out[i] = Number((A[Math.floor(i / 8)] >> BigInt(8 * (i % 8))) & 0xffn);
  return out;
}

// FIPS 202 rates: rate = 1600 - 2 * outputBits
export function sha3_224(msg: Uint8Array): Uint8Array { return keccak(msg, 1152, 28, 0x06); }
export function sha3_256(msg: Uint8Array): Uint8Array { return keccak(msg, 1088, 32, 0x06); }
export function sha3_384(msg: Uint8Array): Uint8Array { return keccak(msg,  832, 48, 0x06); }
export function sha3_512(msg: Uint8Array): Uint8Array { return keccak(msg,  576, 64, 0x06); }

export function sha3Hash(input: string, bits: 224 | 256 | 384 | 512): string {
  const msg = new TextEncoder().encode(input);
  const fn = { 224: sha3_224, 256: sha3_256, 384: sha3_384, 512: sha3_512 }[bits];
  return Array.from(fn(msg)).map(b => b.toString(16).padStart(2, '0')).join('');
}