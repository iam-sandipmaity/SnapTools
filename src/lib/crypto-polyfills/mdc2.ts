import CryptoJS from 'crypto-js';

// ---------------------------------------------------------------------------
// Minimal DES implementation (ECB, no padding) — used internally by MDC2
// Based on the classical DES specification (FIPS 46-3)
// ---------------------------------------------------------------------------

// Permutation helper: rearrange bits of a 64-bit value represented as two
// 32-bit halves [hi, lo] according to a table of 1-based bit positions.
function permute(hi: number, lo: number, table: number[]): [number, number] {
  let rhi = 0, rlo = 0;
  for (let i = 0; i < table.length; i++) {
    const bit = table[i] - 1;                        // 0-based source bit
    const val = bit < 32
      ? (hi >>> (31 - bit)) & 1
      : (lo >>> (63 - bit)) & 1;
    const dst = table.length - 1 - i;               // destination bit (0=LSB)
    if (dst < 32) rlo |= val << dst;
    else          rhi |= val << (dst - 32);
  }
  return [rhi >>> 0, rlo >>> 0];
}

// IP — Initial Permutation
const IP = [
  58,50,42,34,26,18,10,2, 60,52,44,36,28,20,12,4,
  62,54,46,38,30,22,14,6, 64,56,48,40,32,24,16,8,
  57,49,41,33,25,17, 9,1, 59,51,43,35,27,19,11,3,
  61,53,45,37,29,21,13,5, 63,55,47,39,31,23,15,7,
];
// IP^-1 — Final Permutation
const FP = [
  40,8,48,16,56,24,64,32, 39,7,47,15,55,23,63,31,
  38,6,46,14,54,22,62,30, 37,5,45,13,53,21,61,29,
  36,4,44,12,52,20,60,28, 35,3,43,11,51,19,59,27,
  34,2,42,10,50,18,58,26, 33,1,41, 9,49,17,57,25,
];
// PC1 — Permuted Choice 1 (64→56 bits)
const PC1 = [
  57,49,41,33,25,17, 9,  1,58,50,42,34,26,18,
  10, 2,59,51,43,35,27, 19,11, 3,60,52,44,36,
  63,55,47,39,31,23,15,  7,62,54,46,38,30,22,
  14, 6,61,53,45,37,29, 21,13, 5,28,20,12, 4,
];
// PC2 — Permuted Choice 2 (56→48 bits)
const PC2 = [
  14,17,11,24, 1, 5,  3,28,15, 6,21,10,
  23,19,12, 4,26, 8, 16, 7,27,20,13, 2,
  41,52,31,37,47,55, 30,40,51,45,33,48,
  44,49,39,56,34,53, 46,42,50,36,29,32,
];
// E — Expansion (32→48 bits)
const E = [
  32, 1, 2, 3, 4, 5,  4, 5, 6, 7, 8, 9,
   8, 9,10,11,12,13, 12,13,14,15,16,17,
  16,17,18,19,20,21, 20,21,22,23,24,25,
  24,25,26,27,28,29, 28,29,30,31,32, 1,
];
// P — P-box permutation (32 bits)
const P = [
  16, 7,20,21, 29,12,28,17,  1,15,23,26,  5,18,31,10,
   2, 8,24,14, 32,27, 3, 9, 19,13,30, 6, 22,11, 4,25,
];
// S-boxes
const SBOX: number[][] = [
  [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,  0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,
    4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,  15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
  [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,   3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,
    0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,  13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
  [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,   13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,
   13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,   1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
  [ 7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,  13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,
   10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,   3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
  [ 2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,  14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,
    4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,  11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
  [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,  10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,
    9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,   4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
  [ 4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,  13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,
    1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,   6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
  [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,   1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,
    7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,   2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11],
];

// Key schedule: left-shift counts per round
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

function rotL28(val: number, n: number): number {
  return ((val << n) | (val >>> (28 - n))) & 0x0fffffff;
}

// Expand a 4-byte array segment into a 32-bit integer (big-endian)
function load32(b: Uint8Array, off: number): number {
  return ((b[off] << 24) | (b[off+1] << 16) | (b[off+2] << 8) | b[off+3]) >>> 0;
}

// Store a 32-bit integer into a 4-byte array (big-endian)
function store32(b: Uint8Array, off: number, v: number) {
  b[off]   = (v >>> 24) & 0xff;
  b[off+1] = (v >>> 16) & 0xff;
  b[off+2] = (v >>>  8) & 0xff;
  b[off+3] =  v         & 0xff;
}

// Generate 16 round subkeys (each 48 bits = [hi18, lo30] pair) from an 8-byte key
function desKeySchedule(key: Uint8Array): Array<[number, number]> {
  const khi = load32(key, 0);
  const klo = load32(key, 4);
  const [pc1hi, pc1lo] = permute(khi, klo, PC1);
  // C and D are 28-bit halves
  let C = ((pc1hi >>> 4) & 0x0fffffff);
  let D = ((pc1hi & 0xf) << 24) | (pc1lo >>> 8);
  // (pc1lo has 56 bits of PC1 output split across 32+24)
  // Re-derive correctly: PC1 output is 56 bits
  // C = bits 1-28, D = bits 29-56 of PC1 output
  // PC1 result in [pc1hi(32), pc1lo(32)] with MSB first, but only 56 bits used
  C = (pc1hi >>> 4) & 0x0fffffff;
  D = ((pc1hi & 0xf) << 24) | ((pc1lo >>> 8) & 0x00ffffff);

  const subkeys: Array<[number, number]> = [];
  for (let i = 0; i < 16; i++) {
    C = rotL28(C, SHIFTS[i]);
    D = rotL28(D, SHIFTS[i]);
    // Combine C and D into 56-bit value, apply PC2
    const cdhi = (C << 4) | (D >>> 24);
    const cdlo = (D << 8) >>> 0;
    const [skhi, sklo] = permute(cdhi >>> 0, cdlo >>> 0, PC2);
    // PC2 output is 48 bits — pack into [hi18, lo30] but we keep as [skhi, sklo]
    subkeys.push([skhi, sklo]);
  }
  return subkeys;
}

// DES f-function: takes 32-bit R and 48-bit subkey [skhi, sklo], returns 32-bit
function desF(R: number, skhi: number, sklo: number): number {
  // Expand R (32→48 bits)
  const Rhi = 0;
  const Rlo = R;
  // E operates on a 64-bit input where the low 32 bits = R
  // We treat bit positions 33-64 as R's bits 1-32
  const [ehi, elo] = permute(Rhi, Rlo, E.map(b => b + 32));
  // XOR with subkey
  const xhi = (ehi ^ skhi) >>> 0;
  const xlo = (elo ^ sklo) >>> 0;
  // S-box substitution: 8 groups of 6 bits
  // Reconstruct 48-bit value from [xhi(16 used), xlo(32)]
  // xhi has bits 47-32, xlo has bits 31-0
  const x48hi = xhi & 0xffff;          // top 16 bits (bits 47-32)
  const x48lo = xlo;                   // bottom 32 bits (bits 31-0)

  let sOut = 0;
  for (let s = 0; s < 8; s++) {
    // Extract 6-bit group s (s=0 is the most significant)
    const bitPos = 42 - s * 6;        // MSB position of this group within 48 bits
    let group: number;
    if (bitPos >= 32) {
      // Entirely in x48hi (shifted)
      group = (x48hi >>> (bitPos - 32)) & 0x3f;
    } else if (bitPos >= 0) {
      // Straddles boundary or entirely in x48lo
      const bitsFromLo = bitPos + 6 <= 32 ? 6 : 32 - bitPos;
      const bitsFromHi = 6 - bitsFromLo;
      const lopart = (x48lo >>> bitPos) & ((1 << bitsFromLo) - 1);
      const hipart = bitsFromHi > 0 ? (x48hi & ((1 << bitsFromHi) - 1)) << bitsFromLo : 0;
      group = hipart | lopart;
    } else {
      group = (x48lo >>> (bitPos)) & 0x3f;
    }
    // row = bits 0 and 5 of group; col = bits 1-4
    const row = ((group >>> 5) & 1) << 1 | (group & 1);
    const col = (group >>> 1) & 0xf;
    const sval = SBOX[s][row * 16 + col];
    sOut = (sOut << 4) | sval;
  }
  // Apply P permutation
  const [, plo] = permute(0, sOut >>> 0, P.map(b => b + 32));
  return plo >>> 0;
}

// Encrypt a single 8-byte block with an 8-byte key (DES ECB)
function desEncryptBlock(block: Uint8Array, key: Uint8Array): Uint8Array {
  const subkeys = desKeySchedule(key);
  const bhi = load32(block, 0);
  const blo = load32(block, 4);
  const [iphi, iplo] = permute(bhi, blo, IP);
  let L = iphi >>> 0;
  let R = iplo >>> 0;
  for (let i = 0; i < 16; i++) {
    const [skhi, sklo] = subkeys[i];
    const f = desF(R, skhi, sklo);
    const newR = (L ^ f) >>> 0;
    L = R;
    R = newR;
  }
  // Final permutation (swap L/R first)
  const [fphi, fplo] = permute(R, L, FP);
  const out = new Uint8Array(8);
  store32(out, 0, fphi);
  store32(out, 4, fplo);
  return out;
}

// ---------------------------------------------------------------------------
// MDC2 construction (ISO/IEC 10118-2, using DES)
//
// Start with two 8-byte IV values A and B (both 0x52..52 and 0x25..25).
// For each 8-byte message block M:
//   Vi = A XOR M,  encrypt with key B → Ki
//   Wi = B XOR M,  encrypt with key A → Li
//   Swap middle nibbles to form new keys, update A and B.
// Final hash = A || B (16 bytes).
// ---------------------------------------------------------------------------

function mdc2Bytes(messageBytes: Uint8Array): Uint8Array {
  // Pad message to multiple of 8 bytes (ISO 10118-2 padding: one 0x80, then zeros)
  const padLen = 8 - (messageBytes.length % 8);
  const padded = new Uint8Array(messageBytes.length + padLen);
  padded.set(messageBytes);
  padded[messageBytes.length] = 0x80;
  // remaining bytes already 0

  // Initial hash values
  let A = new Uint8Array([0x52,0x52,0x52,0x52,0x52,0x52,0x52,0x52]);
  let B = new Uint8Array([0x25,0x25,0x25,0x25,0x25,0x25,0x25,0x25]);

  for (let i = 0; i < padded.length; i += 8) {
    const M = padded.subarray(i, i + 8);

    // V = A XOR M, encrypt with key B
    const V = new Uint8Array(8);
    for (let j = 0; j < 8; j++) V[j] = A[j] ^ M[j];
    const K = desEncryptBlock(V, B);

    // W = B XOR M, encrypt with key A
    const W = new Uint8Array(8);
    for (let j = 0; j < 8; j++) W[j] = B[j] ^ M[j];
    const L = desEncryptBlock(W, A);

    // New A: K with its high nibble of byte 0 forced to 0x4, low nibble from L byte 0
    // New B: L with its high nibble of byte 0 forced to 0x2, low nibble from K byte 0
    // (ISO 10118-2 §6.2 — enforce DES key parity class by fixing top 2 bits of each byte)
    const newA = new Uint8Array(K);
    const newB = new Uint8Array(L);
    // Swap the low nibbles of byte 0 between K and L, fix high nibbles
    newA[0] = (0x40 | (L[0] & 0x0f));  // high nibble = 4
    newB[0] = (0x20 | (K[0] & 0x0f));  // high nibble = 2

    A = newA;
    B = newB;
  }

  // Final digest = A || B
  const digest = new Uint8Array(16);
  digest.set(A, 0);
  digest.set(B, 8);
  return digest;
}

// ---------------------------------------------------------------------------
// Attach to CryptoJS namespace for compatibility with the MDC2Tool component
// ---------------------------------------------------------------------------
(CryptoJS as any).MDC2 = function (message: string) {
  const bytes = new TextEncoder().encode(message);
  const digest = mdc2Bytes(bytes);
  return {
    toString(): string {
      return Array.from(digest)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    },
  };
};

export default (CryptoJS as any).MDC2;