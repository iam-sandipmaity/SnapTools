import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, Eye, EyeOff, ShieldCheck, ShieldX, Waves } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// ChaCha20 core — RFC 8439
// ═══════════════════════════════════════════════════════════════════════════════

function quarterRound(s: Uint32Array, a: number, b: number, c: number, d: number) {
  s[a] = (s[a] + s[b]) >>> 0; s[d] = Math.imul(s[d] ^ s[a], 1) >>> 0; s[d] = ((s[d] << 16) | (s[d] >>> 16)) >>> 0;
  s[c] = (s[c] + s[d]) >>> 0; s[b] = Math.imul(s[b] ^ s[c], 1) >>> 0; s[b] = ((s[b] << 12) | (s[b] >>> 20)) >>> 0;
  s[a] = (s[a] + s[b]) >>> 0; s[d] = Math.imul(s[d] ^ s[a], 1) >>> 0; s[d] = ((s[d] <<  8) | (s[d] >>> 24)) >>> 0;
  s[c] = (s[c] + s[d]) >>> 0; s[b] = Math.imul(s[b] ^ s[c], 1) >>> 0; s[b] = ((s[b] <<  7) | (s[b] >>> 25)) >>> 0;
}

function chacha20Block(key: Uint8Array, counter: number, nonce: Uint8Array): Uint8Array {
  // key: 32 bytes, nonce: 12 bytes (for ChaCha20) or 16 bytes (for HChaCha20)
  const s = new Uint32Array(16);
  s[0] = 0x61707865; s[1] = 0x3320646e; s[2] = 0x79622d32; s[3] = 0x6b206574;
  const kd = new DataView(key.buffer, key.byteOffset, 32);
  for (let i = 0; i < 8; i++) s[4 + i] = kd.getUint32(i * 4, true);
  s[12] = counter >>> 0;
  const nd = new DataView(nonce.buffer, nonce.byteOffset, nonce.byteLength);
  if (nonce.byteLength === 12) {
    s[13] = nd.getUint32(0, true);
    s[14] = nd.getUint32(4, true);
    s[15] = nd.getUint32(8, true);
  } else {
    // HChaCha20: nonce is 16 bytes, no counter word
    s[12] = nd.getUint32(0, true);
    s[13] = nd.getUint32(4, true);
    s[14] = nd.getUint32(8, true);
    s[15] = nd.getUint32(12, true);
  }
  const w = new Uint32Array(s);
  for (let i = 0; i < 20; i += 2) {
    quarterRound(w, 0,4,8,12);  quarterRound(w, 1,5,9,13);
    quarterRound(w, 2,6,10,14); quarterRound(w, 3,7,11,15);
    quarterRound(w, 0,5,10,15); quarterRound(w, 1,6,11,12);
    quarterRound(w, 2,7,8,13);  quarterRound(w, 3,4,9,14);
  }
  const out = new Uint8Array(64);
  const od = new DataView(out.buffer);
  for (let i = 0; i < 16; i++) od.setUint32(i * 4, (w[i] + s[i]) >>> 0, true);
  return out;
}

// HChaCha20 — derives 32-byte subkey from key + 16-byte nonce prefix
function hchacha20(key: Uint8Array, nonce16: Uint8Array): Uint8Array {
  const s = new Uint32Array(16);
  s[0] = 0x61707865; s[1] = 0x3320646e; s[2] = 0x79622d32; s[3] = 0x6b206574;
  const kd = new DataView(key.buffer, key.byteOffset, 32);
  for (let i = 0; i < 8; i++) s[4 + i] = kd.getUint32(i * 4, true);
  const nd = new DataView(nonce16.buffer, nonce16.byteOffset, 16);
  s[12] = nd.getUint32(0, true); s[13] = nd.getUint32(4, true);
  s[14] = nd.getUint32(8, true); s[15] = nd.getUint32(12, true);
  const w = new Uint32Array(s);
  for (let i = 0; i < 20; i += 2) {
    quarterRound(w, 0,4,8,12);  quarterRound(w, 1,5,9,13);
    quarterRound(w, 2,6,10,14); quarterRound(w, 3,7,11,15);
    quarterRound(w, 0,5,10,15); quarterRound(w, 1,6,11,12);
    quarterRound(w, 2,7,8,13);  quarterRound(w, 3,4,9,14);
  }
  // Output: first and last four words (not added to input state)
  const out = new Uint8Array(32);
  const od = new DataView(out.buffer);
  od.setUint32(0,  w[0],  true); od.setUint32(4,  w[1],  true);
  od.setUint32(8,  w[2],  true); od.setUint32(12, w[3],  true);
  od.setUint32(16, w[12], true); od.setUint32(20, w[13], true);
  od.setUint32(24, w[14], true); od.setUint32(28, w[15], true);
  return out;
}

// ChaCha20 stream cipher — encrypt/decrypt (XOR)
function chacha20(key: Uint8Array, counter: number, nonce12: Uint8Array, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length);
  let pos = 0;
  let ctr = counter;
  while (pos < data.length) {
    const block = chacha20Block(key, ctr++, nonce12);
    const take = Math.min(64, data.length - pos);
    for (let i = 0; i < take; i++) out[pos + i] = data[pos + i] ^ block[i];
    pos += take;
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Poly1305 — RFC 8439
// ═══════════════════════════════════════════════════════════════════════════════

function poly1305Mac(key: Uint8Array, msg: Uint8Array): Uint8Array {
  // key: 32 bytes (r: 16 bytes, s: 16 bytes)
  const clamp = [0x0fffffff, 0x0ffffffc, 0x0ffffffc, 0x0ffffffc];
  const kd = new DataView(key.buffer, key.byteOffset, 32);

  // Load and clamp r (little-endian 128-bit integer, stored as 5×26-bit limbs)
  let r0 = (kd.getUint32(0, true)) & clamp[0];
  let r1 = (kd.getUint32(3, true) >>> 2) & clamp[1];
  let r2 = (kd.getUint32(6, true) >>> 4) & clamp[2];
  let r3 = (kd.getUint32(9, true) >>> 6) & clamp[3];
  let r4 = (kd.getUint8(12)) & 0x03;

  // Accumulator
  let h0 = 0, h1 = 0, h2 = 0, h3 = 0, h4 = 0;

  // Process 16-byte blocks
  const len = msg.length;
  let i = 0;
  while (i < len) {
    const block = new Uint8Array(17);
    const take = Math.min(16, len - i);
    block.set(msg.subarray(i, i + take));
    block[take] = 1; // append bit

    const md = new DataView(block.buffer);
    // Accumulate block as little-endian 130-bit integer
    const n0 = md.getUint32(0, true);
    const n1 = md.getUint32(4, true);
    const n2 = md.getUint32(8, true);
    const n3 = md.getUint32(12, true);
    const hibit = block[16];

    h0 += n0 & 0x3ffffff;
    h1 += ((n0 >>> 26) | (n1 << 6)) & 0x3ffffff;
    h2 += ((n1 >>> 20) | (n2 << 12)) & 0x3ffffff;
    h3 += ((n2 >>> 14) | (n3 << 18)) & 0x3ffffff;
    h4 += (n3 >>> 8) | (hibit << 24);

    // Multiply h by r mod 2^130-5
    const r1_5 = r1 * 5, r2_5 = r2 * 5, r3_5 = r3 * 5, r4_5 = r4 * 5;
    let d0 = h0*r0 + h1*r4_5 + h2*r3_5 + h3*r2_5 + h4*r1_5;
    let d1 = h0*r1 + h1*r0   + h2*r4_5 + h3*r3_5 + h4*r2_5;
    let d2 = h0*r2 + h1*r1   + h2*r0   + h3*r4_5 + h4*r3_5;
    let d3 = h0*r3 + h1*r2   + h2*r1   + h3*r0   + h4*r4_5;
    let d4 = h0*r4 + h1*r3   + h2*r2   + h3*r1   + h4*r0;

    // Carry propagation
    let c: number;
    c = Math.floor(d0 / 0x4000000); h0 = d0 & 0x3ffffff; d1 += c;
    c = Math.floor(d1 / 0x4000000); h1 = d1 & 0x3ffffff; d2 += c;
    c = Math.floor(d2 / 0x4000000); h2 = d2 & 0x3ffffff; d3 += c;
    c = Math.floor(d3 / 0x4000000); h3 = d3 & 0x3ffffff; d4 += c;
    c = Math.floor(d4 / 0x4000000); h4 = d4 & 0x3ffffff; h0 += c * 5;
    c = Math.floor(h0 / 0x4000000); h0 &= 0x3ffffff;      h1 += c;
    i += 16;
  }

  // Fully reduce h mod 2^130-5
  let c = Math.floor(h1 / 0x4000000); h1 &= 0x3ffffff; h2 += c;
      c = Math.floor(h2 / 0x4000000); h2 &= 0x3ffffff; h3 += c;
      c = Math.floor(h3 / 0x4000000); h3 &= 0x3ffffff; h4 += c;
      c = Math.floor(h4 / 0x4000000); h4 &= 0x3ffffff; h0 += c * 5;
      c = Math.floor(h0 / 0x4000000); h0 &= 0x3ffffff; h1 += c;

  // Compute h + (-p) = h - (2^130-5)
  let g0 = h0 + 5;
  c = Math.floor(g0 / 0x4000000); g0 &= 0x3ffffff;
  let g1 = h1 + c; c = Math.floor(g1 / 0x4000000); g1 &= 0x3ffffff;
  let g2 = h2 + c; c = Math.floor(g2 / 0x4000000); g2 &= 0x3ffffff;
  let g3 = h3 + c; c = Math.floor(g3 / 0x4000000); g3 &= 0x3ffffff;
  let g4 = h4 + c - 0x4000000;

  // Select h if h < p, else h - p
  const mask = (g4 >>> 31) - 1;
  g0 &= mask; g1 &= mask; g2 &= mask; g3 &= mask; g4 &= mask;
  const nmask = ~mask;
  h0 = (h0 & nmask) | g0; h1 = (h1 & nmask) | g1;
  h2 = (h2 & nmask) | g2; h3 = (h3 & nmask) | g3;
  h4 = (h4 & nmask) | g4;

  // h = h % (2^128) — pack to 128 bits
  h0 = (h0 | (h1 << 26)) >>> 0;
  h1 = ((h1 >>> 6) | (h2 << 20)) >>> 0;
  h2 = ((h2 >>> 12) | (h3 << 14)) >>> 0;
  h3 = ((h3 >>> 18) | (h4 << 8)) >>> 0;

  // Add s (the second 16 bytes of the key)
  const s0 = kd.getUint32(16, true); const s1 = kd.getUint32(20, true);
  const s2 = kd.getUint32(24, true); const s3 = kd.getUint32(28, true);

  let f = (h0 + s0) >>> 0; const t0 = f;
  f = (h1 + s1 + (f < h0 ? 1 : 0)) >>> 0; const t1 = f;
  f = (h2 + s2 + (f < h1 ? 1 : 0)) >>> 0; const t2 = f;
  const t3 = (h3 + s3 + (f < h2 ? 1 : 0)) >>> 0;

  const tag = new Uint8Array(16);
  const td = new DataView(tag.buffer);
  td.setUint32(0, t0, true); td.setUint32(4, t1, true);
  td.setUint32(8, t2, true); td.setUint32(12, t3, true);
  return tag;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ChaCha20-Poly1305 AEAD — RFC 8439
// ═══════════════════════════════════════════════════════════════════════════════

function chachaPoly1305Encrypt(key: Uint8Array, nonce12: Uint8Array, plaintext: Uint8Array, aad: Uint8Array): { ct: Uint8Array; tag: Uint8Array } {
  // Generate Poly1305 one-time key from block 0
  const otk = chacha20Block(key, 0, nonce12).subarray(0, 32);
  // Encrypt starting from block 1
  const ct = chacha20(key, 1, nonce12, plaintext);
  // Build MAC data: aad || pad(aad) || ct || pad(ct) || len(aad) || len(ct)
  const pad = (n: number) => new Uint8Array((16 - (n % 16)) % 16);
  const lenBuf = new Uint8Array(16);
  const ldv = new DataView(lenBuf.buffer);
  ldv.setBigUint64(0, BigInt(aad.length), true);
  ldv.setBigUint64(8, BigInt(ct.length), true);
  const macData = concat(aad, pad(aad.length), ct, pad(ct.length), lenBuf);
  const tag = poly1305Mac(otk, macData);
  return { ct, tag };
}

function chachaPoly1305Decrypt(key: Uint8Array, nonce12: Uint8Array, ct: Uint8Array, tag: Uint8Array, aad: Uint8Array): Uint8Array {
  const otk = chacha20Block(key, 0, nonce12).subarray(0, 32);
  const pad = (n: number) => new Uint8Array((16 - (n % 16)) % 16);
  const lenBuf = new Uint8Array(16);
  const ldv = new DataView(lenBuf.buffer);
  ldv.setBigUint64(0, BigInt(aad.length), true);
  ldv.setBigUint64(8, BigInt(ct.length), true);
  const macData = concat(aad, pad(aad.length), ct, pad(ct.length), lenBuf);
  const expectedTag = poly1305Mac(otk, macData);
  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < 16; i++) diff |= expectedTag[i] ^ tag[i];
  if (diff !== 0) throw new Error('Authentication failed — tag mismatch');
  return chacha20(key, 1, nonce12, ct);
}

// ═══════════════════════════════════════════════════════════════════════════════
// XChaCha20-Poly1305 — draft-irtf-cfrg-xchacha
// ═══════════════════════════════════════════════════════════════════════════════

function xchacha20Poly1305Encrypt(key: Uint8Array, nonce24: Uint8Array, plaintext: Uint8Array, aad: Uint8Array): { ct: Uint8Array; tag: Uint8Array } {
  // Derive subkey using HChaCha20 with first 16 bytes of nonce
  const subkey = hchacha20(key, nonce24.subarray(0, 16));
  // Build 12-byte ChaCha20 nonce: 4 zero bytes + last 8 bytes of XChaCha20 nonce
  const nonce12 = new Uint8Array(12);
  nonce12.set(nonce24.subarray(16), 4);
  return chachaPoly1305Encrypt(subkey, nonce12, plaintext, aad);
}

function xchacha20Poly1305Decrypt(key: Uint8Array, nonce24: Uint8Array, ct: Uint8Array, tag: Uint8Array, aad: Uint8Array): Uint8Array {
  const subkey = hchacha20(key, nonce24.subarray(0, 16));
  const nonce12 = new Uint8Array(12);
  nonce12.set(nonce24.subarray(16), 4);
  return chachaPoly1305Decrypt(subkey, nonce12, ct, tag, aad);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PBKDF2-SHA256 — key stretching via WebCrypto
// ═══════════════════════════════════════════════════════════════════════════════

async function pbkdf2(password: string, salt: Uint8Array, iterations: number, keyLen: number): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, baseKey, keyLen * 8);
  return new Uint8Array(bits);
}

// ═══════════════════════════════════════════════════════════════════════════════
// High-level encrypt / decrypt
// Wire format: base64( salt[16] || nonce[24] || ciphertext || tag[16] )
// ═══════════════════════════════════════════════════════════════════════════════

const PBKDF2_ITER = 100_000;

async function encryptMessage(password: string, plaintext: string, aad = ''): Promise<string> {
  const salt    = crypto.getRandomValues(new Uint8Array(16));
  const nonce   = crypto.getRandomValues(new Uint8Array(24));
  const key     = await pbkdf2(password, salt, PBKDF2_ITER, 32);
  const ptBytes = new TextEncoder().encode(plaintext);
  const aadBytes = new TextEncoder().encode(aad);
  const { ct, tag } = xchacha20Poly1305Encrypt(key, nonce, ptBytes, aadBytes);
  const wire = concat(salt, nonce, ct, tag);
  return btoa(String.fromCharCode(...wire));
}

async function decryptMessage(password: string, ciphertext: string, aad = ''): Promise<string> {
  let wire: Uint8Array;
  try { wire = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0)); }
  catch { throw new Error('Invalid base64 ciphertext'); }
  if (wire.length < 16 + 24 + 16) throw new Error('Ciphertext too short');
  const salt    = wire.subarray(0, 16);
  const nonce   = wire.subarray(16, 40);
  const tag     = wire.subarray(wire.length - 16);
  const ct      = wire.subarray(40, wire.length - 16);
  const key     = await pbkdf2(password, salt, PBKDF2_ITER, 32);
  const aadBytes = new TextEncoder().encode(aad);
  const pt = xchacha20Poly1305Decrypt(key, nonce, ct, tag, aadBytes);
  return new TextDecoder().decode(pt);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════════════

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

function toHex(b: Uint8Array): string {
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}
function toBase64(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b));
}

type Fmt = 'hex' | 'base64';
function encode(b: Uint8Array, fmt: Fmt): string {
  return fmt === 'hex' ? toHex(b) : toBase64(b);
}
function decode(s: string, fmt: Fmt): Uint8Array {
  if (fmt === 'hex') {
    const c = s.replace(/\s/g, '');
    if (c.length % 2 !== 0) throw new Error('Invalid hex');
    const o = new Uint8Array(c.length / 2);
    for (let i = 0; i < o.length; i++) o[i] = parseInt(c.slice(i * 2, i * 2 + 2), 16);
    return o;
  }
  return Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600); }}
      className="p-1.5 rounded hover:bg-white/5 text-[#60a8c8] transition-colors" title="Copy">
      {ok ? <Check size={13} className="text-[#40d8ff]" /> : <Copy size={13} />}
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a7090]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <div className="font-mono text-xs bg-[#020c14] border border-[#0d2a3a] rounded px-3 py-2 break-all select-all text-[#60d0f0]">
        {value}
      </div>
    </div>
  );
}

function Toggle<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${value === o ? 'bg-[#061828] border-[#1a6080] text-[#40c0e0]' : 'bg-transparent border-[#0d2a3a] text-[#2a6080] hover:border-[#1a4060]'}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

const XChaCha20Tool: React.FC = () => {
  const inputCls = 'bg-[#020c14] border-[#0d2a3a] text-[#60d0f0] placeholder-[#1a4a60] font-mono text-xs focus:ring-1 focus:ring-[#1a6080] focus:border-[#1a6080]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#3a7090]';

  // ── Encrypt tab
  const [encPlaintext, setEncPlaintext] = useState('');
  const [encPassword, setEncPassword]   = useState('');
  const [encShowPass, setEncShowPass]   = useState(false);
  const [encAad, setEncAad]             = useState('');
  const [encResult, setEncResult]       = useState('');
  const [encLoading, setEncLoading]     = useState(false);
  const [encError, setEncError]         = useState('');

  // ── Decrypt tab
  const [decCiphertext, setDecCiphertext] = useState('');
  const [decPassword, setDecPassword]     = useState('');
  const [decShowPass, setDecShowPass]     = useState(false);
  const [decAad, setDecAad]               = useState('');
  const [decResult, setDecResult]         = useState('');
  const [decLoading, setDecLoading]       = useState(false);
  const [decError, setDecError]           = useState('');

  // ── Inspect tab — parse wire format
  const [inspInput, setInspInput]   = useState('');
  const [inspResult, setInspResult] = useState<{ salt: string; nonce: string; ct: string; tag: string; ctLen: number } | null>(null);
  const [inspError, setInspError]   = useState('');
  const [inspFmt, setInspFmt]       = useState<Fmt>('hex');

  // ── Encrypt ─────────────────────────────────────────────────────────────────
  const handleEncrypt = useCallback(async () => {
    setEncError(''); setEncResult('');
    if (!encPlaintext.trim()) return setEncError('Plaintext is required.');
    if (!encPassword.trim())  return setEncError('Password is required.');
    setEncLoading(true);
    try {
      const result = await encryptMessage(encPassword, encPlaintext, encAad);
      setEncResult(result);
    } catch (e: any) {
      setEncError(e.message || 'Encryption failed.');
    } finally { setEncLoading(false); }
  }, [encPlaintext, encPassword, encAad]);

  // ── Decrypt ─────────────────────────────────────────────────────────────────
  const handleDecrypt = useCallback(async () => {
    setDecError(''); setDecResult('');
    if (!decCiphertext.trim()) return setDecError('Ciphertext is required.');
    if (!decPassword.trim())   return setDecError('Password is required.');
    setDecLoading(true);
    try {
      const result = await decryptMessage(decPassword, decCiphertext, decAad);
      setDecResult(result);
    } catch (e: any) {
      setDecError(e.message || 'Decryption failed. Wrong password, corrupted data, or mismatched AAD.');
    } finally { setDecLoading(false); }
  }, [decCiphertext, decPassword, decAad]);

  // ── Inspect ─────────────────────────────────────────────────────────────────
  const handleInspect = useCallback(() => {
    setInspError(''); setInspResult(null);
    if (!inspInput.trim()) return setInspError('Paste a ciphertext to inspect.');
    try {
      let wire: Uint8Array;
      try { wire = Uint8Array.from(atob(inspInput.trim()), c => c.charCodeAt(0)); }
      catch { throw new Error('Invalid base64 input.'); }
      if (wire.length < 56) throw new Error(`Too short: ${wire.length} bytes (minimum 56: 16 salt + 24 nonce + 0 ct + 16 tag)`);
      const salt  = wire.subarray(0, 16);
      const nonce = wire.subarray(16, 40);
      const tag   = wire.subarray(wire.length - 16);
      const ct    = wire.subarray(40, wire.length - 16);
      setInspResult({
        salt:  encode(salt,  inspFmt),
        nonce: encode(nonce, inspFmt),
        ct:    encode(ct,    inspFmt),
        tag:   encode(tag,   inspFmt),
        ctLen: ct.length,
      });
    } catch (e: any) {
      setInspError(e.message || 'Could not parse ciphertext.');
    }
  }, [inspInput, inspFmt]);

  // Auto-fill decrypt from encrypt result
  const autoFillDecrypt = useCallback(() => {
    if (!encResult) return;
    setDecCiphertext(encResult);
    setDecPassword(encPassword);
    setDecAad(encAad);
  }, [encResult, encPassword, encAad]);

  // Auto-fill inspect from encrypt result
  const autoFillInspect = useCallback(() => {
    if (!encResult) return;
    setInspInput(encResult);
  }, [encResult]);

  return (
    <div className="min-h-screen w-full p-4 md:p-8"
      style={{ background: 'radial-gradient(ellipse at 70% 10%, #010c18 0%, #020a12 50%, #010810 100%)', fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 200deg, #021428, #0878c0, #021428)' }}>
            <Waves size={14} className="text-[#40c8ff]" />
          </div>
          <h1 className="text-2xl font-bold text-[#38c8f8]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            XChaCha20
          </h1>
          <Badge className="bg-[#020e1a] text-[#2090c8] border border-[#0a3050] text-[10px] font-mono">Poly1305</Badge>
          <Badge className="bg-[#020e1a] text-[#2090c8] border border-[#0a3050] text-[10px] font-mono">AEAD</Badge>
          <Badge className="bg-[#020e1a] text-[#2090c8] border border-[#0a3050] text-[10px] font-mono">Pure JS</Badge>
        </div>
        <p className="text-[#1a4a60] text-[11px] font-mono ml-11">
          192-bit nonce · HChaCha20 subkey derivation · Poly1305 authentication · PBKDF2-SHA256 key stretch
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="encrypt">
          <TabsList className="bg-[#020c14] border border-[#0d2a3a] mb-6 w-full grid grid-cols-3">
            {['encrypt', 'decrypt', 'inspect'].map(t => (
              <TabsTrigger key={t} value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#1a4a60] data-[state=active]:bg-[#041828] data-[state=active]:text-[#40c8f8]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── ENCRYPT ─────────────────────────────────────────────────────── */}
          <TabsContent value="encrypt">
            <Card className="bg-[#020c14] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a60] font-mono">
                  Encrypts with a random 24-byte nonce and 16-byte salt. Your password is stretched
                  to 256 bits via PBKDF2-SHA256 (100k iterations). Poly1305 authenticates the output —
                  any tamper is detected on decrypt.
                </p>

                {/* How it works strip */}
                <div className="bg-[#010810] border border-[#0a1e2a] rounded px-3 py-2.5 space-y-1 text-[10px] font-mono text-[#2a6080]">
                  <div className="flex gap-2 items-start"><span className="text-[#1a7090] shrink-0">1.</span><span><span className="text-[#40a0c0]">HChaCha20</span> derives a 256-bit subkey from key + nonce[0..15]</span></div>
                  <div className="flex gap-2 items-start"><span className="text-[#1a7090] shrink-0">2.</span><span><span className="text-[#40a0c0]">ChaCha20</span> generates keystream using subkey + nonce[16..23]</span></div>
                  <div className="flex gap-2 items-start"><span className="text-[#1a7090] shrink-0">3.</span><span><span className="text-[#40a0c0]">Poly1305</span> computes 128-bit authentication tag over AAD + ciphertext</span></div>
                  <div className="flex gap-2 items-start"><span className="text-[#1a7090] shrink-0">4.</span><span>Wire: <span className="text-[#40a0c0]">base64( salt[16] ‖ nonce[24] ‖ ciphertext ‖ tag[16] )</span></span></div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Plaintext</Label>
                  <Textarea placeholder="Enter text to encrypt…" value={encPlaintext}
                    onChange={e => setEncPlaintext(e.target.value)}
                    className={inputCls + ' min-h-[100px]'} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Password</Label>
                  <div className="relative">
                    <Input type={encShowPass ? 'text' : 'password'} placeholder="Encryption password…"
                      value={encPassword} onChange={e => setEncPassword(e.target.value)}
                      className={inputCls + ' pr-10'} />
                    <button onClick={() => setEncShowPass(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2a5a70] hover:text-[#40b0d0]">
                      {encShowPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Additional Authenticated Data (AAD) <span className="normal-case tracking-normal text-[#1a3a50] ml-2">optional</span></Label>
                  <Input placeholder="Associated data — authenticated but not encrypted…"
                    value={encAad} onChange={e => setEncAad(e.target.value)} className={inputCls} />
                </div>

                {encError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {encError}
                  </div>
                )}

                <Button onClick={handleEncrypt} disabled={encLoading}
                  className="w-full bg-[#041828] hover:bg-[#061e30] border border-[#1a5070] text-[#40c8f8] font-mono text-[10px] uppercase tracking-widest">
                  {encLoading ? 'Encrypting… (PBKDF2 in progress)' : 'Encrypt'}
                </Button>

                {encResult && (
                  <div className="space-y-3 pt-2 border-t border-[#0a1e2a]">
                    <Field label="Ciphertext (base64 wire format)" value={encResult} />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={autoFillDecrypt}
                        className="text-[10px] font-mono border-[#0d2a3a] text-[#2a6080] hover:bg-[#041828] hover:text-[#40c8f8]">
                        ↗ Send to Decrypt tab
                      </Button>
                      <Button variant="outline" size="sm" onClick={autoFillInspect}
                        className="text-[10px] font-mono border-[#0d2a3a] text-[#2a6080] hover:bg-[#041828] hover:text-[#40c8f8]">
                        ↗ Inspect wire format
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DECRYPT ─────────────────────────────────────────────────────── */}
          <TabsContent value="decrypt">
            <Card className="bg-[#020c14] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a60] font-mono">
                  Paste a base64 ciphertext produced by this tool. The salt, nonce, and tag are all
                  embedded in the wire format. If the password, AAD, or any byte of ciphertext is
                  wrong, decryption will fail with an authentication error.
                </p>

                <div className="space-y-2">
                  <Label className={labelCls}>Ciphertext (base64)</Label>
                  <Textarea placeholder="Paste base64 ciphertext…" value={decCiphertext}
                    onChange={e => setDecCiphertext(e.target.value)}
                    className={inputCls + ' min-h-[100px]'} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Password</Label>
                  <div className="relative">
                    <Input type={decShowPass ? 'text' : 'password'} placeholder="Decryption password…"
                      value={decPassword} onChange={e => setDecPassword(e.target.value)}
                      className={inputCls + ' pr-10'} />
                    <button onClick={() => setDecShowPass(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2a5a70] hover:text-[#40b0d0]">
                      {decShowPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>AAD <span className="normal-case tracking-normal text-[#1a3a50] ml-2">must match encryption</span></Label>
                  <Input placeholder="Associated data used during encryption…"
                    value={decAad} onChange={e => setDecAad(e.target.value)} className={inputCls} />
                </div>

                {decError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {decError}
                  </div>
                )}

                <Button onClick={handleDecrypt} disabled={decLoading}
                  className="w-full bg-[#041828] hover:bg-[#061e30] border border-[#1a5070] text-[#40c8f8] font-mono text-[10px] uppercase tracking-widest">
                  {decLoading ? 'Decrypting… (PBKDF2 in progress)' : 'Decrypt'}
                </Button>

                {decResult && (
                  <div className="space-y-2 pt-2 border-t border-[#0a1e2a]">
                    <div className="flex items-center gap-2 text-xs text-[#40c8f8] bg-[#041828] border border-[#1a5070] rounded px-3 py-2 font-mono">
                      <ShieldCheck size={14} /> Authentication passed — plaintext is genuine.
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={labelCls}>Decrypted Plaintext</span>
                        <CopyBtn text={decResult} />
                      </div>
                      <Textarea value={decResult} readOnly className={inputCls + ' min-h-[100px]'} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── INSPECT ─────────────────────────────────────────────────────── */}
          <TabsContent value="inspect">
            <Card className="bg-[#020c14] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a60] font-mono">
                  Parse a base64 ciphertext and decompose it into its constituent fields:
                  PBKDF2 salt, XChaCha20 nonce, raw ciphertext bytes, and Poly1305 tag.
                </p>

                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Field encoding</Label>
                  <Toggle options={['hex', 'base64'] as Fmt[]} value={inspFmt} onChange={setInspFmt} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Base64 Ciphertext</Label>
                  <Textarea placeholder="Paste base64 ciphertext to inspect…" value={inspInput}
                    onChange={e => setInspInput(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                {inspError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {inspError}
                  </div>
                )}

                <Button onClick={handleInspect}
                  className="w-full bg-[#041828] hover:bg-[#061e30] border border-[#1a5070] text-[#40c8f8] font-mono text-[10px] uppercase tracking-widest">
                  Inspect Wire Format
                </Button>

                {inspResult && (
                  <div className="space-y-3 pt-2 border-t border-[#0a1e2a]">
                    {/* Visual layout diagram */}
                    <div className="bg-[#010810] border border-[#0a1e2a] rounded px-3 py-2 text-[10px] font-mono">
                      <div className="flex gap-0 mb-1 overflow-hidden rounded">
                        {[
                          { label: 'salt', bytes: 16, color: '#1a5070' },
                          { label: 'nonce', bytes: 24, color: '#1a4a60' },
                          { label: `ct (${inspResult.ctLen}B)`, bytes: Math.max(inspResult.ctLen, 4), color: '#103050' },
                          { label: 'tag', bytes: 16, color: '#1a3a50' },
                        ].map(({ label, bytes, color }) => {
                          const total = 16 + 24 + Math.max(inspResult.ctLen, 4) + 16;
                          const pct = (bytes / total) * 100;
                          return (
                            <div key={label} className="text-center py-1 text-[9px] truncate"
                              style={{ width: `${pct}%`, background: color, color: '#60c0e0' }}>
                              {label}
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-[#1a4a60] mt-1">
                        Total: {16 + 24 + inspResult.ctLen + 16} bytes ({(16 + 24 + inspResult.ctLen + 16) * 4 / 3 | 0}≈ base64 chars)
                      </div>
                    </div>

                    <Field label="PBKDF2 Salt (16 bytes)" value={inspResult.salt} />
                    <Field label="XChaCha20 Nonce (24 bytes)" value={inspResult.nonce} />
                    <Field label={`Ciphertext (${inspResult.ctLen} bytes)`} value={inspResult.ct.length > 200 ? inspResult.ct.slice(0, 200) + '…' : inspResult.ct} />
                    <Field label="Poly1305 Tag (16 bytes)" value={inspResult.tag} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 grid grid-cols-4 gap-2 text-center">
          {[
            ['192-bit nonce', 'XChaCha20'],
            ['Poly1305', 'Auth tag'],
            ['PBKDF2 100k', 'Key stretch'],
            ['CFRG draft', 'Standard'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#020c14] border border-[#061828] rounded p-3">
              <div className="text-[#2090b8] font-mono text-[10px] font-bold">{val}</div>
              <div className="text-[#0a2a3a] font-mono text-[9px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default XChaCha20Tool;