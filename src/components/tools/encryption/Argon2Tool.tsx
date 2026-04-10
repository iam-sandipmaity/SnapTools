import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, RefreshCw, ShieldCheck, ShieldX, Eye, EyeOff, Cpu } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// BLAKE2b — minimal implementation needed for Argon2 internals
// (Argon2 uses BLAKE2b as its internal hash/PRF)
// ═══════════════════════════════════════════════════════════════════════════════

const B2_IV = [
  0x6a09e667n, 0xbb67ae85n, 0x3c6ef372n, 0xa54ff53an,
  0x510e527fn, 0x9b05688cn, 0x1f83d9abn, 0x5be0cd19n,
  0xf3bcc908n, 0x84caa73bn, 0xfe94f82bn, 0x5f1d36f1n,
  0xade682d1n, 0x2b3e6c1fn, 0xfb41bd6bn, 0x137e2179n,
];

// Full 64-bit IV pairs
const B2IV64 = [
  0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n, 0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n,
];

const B2SIGMA = [
  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  [14,10,4,8,9,15,13,6,1,12,0,2,11,7,5,3],
  [11,8,12,0,5,2,15,13,10,14,3,6,7,1,9,4],
  [7,9,3,1,13,12,11,14,2,6,5,10,4,0,15,8],
  [9,0,5,7,2,4,10,15,14,1,11,12,6,8,3,13],
  [2,12,6,10,0,11,8,3,4,13,7,5,15,14,1,9],
  [12,5,1,15,14,13,4,10,0,7,6,3,9,2,8,11],
  [13,11,7,14,12,1,3,9,5,0,15,4,8,6,2,10],
  [6,15,14,9,11,3,0,8,12,2,13,7,1,4,10,5],
  [10,2,8,4,7,6,1,5,15,11,9,14,3,12,13,0],
  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  [14,10,4,8,9,15,13,6,1,12,0,2,11,7,5,3],
];

const MASK64 = 0xffffffffffffffffn;

function b2Rotr(x: bigint, n: bigint): bigint {
  return ((x >> n) | (x << (64n - n))) & MASK64;
}

function b2G(v: bigint[], a: number, b: number, c: number, d: number, x: bigint, y: bigint) {
  v[a] = (v[a] + v[b] + x) & MASK64;
  v[d] = b2Rotr(v[d] ^ v[a], 32n);
  v[c] = (v[c] + v[d]) & MASK64;
  v[b] = b2Rotr(v[b] ^ v[c], 24n);
  v[a] = (v[a] + v[b] + y) & MASK64;
  v[d] = b2Rotr(v[d] ^ v[a], 16n);
  v[c] = (v[c] + v[d]) & MASK64;
  v[b] = b2Rotr(v[b] ^ v[c], 63n);
}

function b2Compress(h: bigint[], m: bigint[], t0: bigint, last: boolean) {
  const v: bigint[] = [
    ...h,
    B2IV64[0], B2IV64[1], B2IV64[2], B2IV64[3],
    B2IV64[4] ^ t0, B2IV64[5],
    last ? B2IV64[6] ^ MASK64 : B2IV64[6],
    B2IV64[7],
  ];
  for (let i = 0; i < 12; i++) {
    const s = B2SIGMA[i];
    b2G(v, 0,4,8,12,  m[s[0]], m[s[1]]);
    b2G(v, 1,5,9,13,  m[s[2]], m[s[3]]);
    b2G(v, 2,6,10,14, m[s[4]], m[s[5]]);
    b2G(v, 3,7,11,15, m[s[6]], m[s[7]]);
    b2G(v, 0,5,10,15, m[s[8]], m[s[9]]);
    b2G(v, 1,6,11,12, m[s[10]],m[s[11]]);
    b2G(v, 2,7,8,13,  m[s[12]],m[s[13]]);
    b2G(v, 3,4,9,14,  m[s[14]],m[s[15]]);
  }
  for (let i = 0; i < 8; i++) h[i] ^= v[i] ^ v[i + 8];
}

function blake2b(msg: Uint8Array, outLen: number, key: Uint8Array = new Uint8Array(0)): Uint8Array {
  const kk = key.length;
  const h = [...B2IV64];
  h[0] ^= 0x01010000n ^ (BigInt(kk) << 8n) ^ BigInt(outLen);

  let data = msg;
  if (kk > 0) {
    const kb = new Uint8Array(128); kb.set(key);
    const tmp = new Uint8Array(128 + msg.length);
    tmp.set(kb); tmp.set(msg, 128);
    data = tmp;
  }

  const dataLen = data.length;
  const nBlocks = Math.max(1, Math.ceil(dataLen / 128));

  for (let b = 0; b < nBlocks; b++) {
    const isLast = b === nBlocks - 1;
    const block = new Uint8Array(128);
    block.set(data.slice(b * 128, b * 128 + 128));
    const consumed = BigInt(Math.min((b + 1) * 128, dataLen));
    const m: bigint[] = [];
    for (let i = 0; i < 16; i++) {
      let w = 0n;
      for (let j = 7; j >= 0; j--) w = (w << 8n) | BigInt(block[i * 8 + j]);
      m.push(w);
    }
    b2Compress(h, m, consumed, isLast);
  }

  const out = new Uint8Array(outLen);
  for (let i = 0; i < outLen; i++) {
    out[i] = Number((h[Math.floor(i / 8)] >> BigInt((i % 8) * 8)) & 0xffn);
  }
  return out;
}

// Argon2 uses a special variable-length hash H' built on top of BLAKE2b
function hPrime(input: Uint8Array, outLen: number): Uint8Array {
  const lenBytes = new Uint8Array(4);
  new DataView(lenBytes.buffer).setUint32(0, outLen, true);
  const msg = new Uint8Array(4 + input.length);
  msg.set(lenBytes); msg.set(input, 4);

  if (outLen <= 64) {
    return blake2b(msg, outLen);
  }

  // For outLen > 64: produce 64-byte blocks, output first 32 bytes of each
  const out = new Uint8Array(outLen);
  let pos = 0;
  let a = blake2b(msg, 64);
  out.set(a.subarray(0, 32)); pos += 32;

  while (pos + 64 <= outLen) {
    a = blake2b(a, 64);
    out.set(a.subarray(0, 32), pos); pos += 32;
  }
  if (pos < outLen) {
    const remaining = outLen - pos;
    const last = blake2b(a, remaining);
    out.set(last, pos);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Argon2 Core
// RFC 9106 — Argon2 Memory-Hard Function for Password Hashing and KDF
// ═══════════════════════════════════════════════════════════════════════════════

type Argon2Type = 0 | 1 | 2; // 0=d, 1=i, 2=id
const ARGON2_D  = 0;
const ARGON2_I  = 1;
const ARGON2_ID = 2;

const BLOCK_SIZE = 1024;           // bytes per block
const QWORDS_IN_BLOCK = 128;       // 128 × uint64 per block

// GB mixing function — Argon2's modified BLAKE2b G
function gbMix(
  v: bigint[], a: number, b: number, c: number, d: number,
  x: bigint, y: bigint
) {
  v[a] = (v[a] + v[b] + 2n * (v[a] & 0xffffffffn) * (v[b] & 0xffffffffn)) & MASK64;
  v[d] = b2Rotr(v[d] ^ v[a], 32n);
  v[c] = (v[c] + v[d] + 2n * (v[c] & 0xffffffffn) * (v[d] & 0xffffffffn)) & MASK64;
  v[b] = b2Rotr(v[b] ^ v[c], 24n);
  v[a] = (v[a] + v[b] + 2n * (v[a] & 0xffffffffn) * (v[b] & 0xffffffffn)) & MASK64;
  v[d] = b2Rotr(v[d] ^ v[a], 16n);
  v[c] = (v[c] + v[d] + 2n * (v[c] & 0xffffffffn) * (v[d] & 0xffffffffn)) & MASK64;
  v[b] = b2Rotr(v[b] ^ v[c], 63n);
}

// Apply the 16-word permutation P to a 128-word block
// The block is treated as an 8×16 matrix (8 rows, 16 words each)
function applyP(v: bigint[], base: number) {
  gbMix(v, base+0,  base+4,  base+8,  base+12, 0n, 0n);
  gbMix(v, base+1,  base+5,  base+9,  base+13, 0n, 0n);
  gbMix(v, base+2,  base+6,  base+10, base+14, 0n, 0n);
  gbMix(v, base+3,  base+7,  base+11, base+15, 0n, 0n);
  gbMix(v, base+0,  base+5,  base+10, base+15, 0n, 0n);
  gbMix(v, base+1,  base+6,  base+11, base+12, 0n, 0n);
  gbMix(v, base+2,  base+7,  base+8,  base+13, 0n, 0n);
  gbMix(v, base+3,  base+4,  base+9,  base+14, 0n, 0n);
}

// G: compress two 1024-byte blocks into one
function argon2G(X: bigint[], Y: bigint[]): bigint[] {
  // R = X XOR Y
  const R: bigint[] = new Array(QWORDS_IN_BLOCK);
  for (let i = 0; i < QWORDS_IN_BLOCK; i++) R[i] = X[i] ^ Y[i];

  const Z = R.slice();

  // 8 row passes (rows of 16 words each)
  for (let row = 0; row < 8; row++) applyP(Z, row * 16);

  // 8 column passes (columns of 16 words, stride 8)
  // Column i: indices i, i+16, i+32, i+48, i+64, i+80, i+96, i+112 — pick 16 of these
  // RFC 9106: treat the block as 8×16 matrix, then apply P to each column
  for (let col = 0; col < 8; col++) {
    // Build a 16-element view into the column
    const ci = [
      col*2,    col*2+1,
      col*2+16, col*2+17,
      col*2+32, col*2+33,
      col*2+48, col*2+49,
      col*2+64, col*2+65,
      col*2+80, col*2+81,
      col*2+96, col*2+97,
      col*2+112,col*2+113,
    ];
    // Inline G on these 16 positions
    const t = ci.map(i => Z[i]);
    gbMix(t, 0,  4,  8,  12, 0n, 0n);
    gbMix(t, 1,  5,  9,  13, 0n, 0n);
    gbMix(t, 2,  6,  10, 14, 0n, 0n);
    gbMix(t, 3,  7,  11, 15, 0n, 0n);
    gbMix(t, 0,  5,  10, 15, 0n, 0n);
    gbMix(t, 1,  6,  11, 12, 0n, 0n);
    gbMix(t, 2,  7,  8,  13, 0n, 0n);
    gbMix(t, 3,  4,  9,  14, 0n, 0n);
    ci.forEach((idx, k) => { Z[idx] = t[k]; });
  }

  // Output = Z XOR R
  return Z.map((z, i) => (z ^ R[i]) & MASK64);
}

function blockToU64(block: Uint8Array): bigint[] {
  const words: bigint[] = new Array(QWORDS_IN_BLOCK);
  const buf = block.buffer;
  const off = block.byteOffset;
  const dv = new DataView(buf, off, BLOCK_SIZE);
  for (let i = 0; i < QWORDS_IN_BLOCK; i++) {
    words[i] = dv.getBigUint64(i * 8, true);
  }
  return words;
}

function u64ToBlock(words: bigint[]): Uint8Array {
  const block = new Uint8Array(BLOCK_SIZE);
  const dv = new DataView(block.buffer);
  for (let i = 0; i < QWORDS_IN_BLOCK; i++) {
    dv.setBigUint64(i * 8, words[i] & MASK64, true);
  }
  return block;
}

function xorIntoBlock(dst: Uint8Array, src: Uint8Array) {
  for (let i = 0; i < BLOCK_SIZE; i++) dst[i] ^= src[i];
}

interface Argon2Params {
  type: Argon2Type;
  password: Uint8Array;
  salt: Uint8Array;
  secret?: Uint8Array;
  data?: Uint8Array;
  timeCost: number;    // t: iterations
  memoryCost: number;  // m: kilobytes
  parallelism: number; // p: lanes
  outLen: number;      // tag length in bytes
}

function argon2(params: Argon2Params): Uint8Array {
  const { type, password, salt, timeCost, memoryCost, parallelism, outLen } = params;
  const secret = params.secret ?? new Uint8Array(0);
  const data   = params.data   ?? new Uint8Array(0);

  // ── Step 1: Build H0 (64-byte seed) ────────────────────────────────────────
  const h0Len = 10 * 4 + password.length + salt.length + secret.length + data.length;
  const h0Buf = new Uint8Array(h0Len);
  const h0dv  = new DataView(h0Buf.buffer);
  let off = 0;
  const w32 = (v: number) => { h0dv.setUint32(off, v, true); off += 4; };
  w32(parallelism); w32(outLen); w32(memoryCost); w32(timeCost);
  w32(0x13); w32(type);                         // version=19, type
  w32(password.length); h0Buf.set(password, off); off += password.length;
  w32(salt.length);     h0Buf.set(salt, off);     off += salt.length;
  w32(secret.length);   h0Buf.set(secret, off);   off += secret.length;
  w32(data.length);     h0Buf.set(data, off);

  const H0 = blake2b(h0Buf, 64);

  // ── Step 2: Memory layout ───────────────────────────────────────────────────
  // m' = floor(m / (4p)) * 4p, minimum 4p
  const mPrime    = Math.max(Math.floor(memoryCost / (4 * parallelism)) * (4 * parallelism), 4 * parallelism);
  const segLen    = Math.floor(mPrime / (parallelism * 4)); // blocks per segment
  const laneLen   = segLen * 4;                             // blocks per lane
  const totalBlks = parallelism * laneLen;

  // Allocate flat memory: totalBlks × 1024 bytes
  const mem: Uint8Array[] = Array.from({ length: totalBlks }, () => new Uint8Array(BLOCK_SIZE));

  // ── Step 3: Initialise first two columns ───────────────────────────────────
  for (let l = 0; l < parallelism; l++) {
    const seed = new Uint8Array(72);
    seed.set(H0);
    const sdv = new DataView(seed.buffer);
    // Block 0
    sdv.setUint32(64, 0, true); sdv.setUint32(68, l, true);
    mem[l * laneLen + 0] = hPrime(seed, BLOCK_SIZE);
    // Block 1
    sdv.setUint32(64, 1, true);
    mem[l * laneLen + 1] = hPrime(seed, BLOCK_SIZE);
  }

  // ── Step 4: Fill memory pass by pass ───────────────────────────────────────
  // For Argon2i/id: pre-generate pseudo-random values per segment using G(zeros, input)
  function pseudoRandForSegment(pass: number, lane: number, slice: number, count: number): bigint[] {
    // RFC 9106 §3.4 — generate address blocks
    const out: bigint[] = [];
    let ctr = 0;
    while (out.length < count) {
      ctr++;
      const inp = new Uint8Array(BLOCK_SIZE); // zeros
      const dv2 = new DataView(inp.buffer);
      dv2.setBigUint64(0,  BigInt(pass),       true);
      dv2.setBigUint64(8,  BigInt(lane),       true);
      dv2.setBigUint64(16, BigInt(slice),      true);
      dv2.setBigUint64(24, BigInt(totalBlks),  true);
      dv2.setBigUint64(32, BigInt(timeCost),   true);
      dv2.setBigUint64(40, BigInt(type),       true);
      dv2.setBigUint64(48, BigInt(ctr),        true);
      const zeros = new Uint8Array(BLOCK_SIZE);
      // Two rounds of G
      const tmp1 = u64ToBlock(argon2G(blockToU64(zeros), blockToU64(inp)));
      const addr = u64ToBlock(argon2G(blockToU64(zeros), blockToU64(tmp1)));
      const adv  = new DataView(addr.buffer);
      for (let j = 0; j < QWORDS_IN_BLOCK && out.length < count; j++) {
        out.push(adv.getBigUint64(j * 8, true));
      }
    }
    return out;
  }

  for (let pass = 0; pass < timeCost; pass++) {
    for (let slice = 0; slice < 4; slice++) {
      for (let lane = 0; lane < parallelism; lane++) {

        // Pre-compute pseudo-random J1 values for data-independent modes
        const useAddressBlocks =
          type === ARGON2_I ||
          (type === ARGON2_ID && pass === 0 && slice < 2);
        const pseudoRands = useAddressBlocks
          ? pseudoRandForSegment(pass, lane, slice, segLen)
          : null;

        for (let s = 0; s < segLen; s++) {
          const index = slice * segLen + s;

          // Skip the first two blocks of lane 0 on pass 0 (already filled)
          if (pass === 0 && index < 2) continue;

          const curr = lane * laneLen + index;
          const prevIdx = index === 0 ? laneLen - 1 : index - 1;
          const prev = lane * laneLen + prevIdx;

          // Ensure prev block is initialised
          if (!mem[prev] || mem[prev].byteLength === 0) continue;

          // Get J1 (lower 32 bits used for mapping)
          let J1: bigint;
          if (pseudoRands) {
            J1 = pseudoRands[s] & 0xffffffffn;
          } else {
            J1 = new DataView(mem[prev].buffer, mem[prev].byteOffset, 8).getBigUint64(0, true) & 0xffffffffn;
          }

          // ── Reference set size (RFC 9106 §3.3) ─────────────────────────
          // The reference set consists of all blocks already computed in the
          // current or previous passes, minus the current block.
          let refAreaSize: number;
          if (pass === 0) {
            if (slice === 0) {
              // Only blocks 0..index-1 in this lane (at minimum 1)
              refAreaSize = Math.max(index - 1, 1);
            } else {
              // All filled blocks so far: slice*segLen + s - 1
              refAreaSize = slice * segLen + s - 1;
              if (refAreaSize < 1) refAreaSize = 1;
            }
          } else {
            // All blocks except the current segment minus 1
            refAreaSize = totalBlks - segLen + s - 1;
            if (refAreaSize < 1) refAreaSize = 1;
          }

          // ── Map J1 → position in reference set (RFC 9106 §3.3 eq.) ────
          // z = floor(refAreaSize * (J1² / 2³²) / 2³²)
          const x = (J1 * J1) >> 32n;
          const y = (BigInt(refAreaSize) * x) >> 32n;
          const z = BigInt(refAreaSize) - 1n - y;
          // z is now the index within the reference set [0, refAreaSize-1]

          // ── Map z → absolute block index (within this lane on pass 0) ──
          // On pass 0: the reference set is blocks 0..refAreaSize-1 of this lane
          // On later passes: it wraps around the whole memory
          let refAbsolute: number;
          if (pass === 0) {
            // Reference set starts at block 0 of this lane
            refAbsolute = Number(z) % Math.max(refAreaSize, 1);
          } else {
            // Reference set: from (segStart + segLen) mod laneLen, wrapping
            const start = ((slice + 1) * segLen) % laneLen;
            refAbsolute = (start + Number(z)) % laneLen;
          }

          // Clamp to valid range and compute final block address
          const refBlock = lane * laneLen + (refAbsolute % laneLen);

          // Guard: ensure the reference block is valid
          const safeRef = Math.min(Math.max(refBlock, 0), totalBlks - 1);

          // Compress
          const newWords = argon2G(blockToU64(mem[prev]), blockToU64(mem[safeRef]));
          const newBlock = u64ToBlock(newWords);

          if (pass === 0) {
            mem[curr] = newBlock;
          } else {
            xorIntoBlock(mem[curr], newBlock);
          }
        }
      }
    }
  }

  // ── Step 5: Finalise — XOR last block of every lane ────────────────────────
  const finalBlock = new Uint8Array(BLOCK_SIZE);
  for (let l = 0; l < parallelism; l++) {
    xorIntoBlock(finalBlock, mem[l * laneLen + laneLen - 1]);
  }

  // ── Step 6: Output via H' ───────────────────────────────────────────────────
  return hPrime(finalBlock, outLen);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Argon2 PHC string format encoder/decoder
// $argon2id$v=19$m=65536,t=2,p=1$<salt-b64>$<hash-b64>
// ═══════════════════════════════════════════════════════════════════════════════

const TYPE_NAMES: Record<Argon2Type, string> = { 0: 'argon2d', 1: 'argon2i', 2: 'argon2id' };

function b64Encode(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b)).replace(/=/g, '');
}

function b64Decode(s: string): Uint8Array {
  while (s.length % 4) s += '=';
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

function phcEncode(type: Argon2Type, m: number, t: number, p: number, salt: Uint8Array, hash: Uint8Array): string {
  return `$${TYPE_NAMES[type]}$v=19$m=${m},t=${t},p=${p}$${b64Encode(salt)}$${b64Encode(hash)}`;
}

function phcDecode(str: string): { type: Argon2Type; m: number; t: number; p: number; saltB64: string; hashB64: string } {
  const parts = str.split('$').filter(Boolean);
  if (parts.length < 5) throw new Error('Invalid PHC string');
  const typeStr = parts[0];
  const type: Argon2Type = typeStr === 'argon2d' ? 0 : typeStr === 'argon2i' ? 1 : 2;
  const params = Object.fromEntries(parts[2].split(',').map(kv => kv.split('=')));
  return { type, m: Number(params.m), t: Number(params.t), p: Number(params.p), saltB64: parts[3], hashB64: parts[4] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Encoding helpers
// ═══════════════════════════════════════════════════════════════════════════════
type Fmt = 'hex' | 'base64';

function toHex(b: Uint8Array): string {
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}
function encFmt(b: Uint8Array, fmt: Fmt): string {
  return fmt === 'hex' ? toHex(b) : b64Encode(b);
}
function fromHex(h: string): Uint8Array {
  const c = h.replace(/\s/g, '');
  if (c.length % 2 !== 0) throw new Error('Invalid hex');
  const o = new Uint8Array(c.length / 2);
  for (let i = 0; i < o.length; i++) o[i] = parseInt(c.slice(i * 2, i * 2 + 2), 16);
  return o;
}
function decFmt(s: string, fmt: Fmt): Uint8Array {
  return fmt === 'hex' ? fromHex(s) : b64Decode(s);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600); }}
      className="p-1.5 rounded hover:bg-white/5 text-[#608070] transition-colors" title="Copy">
      {ok ? <Check size={13} className="text-[#40e0a0]" /> : <Copy size={13} />}
    </button>
  );
}

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a7060]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <div className={`text-xs bg-[#020e0a] border border-[#0d2a1e] rounded px-3 py-2 break-all select-all text-[#50e0a0] ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function Toggle<T extends string>({ options, value, onChange, labels }: { options: T[]; value: T; onChange: (v: T) => void; labels?: Record<string, string> }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${value === o ? 'bg-[#061e14] border-[#1a7050] text-[#40e0a0]' : 'bg-transparent border-[#0d2a1e] text-[#2a5a46] hover:border-[#1a4036]'}`}>
          {labels?.[o] ?? o}
        </button>
      ))}
    </div>
  );
}

function ParamSlider({ label, value, min, max, step = 1, onChange, display }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-mono uppercase tracking-widest text-[#3a7060]">{label}</Label>
        <span className="text-[10px] font-mono text-[#40c090]">{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#1a8060]" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
type A2Type = 'argon2d' | 'argon2i' | 'argon2id';
const TYPE_MAP: Record<A2Type, Argon2Type> = { argon2d: 0, argon2i: 1, argon2id: 2 };

const Argon2Tool: React.FC = () => {
  const inputCls = 'bg-[#020e0a] border-[#0d2a1e] text-[#50e0a0] placeholder-[#1a3a2a] font-mono text-xs focus:ring-1 focus:ring-[#1a7050] focus:border-[#1a7050]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#3a7060]';

  // ── Hash tab
  const [a2type, setA2type]     = useState<A2Type>('argon2id');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saltMode, setSaltMode] = useState<'random' | 'custom'>('random');
  const [customSalt, setCustomSalt] = useState('');
  const [saltFmt, setSaltFmt]   = useState<Fmt>('hex');
  const [timeCost, setTimeCost] = useState(2);
  const [memCost, setMemCost]   = useState(65536);
  const [parallel, setParallel] = useState(1);
  const [outLen, setOutLen]     = useState(32);
  const [outFmt, setOutFmt]     = useState<Fmt>('hex');
  const [hashResult, setHashResult] = useState('');
  const [phcString, setPhcString]   = useState('');
  const [usedSalt, setUsedSalt]     = useState('');
  const [hashError, setHashError]   = useState('');
  const [hashLoading, setHashLoading] = useState(false);

  // ── Verify tab
  const [verPassword, setVerPassword] = useState('');
  const [verShowPass, setVerShowPass] = useState(false);
  const [verPhc, setVerPhc]           = useState('');
  const [verStatus, setVerStatus]     = useState<'idle' | 'match' | 'mismatch'>('idle');
  const [verError, setVerError]       = useState('');
  const [verLoading, setVerLoading]   = useState(false);

  // ── Benchmark tab
  const [benchLoading, setBenchLoading] = useState(false);
  const [benchResults, setBenchResults] = useState<{ label: string; ms: number }[]>([]);

  const memDisplay = memCost >= 1024 ? `${memCost / 1024} MiB` : `${memCost} KiB`;

  // Clamp memory to a safe range for browser JS (max 256 MiB)
  const safeMemCost = Math.min(memCost, 65536);

  function runArgon2(pw: Uint8Array, salt: Uint8Array, t: number, m: number, p: number, ol: number, type: Argon2Type): Uint8Array {
    return argon2({ type, password: pw, salt, timeCost: t, memoryCost: m, parallelism: p, outLen: ol });
  }

  // ── Hash ─────────────────────────────────────────────────────────────────────
  const handleHash = useCallback(async () => {
    setHashError(''); setHashResult(''); setPhcString(''); setUsedSalt('');
    if (!password) return setHashError('Password is required.');
    setHashLoading(true);
    try {
      await new Promise(r => setTimeout(r, 10)); // yield to render
      const pwBytes = new TextEncoder().encode(password);
      let saltBytes: Uint8Array;
      if (saltMode === 'random') {
        saltBytes = crypto.getRandomValues(new Uint8Array(16));
      } else {
        if (!customSalt.trim()) throw new Error('Custom salt is required.');
        saltBytes = decFmt(customSalt.trim(), saltFmt);
        if (saltBytes.length < 8) throw new Error('Salt must be at least 8 bytes.');
      }
      const type = TYPE_MAP[a2type];
      const digest = runArgon2(pwBytes, saltBytes, timeCost, safeMemCost, parallel, outLen, type);
      setHashResult(encFmt(digest, outFmt));
      setUsedSalt(encFmt(saltBytes, outFmt));
      setPhcString(phcEncode(type, safeMemCost, timeCost, parallel, saltBytes, digest));
    } catch (e: any) {
      setHashError(e.message || 'Hashing failed.');
    } finally {
      setHashLoading(false);
    }
  }, [password, saltMode, customSalt, saltFmt, a2type, timeCost, safeMemCost, parallel, outLen, outFmt]);

  // ── Verify ───────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    setVerError(''); setVerStatus('idle');
    if (!verPassword || !verPhc.trim()) return setVerError('Password and PHC string are required.');
    setVerLoading(true);
    try {
      await new Promise(r => setTimeout(r, 10));
      const { type, m, t, p, saltB64, hashB64 } = phcDecode(verPhc.trim());
      const saltBytes = b64Decode(saltB64);
      const expectedBytes = b64Decode(hashB64);
      const pwBytes = new TextEncoder().encode(verPassword);
      const computed = runArgon2(pwBytes, saltBytes, t, m, p, expectedBytes.length, type);
      // Constant-time comparison
      let diff = 0;
      for (let i = 0; i < computed.length; i++) diff |= computed[i] ^ (expectedBytes[i] ?? 0);
      setVerStatus(diff === 0 ? 'match' : 'mismatch');
    } catch (e: any) {
      setVerError(e.message || 'Verification failed. Check PHC string format.');
    } finally {
      setVerLoading(false);
    }
  }, [verPassword, verPhc]);

  // ── Benchmark ────────────────────────────────────────────────────────────────
  const handleBenchmark = useCallback(async () => {
    setBenchLoading(true); setBenchResults([]);
    const pw = new TextEncoder().encode('benchmark');
    const salt = new Uint8Array(16).fill(1);
    const configs = [
      { label: 'Argon2id m=1024,  t=1, p=1',  m: 1024,  t: 1, p: 1, type: ARGON2_ID as Argon2Type },
      { label: 'Argon2id m=4096,  t=1, p=1',  m: 4096,  t: 1, p: 1, type: ARGON2_ID as Argon2Type },
      { label: 'Argon2id m=16384, t=1, p=1',  m: 16384, t: 1, p: 1, type: ARGON2_ID as Argon2Type },
      { label: 'Argon2id m=16384, t=2, p=1',  m: 16384, t: 2, p: 1, type: ARGON2_ID as Argon2Type },
      { label: 'Argon2i  m=4096,  t=3, p=1',  m: 4096,  t: 3, p: 1, type: ARGON2_I as Argon2Type },
      { label: 'Argon2d  m=4096,  t=2, p=1',  m: 4096,  t: 2, p: 1, type: ARGON2_D as Argon2Type },
    ];
    const results: { label: string; ms: number }[] = [];
    for (const cfg of configs) {
      await new Promise(r => setTimeout(r, 5));
      const t0 = performance.now();
      runArgon2(pw, salt, cfg.t, cfg.m, cfg.p, 32, cfg.type);
      const ms = performance.now() - t0;
      results.push({ label: cfg.label, ms });
      setBenchResults([...results]);
    }
    setBenchLoading(false);
  }, []);

  // Auto-fill verify from hash result
  const autoFillVerify = useCallback(() => {
    if (!phcString) return;
    setVerPhc(phcString);
  }, [phcString]);

  return (
    <div className="min-h-screen w-full p-4 md:p-8"
      style={{ background: 'radial-gradient(ellipse at 20% 20%, #010e08 0%, #020e08 50%, #010a06 100%)', fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 60deg, #031a0c, #0a7040, #031a0c)' }}>
            <Cpu size={14} className="text-[#40e098]" />
          </div>
          <h1 className="text-2xl font-bold text-[#36d988]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            Argon2
          </h1>
          <Badge className="bg-[#021408] text-[#20a860] border border-[#0a3820] text-[10px] font-mono">RFC 9106</Badge>
          <Badge className="bg-[#021408] text-[#20a860] border border-[#0a3820] text-[10px] font-mono">Memory-Hard</Badge>
          <Badge className="bg-[#021408] text-[#20a860] border border-[#0a3820] text-[10px] font-mono">PHC Winner</Badge>
        </div>
        <p className="text-[#1a4a30] text-[11px] font-mono ml-11">
          Argon2d · Argon2i · Argon2id — tunable memory, time, parallelism · PHC string output
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="hash">
          <TabsList className="bg-[#020e08] border border-[#0a2a18] mb-6 w-full grid grid-cols-3">
            {['hash', 'verify', 'benchmark'].map((t) => (
              <TabsTrigger key={t} value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#1a4a30] data-[state=active]:bg-[#061e10] data-[state=active]:text-[#36d988]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── HASH ──────────────────────────────────────────────────────── */}
          <TabsContent value="hash">
            <Card className="bg-[#020e08] border-[#0a2a18] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a30] font-mono">
                  Argon2 is the Password Hashing Competition winner. Argon2id (recommended) is
                  resistant to both GPU and side-channel attacks by combining Argon2i and Argon2d.
                </p>

                {/* Variant */}
                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Variant</Label>
                  <Toggle options={['argon2d', 'argon2i', 'argon2id'] as A2Type[]} value={a2type} onChange={(v) => setA2type(v)}
                    labels={{ argon2d: 'Argon2d', argon2i: 'Argon2i', argon2id: 'Argon2id ✦' }} />
                </div>

                {/* Variant info */}
                <div className="bg-[#010a06] border border-[#0a1e10] rounded px-3 py-2 text-[10px] font-mono text-[#2a5a3a] space-y-0.5">
                  {a2type === 'argon2id' && <p><span className="text-[#40c080]">Argon2id</span> — recommended default. Uses data-independent indexing (first pass) then data-dependent. Resistant to GPU attacks and timing side-channels.</p>}
                  {a2type === 'argon2i'  && <p><span className="text-[#40c080]">Argon2i</span> — data-independent memory access. Use when side-channel resistance is critical (e.g. key derivation on shared hardware). Slightly weaker vs GPUs.</p>}
                  {a2type === 'argon2d'  && <p><span className="text-[#40c080]">Argon2d</span> — data-dependent memory access. Maximum GPU resistance but vulnerable to timing side-channels. Use for offline KDF only.</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className={labelCls}>Password</Label>
                  <div className="relative">
                    <Input type={showPass ? 'text' : 'password'} placeholder="Enter password to hash…"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className={inputCls + ' pr-10'} />
                    <button onClick={() => setShowPass(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2a5a40] hover:text-[#40c080]">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Salt */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label className={labelCls}>Salt</Label>
                    <Toggle options={['random', 'custom'] as ('random' | 'custom')[]} value={saltMode} onChange={(v) => setSaltMode(v)} />
                    {saltMode === 'custom' && (
                      <div className="flex items-center gap-2 ml-2">
                        <Label className={labelCls}>fmt</Label>
                        <Toggle options={['hex', 'base64'] as Fmt[]} value={saltFmt} onChange={(v) => setSaltFmt(v)} />
                      </div>
                    )}
                  </div>
                  {saltMode === 'custom' && (
                    <Input placeholder={`≥8 byte salt as ${saltFmt}…`} value={customSalt}
                      onChange={e => setCustomSalt(e.target.value)} className={inputCls} />
                  )}
                </div>

                {/* Cost parameters */}
                <div className="bg-[#010a06] border border-[#0a1e10] rounded p-4 space-y-4">
                  <div className="text-[10px] font-mono text-[#1a4a30] uppercase tracking-widest mb-1">Cost Parameters</div>
                  <ParamSlider label="Memory (m)" value={memCost} min={1024} max={262144} step={1024}
                    onChange={setMemCost} display={memDisplay} />
                  <ParamSlider label="Iterations (t)" value={timeCost} min={1} max={10}
                    onChange={setTimeCost} />
                  <ParamSlider label="Parallelism (p)" value={parallel} min={1} max={4}
                    onChange={setParallel} />
                  <ParamSlider label="Output length" value={outLen} min={16} max={64}
                    onChange={setOutLen} display={`${outLen} bytes (${outLen * 8} bits)`} />
                  {memCost > 65536 && (
                    <div className="text-[10px] font-mono text-amber-500/80 bg-amber-950/20 border border-amber-900/30 rounded px-2 py-1.5">
                      ⚠ Memory capped at 64 MiB in-browser. Computation will use {safeMemCost / 1024} MiB.
                    </div>
                  )}
                </div>

                {/* Output format */}
                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Output format</Label>
                  <Toggle options={['hex', 'base64'] as Fmt[]} value={outFmt} onChange={(v) => setOutFmt(v)} />
                </div>

                {hashError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {hashError}
                  </div>
                )}

                <Button onClick={handleHash} disabled={hashLoading}
                  className="w-full bg-[#061e10] hover:bg-[#0a2818] border border-[#1a6040] text-[#36d988] font-mono text-[10px] uppercase tracking-widest">
                  <RefreshCw size={13} className={`mr-2 ${hashLoading ? 'animate-spin' : ''}`} />
                  {hashLoading ? 'Hashing… (may take a moment)' : 'Hash Password'}
                </Button>

                {hashResult && (
                  <div className="space-y-3 pt-2 border-t border-[#0a1e10]">
                    <Field label={`Raw hash — ${outLen * 8}-bit (${outFmt})`} value={hashResult} />
                    <Field label={`Salt used (${outFmt})`} value={usedSalt} />
                    <Field label="PHC string (store this)" value={phcString} />
                    <div className="bg-[#010a06] border border-[#0a1e10] rounded px-3 py-2 text-[10px] font-mono text-[#2a5a3a]">
                      ℹ Store the PHC string in your database — it encodes the variant, parameters,
                      salt, and hash. Pass it to the Verify tab to check passwords.
                    </div>
                    <Button variant="outline" size="sm" onClick={autoFillVerify}
                      className="text-[10px] font-mono border-[#0a2a18] text-[#2a5a40] hover:bg-[#061e10] hover:text-[#36d988]">
                      ↗ Send to Verify tab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VERIFY ────────────────────────────────────────────────────── */}
          <TabsContent value="verify">
            <Card className="bg-[#020e08] border-[#0a2a18] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a30] font-mono">
                  Verify a password against a stored PHC string. The parameters (variant, memory,
                  iterations, parallelism, salt) are all read from the string — you only need the
                  password. Comparison uses a simulated constant-time check.
                </p>

                <div className="space-y-2">
                  <Label className={labelCls}>Password to verify</Label>
                  <div className="relative">
                    <Input type={verShowPass ? 'text' : 'password'} placeholder="Enter password to check…"
                      value={verPassword} onChange={e => setVerPassword(e.target.value)}
                      className={inputCls + ' pr-10'} />
                    <button onClick={() => setVerShowPass(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2a5a40] hover:text-[#40c080]">
                      {verShowPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>PHC string</Label>
                  <Textarea placeholder="$argon2id$v=19$m=65536,t=2,p=1$…$…"
                    value={verPhc} onChange={e => setVerPhc(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                {verError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {verError}
                  </div>
                )}

                <Button onClick={handleVerify} disabled={verLoading}
                  className="w-full bg-[#061e10] hover:bg-[#0a2818] border border-[#1a6040] text-[#36d988] font-mono text-[10px] uppercase tracking-widest">
                  <RefreshCw size={13} className={`mr-2 ${verLoading ? 'animate-spin' : ''}`} />
                  {verLoading ? 'Verifying…' : 'Verify Password'}
                </Button>

                {verStatus !== 'idle' && (
                  <div className={`flex items-center gap-3 rounded px-4 py-3 border font-mono text-xs ${verStatus === 'match' ? 'bg-[#041808] border-[#1a6040] text-[#36d988]' : 'bg-red-950/30 border-red-800/40 text-red-400'}`}>
                    {verStatus === 'match'
                      ? <><ShieldCheck size={18} /><span>Password matches — authentication successful.</span></>
                      : <><ShieldX size={18} /><span>Password does not match — incorrect password or corrupted hash.</span></>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BENCHMARK ─────────────────────────────────────────────────── */}
          <TabsContent value="benchmark">
            <Card className="bg-[#020e08] border-[#0a2a18] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a30] font-mono">
                  Measure how long each Argon2 configuration takes in your browser. Use this to
                  calibrate parameters so hashing takes 0.5–1 second on your target hardware —
                  balancing user experience against brute-force resistance.
                </p>

                <div className="bg-[#010a06] border border-[#0a1e10] rounded px-3 py-2 text-[10px] font-mono text-[#2a5a3a] space-y-1">
                  <p>OWASP recommends for Argon2id:</p>
                  <p className="text-[#40c080]">m=47104 (46 MiB), t=1, p=1  —  or  —  m=19456 (19 MiB), t=2, p=1</p>
                  <p>Target: ≥ 500ms on your deployment hardware.</p>
                </div>

                {benchResults.length > 0 && (
                  <div className="space-y-2">
                    {benchResults.map((r, i) => {
                      const maxMs = Math.max(...benchResults.map(x => x.ms), 1);
                      const pct = (r.ms / maxMs) * 100;
                      const color = r.ms < 200 ? '#e06030' : r.ms < 600 ? '#c0a030' : '#36d988';
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#3a7060]">{r.label}</span>
                            <span style={{ color }}>{r.ms.toFixed(0)} ms</span>
                          </div>
                          <div className="h-1.5 bg-[#010a06] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button onClick={handleBenchmark} disabled={benchLoading}
                  className="w-full bg-[#061e10] hover:bg-[#0a2818] border border-[#1a6040] text-[#36d988] font-mono text-[10px] uppercase tracking-widest">
                  <Cpu size={13} className={`mr-2 ${benchLoading ? 'animate-pulse' : ''}`} />
                  {benchLoading ? 'Running benchmarks…' : 'Run Benchmark Suite'}
                </Button>

                {!benchLoading && benchResults.length > 0 && (
                  <div className="bg-[#010a06] border border-[#0a1e10] rounded px-3 py-2 text-[10px] font-mono text-[#2a5a3a]">
                    ℹ This is a pure-JS implementation running on a single thread — native Argon2
                    implementations (libsodium, argon2 npm package) are 5–20× faster. Scale
                    parameters proportionally when moving to production.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 grid grid-cols-4 gap-2 text-center">
          {[
            ['Argon2id', 'Recommended'],
            ['Memory-hard', 'GPU resistant'],
            ['PHC winner', '2015'],
            ['RFC 9106', 'Standard'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#020e08] border border-[#061808] rounded p-3">
              <div className="text-[#20a860] font-mono text-[10px] font-bold">{val}</div>
              <div className="text-[#0a2a18] font-mono text-[9px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Argon2Tool;