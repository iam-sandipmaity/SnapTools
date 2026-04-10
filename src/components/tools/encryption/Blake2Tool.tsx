import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, Hash, Upload, RefreshCw } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// BLAKE2b — 64-bit word variant (output 1–64 bytes)
// RFC 7693
// ═══════════════════════════════════════════════════════════════════════════════

const BLAKE2B_IV = new BigInt64Array([
  0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n, 0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n,
].map(BigInt) as unknown as BigInt64Array);

const SIGMA = [
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
];

const B64 = BigInt(64);
const MASK64 = 0xffffffffffffffffn;

function rotr64(x: bigint, n: bigint): bigint {
  return ((x >> n) | (x << (B64 - n))) & MASK64;
}

function blake2bMix(v: bigint[], a: number, b: number, c: number, d: number, x: bigint, y: bigint) {
  v[a] = (v[a] + v[b] + x) & MASK64;
  v[d] = rotr64(v[d] ^ v[a], 32n);
  v[c] = (v[c] + v[d]) & MASK64;
  v[b] = rotr64(v[b] ^ v[c], 24n);
  v[a] = (v[a] + v[b] + y) & MASK64;
  v[d] = rotr64(v[d] ^ v[a], 16n);
  v[c] = (v[c] + v[d]) & MASK64;
  v[b] = rotr64(v[b] ^ v[c], 63n);
}

function blake2bCompress(h: bigint[], m: bigint[], t: [bigint, bigint], last: boolean) {
  const v: bigint[] = [
    ...h,
    BLAKE2B_IV[0], BLAKE2B_IV[1], BLAKE2B_IV[2], BLAKE2B_IV[3],
    BLAKE2B_IV[4] ^ t[0], BLAKE2B_IV[5] ^ t[1],
    last ? BLAKE2B_IV[6] ^ MASK64 : BLAKE2B_IV[6],
    BLAKE2B_IV[7],
  ];
  for (let i = 0; i < 12; i++) {
    const s = SIGMA[i % 10];
    blake2bMix(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
    blake2bMix(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
    blake2bMix(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
    blake2bMix(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
    blake2bMix(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
    blake2bMix(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
    blake2bMix(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
    blake2bMix(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
  }
  for (let i = 0; i < 8; i++) h[i] ^= v[i] ^ v[i + 8];
}

function blake2b(input: Uint8Array, outLen = 64, key: Uint8Array = new Uint8Array(0)): Uint8Array {
  if (outLen < 1 || outLen > 64) throw new Error('BLAKE2b output length must be 1–64');
  if (key.length > 64) throw new Error('BLAKE2b key must be 0–64 bytes');

  const kk = key.length;
  const h = Array.from(BLAKE2B_IV) as bigint[];
  h[0] ^= 0x01010000n ^ (BigInt(kk) << 8n) ^ BigInt(outLen);

  const BLOCK = 128;
  let data = input;
  if (kk > 0) {
    const block0 = new Uint8Array(BLOCK);
    block0.set(key);
    const tmp = new Uint8Array(BLOCK + input.length);
    tmp.set(block0);
    tmp.set(input, BLOCK);
    data = tmp;
  }

  const dataLen = data.length;
  const numBlocks = Math.max(1, Math.ceil(dataLen / BLOCK));

  for (let b = 0; b < numBlocks; b++) {
    const isLast = b === numBlocks - 1;
    const block = new Uint8Array(BLOCK);
    block.set(data.slice(b * BLOCK, b * BLOCK + BLOCK));
    const consumed = BigInt(Math.min((b + 1) * BLOCK, dataLen));
    const m: bigint[] = [];
    for (let i = 0; i < 16; i++) {
      let word = 0n;
      for (let j = 7; j >= 0; j--) word = (word << 8n) | BigInt(block[i * 8 + j]);
      m.push(word);
    }
    blake2bCompress(h, m, [consumed, 0n], isLast);
  }

  const out = new Uint8Array(outLen);
  for (let i = 0; i < outLen; i++) {
    out[i] = Number((h[Math.floor(i / 8)] >> BigInt((i % 8) * 8)) & 0xffn);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLAKE2s — 32-bit word variant (output 1–32 bytes)
// RFC 7693
// ═══════════════════════════════════════════════════════════════════════════════

const BLAKE2S_IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

function rotr32(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function blake2sMix(v: number[], a: number, b: number, c: number, d: number, x: number, y: number) {
  v[a] = (v[a] + v[b] + x) >>> 0;
  v[d] = rotr32(v[d] ^ v[a], 16);
  v[c] = (v[c] + v[d]) >>> 0;
  v[b] = rotr32(v[b] ^ v[c], 12);
  v[a] = (v[a] + v[b] + y) >>> 0;
  v[d] = rotr32(v[d] ^ v[a], 8);
  v[c] = (v[c] + v[d]) >>> 0;
  v[b] = rotr32(v[b] ^ v[c], 7);
}

function blake2sCompress(h: number[], m: number[], t: [number, number], last: boolean) {
  const v: number[] = [
    ...h,
    BLAKE2S_IV[0], BLAKE2S_IV[1], BLAKE2S_IV[2], BLAKE2S_IV[3],
    BLAKE2S_IV[4] ^ t[0], BLAKE2S_IV[5] ^ t[1],
    last ? (BLAKE2S_IV[6] ^ 0xffffffff) >>> 0 : BLAKE2S_IV[6],
    BLAKE2S_IV[7],
  ];
  for (let i = 0; i < 10; i++) {
    const s = SIGMA[i];
    blake2sMix(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
    blake2sMix(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
    blake2sMix(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
    blake2sMix(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
    blake2sMix(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
    blake2sMix(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
    blake2sMix(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
    blake2sMix(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
  }
  for (let i = 0; i < 8; i++) h[i] = (h[i] ^ v[i] ^ v[i + 8]) >>> 0;
}

function blake2s(input: Uint8Array, outLen = 32, key: Uint8Array = new Uint8Array(0)): Uint8Array {
  if (outLen < 1 || outLen > 32) throw new Error('BLAKE2s output length must be 1–32');
  if (key.length > 32) throw new Error('BLAKE2s key must be 0–32 bytes');

  const kk = key.length;
  const h = Array.from(BLAKE2S_IV) as number[];
  h[0] ^= 0x01010000 ^ (kk << 8) ^ outLen;

  const BLOCK = 64;
  let data = input;
  if (kk > 0) {
    const block0 = new Uint8Array(BLOCK);
    block0.set(key);
    const tmp = new Uint8Array(BLOCK + input.length);
    tmp.set(block0);
    tmp.set(input, BLOCK);
    data = tmp;
  }

  const dataLen = data.length;
  const numBlocks = Math.max(1, Math.ceil(dataLen / BLOCK));

  for (let b = 0; b < numBlocks; b++) {
    const isLast = b === numBlocks - 1;
    const block = new Uint8Array(BLOCK);
    block.set(data.slice(b * BLOCK, b * BLOCK + BLOCK));
    const consumed = Math.min((b + 1) * BLOCK, dataLen);
    const m: number[] = [];
    for (let i = 0; i < 16; i++) {
      m.push(
        (block[i * 4] | (block[i * 4 + 1] << 8) | (block[i * 4 + 2] << 16) | (block[i * 4 + 3] << 24)) >>> 0
      );
    }
    blake2sCompress(h, m, [consumed, 0], isLast);
  }

  const out = new Uint8Array(outLen);
  for (let i = 0; i < outLen; i++) {
    out[i] = (h[Math.floor(i / 4)] >>> ((i % 4) * 8)) & 0xff;
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Encoding helpers
// ═══════════════════════════════════════════════════════════════════════════════
type Fmt = 'hex' | 'base64';

function toHex(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
}
function toBase64(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b));
}
function encFmt(b: Uint8Array, fmt: Fmt): string {
  return fmt === 'hex' ? toHex(b) : toBase64(b);
}
function fromHex(h: string): Uint8Array {
  const c = h.replace(/\s/g, '');
  if (c.length % 2 !== 0) throw new Error('Invalid hex');
  const o = new Uint8Array(c.length / 2);
  for (let i = 0; i < o.length; i++) o[i] = parseInt(c.slice(i * 2, i * 2 + 2), 16);
  return o;
}
function fromBase64(s: string): Uint8Array {
  return Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0));
}
function decFmt(s: string, fmt: Fmt): Uint8Array {
  return fmt === 'hex' ? fromHex(s) : fromBase64(s);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600); }}
      className="p-1.5 rounded hover:bg-white/5 text-[#60a0c0] transition-colors" title="Copy">
      {ok ? <Check size={13} className="text-[#40d0ff]" /> : <Copy size={13} />}
    </button>
  );
}

function HashOutput({ label, value, bits }: { label: string; value: string; bits: number }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a7090]">{label}</span>
          <span className="text-[9px] font-mono bg-[#061828] border border-[#0d3a50] rounded px-1.5 py-0.5 text-[#2a8aaa]">{bits} bits</span>
        </div>
        <CopyBtn text={value} />
      </div>
      <div className="font-mono text-xs bg-[#030e18] border border-[#0d2a3a] rounded px-3 py-2 break-all select-all text-[#60d0f0]">
        {value}
      </div>
    </div>
  );
}

function Toggle<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
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
type Variant = 'BLAKE2b' | 'BLAKE2s';

const Blake2Tool: React.FC = () => {
  // ── Hash tab
  const [variant, setVariant] = useState<Variant>('BLAKE2b');
  const [input, setInput] = useState('');
  const [keyHex, setKeyHex] = useState('');
  const [outLen, setOutLen] = useState(64);
  const [fmt, setFmt] = useState<Fmt>('hex');
  const [hashResult, setHashResult] = useState('');
  const [hashError, setHashError] = useState('');
  const [hashAll, setHashAll] = useState<{ b512: string; b256: string; s256: string; s128: string } | null>(null);

  // ── MAC tab
  const [macVariant, setMacVariant] = useState<Variant>('BLAKE2b');
  const [macMessage, setMacMessage] = useState('');
  const [macKey, setMacKey] = useState('');
  const [macKeyFmt, setMacKeyFmt] = useState<Fmt>('hex');
  const [macOutLen, setMacOutLen] = useState(32);
  const [macFmt, setMacFmt] = useState<Fmt>('hex');
  const [macResult, setMacResult] = useState('');
  const [macError, setMacError] = useState('');

  // ── Verify tab
  const [verVariant, setVerVariant] = useState<Variant>('BLAKE2b');
  const [verInput, setVerInput] = useState('');
  const [verExpected, setVerExpected] = useState('');
  const [verKeyHex, setVerKeyHex] = useState('');
  const [verOutLen, setVerOutLen] = useState(64);
  const [verFmt, setVerFmt] = useState<Fmt>('hex');
  const [verStatus, setVerStatus] = useState<'idle' | 'match' | 'mismatch'>('idle');
  const [verError, setVerError] = useState('');

  // ── File tab
  const [fileVariant, setFileVariant] = useState<Variant>('BLAKE2b');
  const [fileFmt, setFileFmt] = useState<Fmt>('hex');
  const [fileOutLen, setFileOutLen] = useState(64);
  const [fileResult, setFileResult] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileError, setFileError] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls = 'bg-[#030e18] border-[#0d2a3a] text-[#60d0f0] placeholder-[#1a4a60] font-mono text-xs focus:ring-1 focus:ring-[#1a6080] focus:border-[#1a6080]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#3a7090]';
  const maxOutLen = variant === 'BLAKE2b' ? 64 : 32;

  function runHash(bytes: Uint8Array, kBytes: Uint8Array, ol: number, v: Variant): Uint8Array {
    return v === 'BLAKE2b' ? blake2b(bytes, ol, kBytes) : blake2s(bytes, ol, kBytes);
  }

  // ── Hash ─────────────────────────────────────────────────────────────────────
  const handleHash = useCallback(() => {
    setHashError(''); setHashResult(''); setHashAll(null);
    try {
      const bytes = new TextEncoder().encode(input);
      let kBytes = new Uint8Array(0);
      if (keyHex.trim()) kBytes = fromHex(keyHex.replace(/\s/g, ''));
      const digest = runHash(bytes, kBytes, outLen, variant);
      setHashResult(encFmt(digest, fmt));

      // Compute all four common digests for reference (no key)
      const b = new TextEncoder().encode(input);
      setHashAll({
        b512: toHex(blake2b(b, 64)),
        b256: toHex(blake2b(b, 32)),
        s256: toHex(blake2s(b, 32)),
        s128: toHex(blake2s(b, 16)),
      });
    } catch (e: any) {
      setHashError(e.message || 'Hashing failed.');
    }
  }, [input, keyHex, outLen, variant, fmt]);

  // ── MAC ──────────────────────────────────────────────────────────────────────
  const handleMAC = useCallback(() => {
    setMacError(''); setMacResult('');
    if (!macKey.trim()) return setMacError('A key is required for MAC mode.');
    try {
      const msgBytes = new TextEncoder().encode(macMessage);
      const kBytes = decFmt(macKey.trim(), macKeyFmt);
      const maxKey = macVariant === 'BLAKE2b' ? 64 : 32;
      if (kBytes.length > maxKey) throw new Error(`${macVariant} key must be ≤ ${maxKey} bytes.`);
      const digest = macVariant === 'BLAKE2b' ? blake2b(msgBytes, macOutLen, kBytes) : blake2s(msgBytes, macOutLen, kBytes);
      setMacResult(encFmt(digest, macFmt));
    } catch (e: any) {
      setMacError(e.message || 'MAC computation failed.');
    }
  }, [macMessage, macKey, macKeyFmt, macOutLen, macFmt, macVariant]);

  // ── Verify ───────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(() => {
    setVerError(''); setVerStatus('idle');
    if (!verExpected.trim()) return setVerError('Expected digest is required.');
    try {
      const bytes = new TextEncoder().encode(verInput);
      let kBytes = new Uint8Array(0);
      if (verKeyHex.trim()) kBytes = fromHex(verKeyHex.replace(/\s/g, ''));
      const digest = runHash(bytes, kBytes, verOutLen, verVariant);
      const computed = encFmt(digest, verFmt);
      setVerStatus(computed.toLowerCase() === verExpected.trim().toLowerCase() ? 'match' : 'mismatch');
    } catch (e: any) {
      setVerError(e.message || 'Verification failed.');
    }
  }, [verInput, verExpected, verKeyHex, verOutLen, verVariant, verFmt]);

  // ── File hash ────────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setFileError(''); setFileResult(''); setFileName(file.name); setFileSize(file.size); setFileLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bytes = new Uint8Array(e.target!.result as ArrayBuffer);
        const digest = fileVariant === 'BLAKE2b'
          ? blake2b(bytes, fileOutLen)
          : blake2s(bytes, fileOutLen);
        setFileResult(encFmt(digest, fileFmt));
      } catch (err: any) {
        setFileError(err.message || 'File hashing failed.');
      } finally {
        setFileLoading(false);
      }
    };
    reader.onerror = () => { setFileError('Failed to read file.'); setFileLoading(false); };
    reader.readAsArrayBuffer(file);
  }, [fileVariant, fileOutLen, fileFmt]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8"
      style={{ background: 'radial-gradient(ellipse at 50% -10%, #010d18 0%, #020c14 40%, #010810 100%)', fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 45deg, #021428, #0060a0, #021428)' }}>
            <Hash size={14} className="text-[#40c0ff]" />
          </div>
          <h1 className="text-2xl font-bold text-[#40c8ff]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            BLAKE2
          </h1>
          <Badge className="bg-[#020e1a] text-[#2090c0] border border-[#0a3050] text-[10px] font-mono">
            RFC 7693
          </Badge>
          <Badge className="bg-[#020e1a] text-[#2090c0] border border-[#0a3050] text-[10px] font-mono">
            Pure JS
          </Badge>
        </div>
        <p className="text-[#1a4a60] text-[11px] font-mono ml-11">
          BLAKE2b (64-bit · 512-bit max) · BLAKE2s (32-bit · 256-bit max) · Keyed MAC · File hashing
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="hash">
          <TabsList className="bg-[#020c14] border border-[#0d2a3a] mb-6 w-full grid grid-cols-4">
            {['hash', 'mac', 'verify', 'file'].map((t) => (
              <TabsTrigger key={t} value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#1a4a60] data-[state=active]:bg-[#041828] data-[state=active]:text-[#40c0e0]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── HASH ────────────────────────────────────────────────────────── */}
          <TabsContent value="hash">
            <Card className="bg-[#020c14] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a60] font-mono">
                  Compute a BLAKE2 digest with configurable variant, output length, and encoding.
                  BLAKE2b targets 64-bit platforms; BLAKE2s targets 8–32-bit embedded systems.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Variant</Label>
                    <Toggle options={['BLAKE2b', 'BLAKE2s'] as Variant[]} value={variant} onChange={(v) => { setVariant(v as Variant); setOutLen(v === 'BLAKE2b' ? 64 : 32); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Output</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={fmt} onChange={(v) => setFmt(v)} />
                  </div>
                </div>

                {/* Output length slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#40a0c0]">{outLen} bytes ({outLen * 8} bits)</span>
                  </div>
                  <input type="range" min={1} max={variant === 'BLAKE2b' ? 64 : 32} value={outLen}
                    onChange={(e) => setOutLen(Number(e.target.value))}
                    className="w-full accent-[#2090c0]" />
                  <div className="flex justify-between text-[9px] font-mono text-[#1a4060]">
                    <span>1 byte</span>
                    <span>{variant === 'BLAKE2b' ? '64 bytes (512 bits)' : '32 bytes (256 bits)'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Input message</Label>
                  <Textarea placeholder="Enter text to hash…" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Key (hex) — optional, enables MAC mode</Label>
                  <Input placeholder={`Up to ${variant === 'BLAKE2b' ? 64 : 32} bytes as hex…`}
                    value={keyHex} onChange={(e) => setKeyHex(e.target.value)} className={inputCls} />
                </div>

                {hashError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {hashError}
                  </div>
                )}

                <Button onClick={handleHash}
                  className="w-full bg-[#041828] hover:bg-[#061e30] border border-[#1a5070] text-[#40c0e0] font-mono text-[10px] uppercase tracking-widest">
                  <Hash size={13} className="mr-2" />
                  Compute Hash
                </Button>

                {hashResult && (
                  <div className="space-y-4 pt-2 border-t border-[#0a1e2a]">
                    <HashOutput label={`${variant} — ${outLen * 8}-bit digest`} value={hashResult} bits={outLen * 8} />

                    {hashAll && !keyHex.trim() && (
                      <div className="space-y-3">
                        <div className="text-[10px] font-mono text-[#1a4a60] uppercase tracking-widest pt-1">
                          All common digests (no key)
                        </div>
                        <HashOutput label="BLAKE2b-512" value={hashAll.b512} bits={512} />
                        <HashOutput label="BLAKE2b-256" value={hashAll.b256} bits={256} />
                        <HashOutput label="BLAKE2s-256" value={hashAll.s256} bits={256} />
                        <HashOutput label="BLAKE2s-128" value={hashAll.s128} bits={128} />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── MAC ─────────────────────────────────────────────────────────── */}
          <TabsContent value="mac">
            <Card className="bg-[#020c14] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a60] font-mono">
                  BLAKE2 has built-in keyed MAC support — more efficient than HMAC-SHA2. The key is
                  incorporated into the hash state at initialization, not appended. Up to 64 bytes for
                  BLAKE2b, 32 for BLAKE2s.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Variant</Label>
                    <Toggle options={['BLAKE2b', 'BLAKE2s'] as Variant[]} value={macVariant} onChange={(v) => { setMacVariant(v); setMacOutLen(v === 'BLAKE2b' ? 32 : 16); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Key fmt</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={macKeyFmt} onChange={(v) => setMacKeyFmt(v)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Output</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={macFmt} onChange={(v) => setMacFmt(v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>MAC output length</Label>
                    <span className="text-[10px] font-mono text-[#40a0c0]">{macOutLen} bytes</span>
                  </div>
                  <input type="range" min={1} max={macVariant === 'BLAKE2b' ? 64 : 32} value={macOutLen}
                    onChange={(e) => setMacOutLen(Number(e.target.value))}
                    className="w-full accent-[#2090c0]" />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Secret Key</Label>
                  <Input placeholder={`Key as ${macKeyFmt} (≤ ${macVariant === 'BLAKE2b' ? 64 : 32} bytes)…`}
                    value={macKey} onChange={(e) => setMacKey(e.target.value)} className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Message</Label>
                  <Textarea placeholder="Message to authenticate…" value={macMessage}
                    onChange={(e) => setMacMessage(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                {macError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {macError}
                  </div>
                )}

                <Button onClick={handleMAC}
                  className="w-full bg-[#041828] hover:bg-[#061e30] border border-[#1a5070] text-[#40c0e0] font-mono text-[10px] uppercase tracking-widest">
                  Compute MAC
                </Button>

                {macResult && (
                  <div className="space-y-2 pt-2 border-t border-[#0a1e2a]">
                    <HashOutput label={`${macVariant} MAC — ${macOutLen * 8}-bit`} value={macResult} bits={macOutLen * 8} />
                    <div className="bg-[#030e18] border border-[#0a1e2a] rounded px-3 py-2 text-[10px] font-mono text-[#1a4a60]">
                      ℹ BLAKE2 keyed MAC is a PRF — it is safe to use directly as a MAC without a
                      separate construction like HMAC. Same key + message always yields the same tag.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VERIFY ──────────────────────────────────────────────────────── */}
          <TabsContent value="verify">
            <Card className="bg-[#020c14] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a60] font-mono">
                  Recompute a digest and compare it against an expected value — for verifying
                  file integrity, API response authenticity, or stored hash correctness.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Variant</Label>
                    <Toggle options={['BLAKE2b', 'BLAKE2s'] as Variant[]} value={verVariant} onChange={(v) => { setVerVariant(v); setVerOutLen(v === 'BLAKE2b' ? 64 : 32); setVerStatus('idle'); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Expected fmt</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={verFmt} onChange={(f) => { setVerFmt(f); setVerStatus('idle'); }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#40a0c0]">{verOutLen} bytes</span>
                  </div>
                  <input type="range" min={1} max={verVariant === 'BLAKE2b' ? 64 : 32} value={verOutLen}
                    onChange={(e) => { setVerOutLen(Number(e.target.value)); setVerStatus('idle'); }}
                    className="w-full accent-[#2090c0]" />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Message</Label>
                  <Textarea placeholder="Message to recompute hash for…" value={verInput}
                    onChange={(e) => { setVerInput(e.target.value); setVerStatus('idle'); }}
                    className={inputCls + ' min-h-[70px]'} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Key (hex) — optional</Label>
                  <Input placeholder="Key if MAC was used…" value={verKeyHex}
                    onChange={(e) => { setVerKeyHex(e.target.value); setVerStatus('idle'); }} className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Expected digest</Label>
                  <Input placeholder={`Paste expected ${verFmt} digest…`} value={verExpected}
                    onChange={(e) => { setVerExpected(e.target.value); setVerStatus('idle'); }} className={inputCls} />
                </div>

                {verError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {verError}
                  </div>
                )}

                <Button onClick={handleVerify}
                  className="w-full bg-[#041828] hover:bg-[#061e30] border border-[#1a5070] text-[#40c0e0] font-mono text-[10px] uppercase tracking-widest">
                  Verify Digest
                </Button>

                {verStatus !== 'idle' && (
                  <div className={`flex items-center gap-3 rounded px-4 py-3 border font-mono text-xs ${verStatus === 'match' ? 'bg-[#030e18] border-[#1a5070] text-[#40c0e0]' : 'bg-red-950/30 border-red-800/40 text-red-400'}`}>
                    <span className="text-lg">{verStatus === 'match' ? '✓' : '✗'}</span>
                    {verStatus === 'match'
                      ? 'Digest matches — data is intact and unmodified.'
                      : 'Digest mismatch — data may be corrupted or the wrong key/variant was used.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FILE ────────────────────────────────────────────────────────── */}
          <TabsContent value="file">
            <Card className="bg-[#020c14] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a60] font-mono">
                  Hash any local file entirely in-browser — nothing is uploaded. Useful for integrity
                  checking downloads, build artifacts, or large binary files.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Variant</Label>
                    <Toggle options={['BLAKE2b', 'BLAKE2s'] as Variant[]} value={fileVariant} onChange={(v) => { setFileVariant(v); setFileOutLen(v === 'BLAKE2b' ? 64 : 32); setFileResult(''); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Output</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={fileFmt} onChange={(v) => setFileFmt(v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#40a0c0]">{fileOutLen} bytes ({fileOutLen * 8} bits)</span>
                  </div>
                  <input type="range" min={1} max={fileVariant === 'BLAKE2b' ? 64 : 32} value={fileOutLen}
                    onChange={(e) => setFileOutLen(Number(e.target.value))}
                    className="w-full accent-[#2090c0]" />
                </div>

                {/* Drop zone */}
                <div
                  onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[#0d2a3a] rounded-lg p-8 text-center cursor-pointer hover:border-[#1a5070] transition-colors group"
                >
                  <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
                  <Upload size={24} className="mx-auto mb-3 text-[#1a4a60] group-hover:text-[#2a6a80] transition-colors" />
                  <p className="text-[11px] font-mono text-[#1a4a60] group-hover:text-[#2a6a80]">
                    Drop a file here or click to browse
                  </p>
                  <p className="text-[9px] font-mono text-[#0d2a3a] mt-1">Processed entirely in-browser · No upload</p>
                </div>

                {fileError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {fileError}
                  </div>
                )}

                {fileLoading && (
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#2a7090]">
                    <RefreshCw size={13} className="animate-spin" /> Hashing file…
                  </div>
                )}

                {fileResult && (
                  <div className="space-y-3 pt-2 border-t border-[#0a1e2a]">
                    <div className="bg-[#030e18] border border-[#0a1e2a] rounded px-3 py-2 text-[10px] font-mono text-[#2a6a80] flex gap-4 flex-wrap">
                      <span>File: <span className="text-[#40a0c0]">{fileName}</span></span>
                      <span>Size: <span className="text-[#40a0c0]">{fileSize.toLocaleString()} bytes</span></span>
                    </div>
                    <HashOutput
                      label={`${fileVariant}-${fileOutLen * 8} digest`}
                      value={fileResult}
                      bits={fileOutLen * 8}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 grid grid-cols-4 gap-2 text-center">
          {[
            ['BLAKE2b/s', 'Variants'],
            ['1–512 bits', 'Output range'],
            ['Built-in MAC', 'Keyed mode'],
            ['RFC 7693', 'Standard'],
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

export default Blake2Tool;