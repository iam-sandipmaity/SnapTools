import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, Hash, Upload, RefreshCw, GitBranch } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// BLAKE3 — Pure JS implementation
// Based on the BLAKE3 specification: https://github.com/BLAKE3-team/BLAKE3-specs
// ═══════════════════════════════════════════════════════════════════════════════

const IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

// Domain flags
const CHUNK_START        = 1 << 0;
const CHUNK_END          = 1 << 1;
const PARENT             = 1 << 2;
const ROOT               = 1 << 3;
const KEYED_HASH         = 1 << 4;
const DERIVE_KEY_CONTEXT = 1 << 5;
const DERIVE_KEY_MATERIAL= 1 << 6;

const BLOCK_LEN  = 64;
const CHUNK_LEN  = 1024;
const OUT_LEN    = 32;

function rotr32(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

const MSG_PERMUTATION = [2,6,3,10,7,0,4,13,1,11,12,5,9,14,15,8];

function g(state: Uint32Array, a: number, b: number, c: number, d: number, mx: number, my: number) {
  state[a] = (state[a] + state[b] + mx) >>> 0;
  state[d] = rotr32(state[d] ^ state[a], 16);
  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotr32(state[b] ^ state[c], 12);
  state[a] = (state[a] + state[b] + my) >>> 0;
  state[d] = rotr32(state[d] ^ state[a], 8);
  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotr32(state[b] ^ state[c], 7);
}

function round(state: Uint32Array, m: Uint32Array) {
  // Columns
  g(state, 0, 4, 8,  12, m[0],  m[1]);
  g(state, 1, 5, 9,  13, m[2],  m[3]);
  g(state, 2, 6, 10, 14, m[4],  m[5]);
  g(state, 3, 7, 11, 15, m[6],  m[7]);
  // Diagonals
  g(state, 0, 5, 10, 15, m[8],  m[9]);
  g(state, 1, 6, 11, 12, m[10], m[11]);
  g(state, 2, 7, 8,  13, m[12], m[13]);
  g(state, 3, 4, 9,  14, m[14], m[15]);
}

function permute(m: Uint32Array): Uint32Array {
  const out = new Uint32Array(16);
  for (let i = 0; i < 16; i++) out[i] = m[MSG_PERMUTATION[i]];
  return out;
}

function compress(
  chainingValue: Uint32Array,
  blockWords: Uint32Array,
  counter: number,
  blockLen: number,
  flags: number,
): Uint32Array {
  const state = new Uint32Array([
    chainingValue[0], chainingValue[1], chainingValue[2], chainingValue[3],
    chainingValue[4], chainingValue[5], chainingValue[6], chainingValue[7],
    IV[0], IV[1], IV[2], IV[3],
    counter & 0xffffffff, Math.floor(counter / 0x100000000) & 0xffffffff,
    blockLen, flags,
  ]);

  let m = new Uint32Array(blockWords);
  for (let i = 0; i < 7; i++) {
    round(state, m);
    m = permute(m);
  }

  for (let i = 0; i < 8; i++) {
    state[i]     = (state[i]     ^ state[i + 8]) >>> 0;
    state[i + 8] = (state[i + 8] ^ chainingValue[i]) >>> 0;
  }
  return state;
}

function wordsFromLEBytes(bytes: Uint8Array): Uint32Array {
  const words = new Uint32Array(Math.ceil(bytes.length / 4));
  for (let i = 0; i < bytes.length; i++) {
    words[i >> 2] |= bytes[i] << ((i & 3) * 8);
  }
  return words;
}

// Output reader — for XOF (arbitrary output length)
function outputReader(
  inputChainingValue: Uint32Array,
  blockWords: Uint32Array,
  counter: number,
  blockLen: number,
  flags: number,
) {
  return function read(outLen: number): Uint8Array {
    const output = new Uint8Array(outLen);
    let pos = 0;
    let ctr = counter;
    while (pos < outLen) {
      const cv = compress(inputChainingValue, blockWords, ctr, blockLen, flags);
      ctr++;
      const words = cv.subarray(0, 8);
      const bytes = new Uint8Array(words.buffer);
      const take = Math.min(OUT_LEN, outLen - pos);
      output.set(bytes.subarray(0, take), pos);
      pos += take;
    }
    return output;
  };
}

class ChunkState {
  chainingValue: Uint32Array;
  chunkCounter: number;
  block = new Uint8Array(BLOCK_LEN);
  blockLen = 0;
  blocksCompressed = 0;
  flags: number;

  constructor(key: Uint32Array, chunkCounter: number, flags: number) {
    this.chainingValue = new Uint32Array(key);
    this.chunkCounter = chunkCounter;
    this.flags = flags;
  }

  len(): number {
    return BLOCK_LEN * this.blocksCompressed + this.blockLen;
  }

  startFlag(): number {
    return this.blocksCompressed === 0 ? CHUNK_START : 0;
  }

  update(inputBytes: Uint8Array) {
    let pos = 0;
    while (pos < inputBytes.length) {
      if (this.blockLen === BLOCK_LEN) {
        const blockWords = wordsFromLEBytes(this.block);
        this.chainingValue = compress(
          this.chainingValue, blockWords, this.chunkCounter,
          BLOCK_LEN, this.flags | this.startFlag()
        ).subarray(0, 8);
        this.blocksCompressed++;
        this.block = new Uint8Array(BLOCK_LEN);
        this.blockLen = 0;
      }
      const want = BLOCK_LEN - this.blockLen;
      const take = Math.min(want, inputBytes.length - pos);
      this.block.set(inputBytes.subarray(pos, pos + take), this.blockLen);
      this.blockLen += take;
      pos += take;
    }
  }

  output(): ReturnType<typeof outputReader> {
    const blockWords = wordsFromLEBytes(this.block);
    const flags = this.flags | this.startFlag() | CHUNK_END;
    return outputReader(this.chainingValue, blockWords, this.chunkCounter, this.blockLen, flags);
  }
}

function parentOutput(
  leftCV: Uint32Array,
  rightCV: Uint32Array,
  key: Uint32Array,
  flags: number,
): ReturnType<typeof outputReader> {
  const blockWords = new Uint32Array(16);
  blockWords.set(leftCV, 0);
  blockWords.set(rightCV, 8);
  return outputReader(key, blockWords, 0, BLOCK_LEN, PARENT | flags);
}

function parentCV(leftCV: Uint32Array, rightCV: Uint32Array, key: Uint32Array, flags: number): Uint32Array {
  return new Uint32Array(parentOutput(leftCV, rightCV, key, flags)(OUT_LEN).buffer);
}

class Hasher {
  key: Uint32Array;
  flags: number;
  chunkState: ChunkState;
  cvStack: Uint32Array[] = [];

  constructor(key: Uint32Array, flags: number) {
    this.key = new Uint32Array(key);
    this.flags = flags;
    this.chunkState = new ChunkState(key, 0, flags);
  }

  addChunkCV(newCV: Uint32Array, totalChunks: number) {
    let cv = new Uint32Array(newCV);
    while ((totalChunks & 1) === 0) {
      cv = parentCV(this.cvStack.pop()!, cv, this.key, this.flags);
      totalChunks >>= 1;
    }
    this.cvStack.push(cv);
  }

  update(inputBytes: Uint8Array) {
    let pos = 0;
    while (pos < inputBytes.length) {
      if (this.chunkState.len() === CHUNK_LEN) {
        const chunkCV = new Uint32Array(this.chunkState.output()(OUT_LEN).buffer);
        const totalChunks = this.chunkState.chunkCounter + 1;
        this.addChunkCV(chunkCV, totalChunks);
        this.chunkState = new ChunkState(this.key, totalChunks, this.flags);
      }
      const want = CHUNK_LEN - this.chunkState.len();
      const take = Math.min(want, inputBytes.length - pos);
      this.chunkState.update(inputBytes.subarray(pos, pos + take));
      pos += take;
    }
    return this;
  }

  finalize(outLen: number): Uint8Array {
    let output = this.chunkState.output();
    let parentNodesRemaining = this.cvStack.length;
    while (parentNodesRemaining > 0) {
      parentNodesRemaining--;
      output = parentOutput(
        this.cvStack[parentNodesRemaining],
        new Uint32Array(output(OUT_LEN).buffer),
        this.key,
        this.flags,
      );
    }
    // Set ROOT flag on final output
    const lastOutput = this.chunkState.output();
    // Re-run with ROOT flag
    const blockWords = wordsFromLEBytes(this.chunkState.block);
    const flags = this.flags | this.chunkState.startFlag() | CHUNK_END | ROOT;

    // Rebuild with proper root output
    let rootOutput = outputReader(
      this.chunkState.chainingValue,
      blockWords,
      this.chunkState.chunkCounter,
      this.chunkState.blockLen,
      flags,
    );

    if (this.cvStack.length > 0) {
      // Need to merge the stack
      let cv = new Uint32Array(lastOutput(OUT_LEN).buffer);
      for (let i = this.cvStack.length - 1; i >= 0; i--) {
        cv = parentCV(this.cvStack[i], cv, this.key, this.flags);
      }
      // Final parent with ROOT
      const blockW = new Uint32Array(16);
      blockW.set(this.cvStack[0], 0);
      // redo properly
      const stackCopy = [...this.cvStack];
      let innerCV = new Uint32Array(lastOutput(OUT_LEN).buffer);
      for (let i = stackCopy.length - 1; i > 0; i--) {
        innerCV = parentCV(stackCopy[i], innerCV, this.key, this.flags);
      }
      // Last merge is root
      const bw = new Uint32Array(16);
      bw.set(stackCopy[0], 0);
      bw.set(innerCV, 8);
      rootOutput = outputReader(this.key, bw, 0, BLOCK_LEN, PARENT | ROOT | this.flags);
    }

    return rootOutput(outLen);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

function blake3Hash(input: Uint8Array, outLen = 32): Uint8Array {
  return new Hasher(new Uint32Array(IV), 0).update(input).finalize(outLen);
}

function blake3Keyed(input: Uint8Array, key: Uint8Array, outLen = 32): Uint8Array {
  if (key.length !== 32) throw new Error('BLAKE3 keyed hash requires exactly 32 bytes key');
  const keyWords = wordsFromLEBytes(key).subarray(0, 8);
  const k = new Uint32Array(8);
  for (let i = 0; i < 8; i++) k[i] = keyWords[i];
  return new Hasher(k, KEYED_HASH).update(input).finalize(outLen);
}

function blake3DeriveKey(context: string, keyMaterial: Uint8Array, outLen = 32): Uint8Array {
  const contextBytes = new TextEncoder().encode(context);
  const contextKey = new Hasher(new Uint32Array(IV), DERIVE_KEY_CONTEXT).update(contextBytes).finalize(32);
  const contextKeyWords = wordsFromLEBytes(contextKey).subarray(0, 8);
  const k = new Uint32Array(8);
  for (let i = 0; i < 8; i++) k[i] = contextKeyWords[i];
  return new Hasher(k, DERIVE_KEY_MATERIAL).update(keyMaterial).finalize(outLen);
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
  if (c.length % 2 !== 0) throw new Error('Invalid hex string');
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
      className="p-1.5 rounded hover:bg-white/5 text-[#b06030] transition-colors" title="Copy">
      {ok ? <Check size={13} className="text-[#ff8040]" /> : <Copy size={13} />}
    </button>
  );
}

function HashOutput({ label, value, bits, sub }: { label: string; value: string; bits: number; sub?: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#7a4020]">{label}</span>
          <span className="text-[9px] font-mono bg-[#180a00] border border-[#3a1800] rounded px-1.5 py-0.5 text-[#c06030]">{bits} bits</span>
          {sub && <span className="text-[9px] font-mono text-[#4a2a10]">{sub}</span>}
        </div>
        <CopyBtn text={value} />
      </div>
      <div className="font-mono text-xs bg-[#100600] border border-[#2a1400] rounded px-3 py-2 break-all select-all text-[#ff9050]">
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
          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${value === o ? 'bg-[#1e0c00] border-[#7a3010] text-[#ff7030]' : 'bg-transparent border-[#2a1400] text-[#5a2a10] hover:border-[#4a2010]'}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
const Blake3Tool: React.FC = () => {
  // ── Hash tab
  const [input, setInput]     = useState('');
  const [outLen, setOutLen]   = useState(32);
  const [fmt, setFmt]         = useState<Fmt>('hex');
  const [hashResult, setHashResult] = useState('');
  const [hashError, setHashError]   = useState('');

  // ── Keyed tab
  const [keyedMsg, setKeyedMsg]   = useState('');
  const [keyedKey, setKeyedKey]   = useState('');
  const [keyedKeyFmt, setKeyedKeyFmt] = useState<Fmt>('hex');
  const [keyedOutLen, setKeyedOutLen] = useState(32);
  const [keyedFmt, setKeyedFmt]   = useState<Fmt>('hex');
  const [keyedResult, setKeyedResult] = useState('');
  const [keyedError, setKeyedError]   = useState('');

  // ── KDF tab
  const [kdfContext, setKdfContext]   = useState('');
  const [kdfMaterial, setKdfMaterial] = useState('');
  const [kdfMatFmt, setKdfMatFmt]     = useState<Fmt>('hex');
  const [kdfOutLen, setKdfOutLen]     = useState(32);
  const [kdfFmt, setKdfFmt]           = useState<Fmt>('hex');
  const [kdfResult, setKdfResult]     = useState('');
  const [kdfError, setKdfError]       = useState('');

  // ── XOF tab — extended output
  const [xofInput, setXofInput]   = useState('');
  const [xofOutLen, setXofOutLen] = useState(128);
  const [xofFmt, setXofFmt]       = useState<Fmt>('hex');
  const [xofResult, setXofResult] = useState('');
  const [xofError, setXofError]   = useState('');

  // ── File tab
  const [fileFmt, setFileFmt]         = useState<Fmt>('hex');
  const [fileOutLen, setFileOutLen]   = useState(32);
  const [fileResult, setFileResult]   = useState('');
  const [fileName, setFileName]       = useState('');
  const [fileSize, setFileSize]       = useState(0);
  const [fileError, setFileError]     = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls = 'bg-[#100600] border-[#2a1400] text-[#ff9050] placeholder-[#3a1800] font-mono text-xs focus:ring-1 focus:ring-[#7a3010] focus:border-[#7a3010]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#7a4020]';

  // ── Hash ─────────────────────────────────────────────────────────────────────
  const handleHash = useCallback(() => {
    setHashError(''); setHashResult('');
    try {
      const bytes = new TextEncoder().encode(input);
      const digest = blake3Hash(bytes, outLen);
      setHashResult(encFmt(digest, fmt));
    } catch (e: any) { setHashError(e.message || 'Hashing failed.'); }
  }, [input, outLen, fmt]);

  // ── Keyed ────────────────────────────────────────────────────────────────────
  const handleKeyed = useCallback(() => {
    setKeyedError(''); setKeyedResult('');
    if (!keyedKey.trim()) return setKeyedError('A 32-byte key is required.');
    try {
      const msgBytes = new TextEncoder().encode(keyedMsg);
      const keyBytes = decFmt(keyedKey.trim(), keyedKeyFmt);
      if (keyBytes.length !== 32) throw new Error('Key must be exactly 32 bytes.');
      const digest = blake3Keyed(msgBytes, keyBytes, keyedOutLen);
      setKeyedResult(encFmt(digest, keyedFmt));
    } catch (e: any) { setKeyedError(e.message || 'Keyed hash failed.'); }
  }, [keyedMsg, keyedKey, keyedKeyFmt, keyedOutLen, keyedFmt]);

  // ── KDF ──────────────────────────────────────────────────────────────────────
  const handleKDF = useCallback(() => {
    setKdfError(''); setKdfResult('');
    if (!kdfContext.trim()) return setKdfError('A context string is required.');
    if (!kdfMaterial.trim()) return setKdfError('Key material is required.');
    try {
      const matBytes = decFmt(kdfMaterial.trim(), kdfMatFmt);
      const derived = blake3DeriveKey(kdfContext.trim(), matBytes, kdfOutLen);
      setKdfResult(encFmt(derived, kdfFmt));
    } catch (e: any) { setKdfError(e.message || 'Key derivation failed.'); }
  }, [kdfContext, kdfMaterial, kdfMatFmt, kdfOutLen, kdfFmt]);

  // ── XOF ──────────────────────────────────────────────────────────────────────
  const handleXOF = useCallback(() => {
    setXofError(''); setXofResult('');
    try {
      if (xofOutLen < 1 || xofOutLen > 4096) throw new Error('Output length must be 1–4096 bytes.');
      const bytes = new TextEncoder().encode(xofInput);
      const digest = blake3Hash(bytes, xofOutLen);
      setXofResult(encFmt(digest, xofFmt));
    } catch (e: any) { setXofError(e.message || 'XOF failed.'); }
  }, [xofInput, xofOutLen, xofFmt]);

  // ── File ─────────────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setFileError(''); setFileResult(''); setFileName(file.name); setFileSize(file.size); setFileLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bytes = new Uint8Array(e.target!.result as ArrayBuffer);
        const digest = blake3Hash(bytes, fileOutLen);
        setFileResult(encFmt(digest, fileFmt));
      } catch (err: any) { setFileError(err.message || 'File hashing failed.'); }
      finally { setFileLoading(false); }
    };
    reader.onerror = () => { setFileError('Failed to read file.'); setFileLoading(false); };
    reader.readAsArrayBuffer(file);
  }, [fileOutLen, fileFmt]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };

  return (
    <div className="min-h-screen w-full p-4 md:p-8"
      style={{ background: 'radial-gradient(ellipse at 40% 0%, #100400 0%, #0c0300 50%, #080200 100%)', fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 135deg, #2a0800, #c04010, #2a0800)' }}>
            <Hash size={14} className="text-[#ff7040]" />
          </div>
          <h1 className="text-2xl font-bold text-[#ff6830]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            BLAKE3
          </h1>
          <Badge className="bg-[#180600] text-[#c04020] border border-[#3a1800] text-[10px] font-mono">
            2020 Spec
          </Badge>
          <Badge className="bg-[#180600] text-[#c04020] border border-[#3a1800] text-[10px] font-mono">
            Pure JS · XOF
          </Badge>
        </div>
        <p className="text-[#4a2010] text-[11px] font-mono ml-11">
          Hash · Keyed MAC · Key Derivation · Extendable Output · File hashing — all from one function
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="hash">
          <TabsList className="bg-[#0c0300] border border-[#2a1400] mb-6 w-full grid grid-cols-5">
            {['hash', 'keyed', 'kdf', 'xof', 'file'].map((t) => (
              <TabsTrigger key={t} value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#4a2010] data-[state=active]:bg-[#180800] data-[state=active]:text-[#ff6830]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── HASH ──────────────────────────────────────────────────────── */}
          <TabsContent value="hash">
            <Card className="bg-[#0c0300] border-[#2a1400] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a2010] font-mono">
                  Standard BLAKE3 hash. Faster than MD5 on modern hardware, with 128-bit security.
                  Supports variable output length natively via its XOF (extendable output) design.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Encoding</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={fmt} onChange={(v) => setFmt(v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#e06030]">{outLen} bytes ({outLen * 8} bits)</span>
                  </div>
                  <input type="range" min={1} max={64} value={outLen}
                    onChange={(e) => setOutLen(Number(e.target.value))}
                    className="w-full accent-[#c04010]" />
                  <div className="flex justify-between text-[9px] font-mono text-[#3a1800]">
                    <span>1 byte</span><span>32 bytes (default)</span><span>64 bytes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Input</Label>
                  <Textarea placeholder="Enter text to hash…" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={inputCls + ' min-h-[90px]'} />
                </div>

                {hashError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {hashError}
                  </div>
                )}

                <Button onClick={handleHash}
                  className="w-full bg-[#180800] hover:bg-[#220c00] border border-[#5a2010] text-[#ff6830] font-mono text-[10px] uppercase tracking-widest">
                  <Hash size={13} className="mr-2" /> Compute BLAKE3 Hash
                </Button>

                {hashResult && (
                  <div className="space-y-3 pt-2 border-t border-[#1a0800]">
                    <HashOutput label={`BLAKE3-${outLen * 8}`} value={hashResult} bits={outLen * 8} />
                    <div className="bg-[#080200] border border-[#1a0800] rounded px-3 py-2 text-[10px] font-mono text-[#3a1800]">
                      ℹ BLAKE3 is a single algorithm — hash, MAC, KDF, and XOF are all modes of the
                      same construction. It is parallelisable via a Merkle tree and is typically
                      3–6× faster than SHA-256 and faster than SHA-512, MD5, and BLAKE2.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── KEYED ─────────────────────────────────────────────────────── */}
          <TabsContent value="keyed">
            <Card className="bg-[#0c0300] border-[#2a1400] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a2010] font-mono">
                  BLAKE3 keyed hash mode — PRF and MAC. Requires exactly 32 bytes (256 bits) key.
                  More efficient than HMAC: the key is mixed into the initial state, not prepended.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Key format</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={keyedKeyFmt} onChange={(v) => setKeyedKeyFmt(v)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Output</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={keyedFmt} onChange={(v) => setKeyedFmt(v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#e06030]">{keyedOutLen} bytes</span>
                  </div>
                  <input type="range" min={1} max={64} value={keyedOutLen}
                    onChange={(e) => setKeyedOutLen(Number(e.target.value))}
                    className="w-full accent-[#c04010]" />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Key (exactly 32 bytes)</Label>
                  <Input placeholder={`32-byte key as ${keyedKeyFmt}…`} value={keyedKey}
                    onChange={(e) => setKeyedKey(e.target.value)} className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Message</Label>
                  <Textarea placeholder="Message to authenticate…" value={keyedMsg}
                    onChange={(e) => setKeyedMsg(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                {keyedError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {keyedError}
                  </div>
                )}

                <Button onClick={handleKeyed}
                  className="w-full bg-[#180800] hover:bg-[#220c00] border border-[#5a2010] text-[#ff6830] font-mono text-[10px] uppercase tracking-widest">
                  Compute Keyed Hash
                </Button>

                {keyedResult && (
                  <HashOutput label={`BLAKE3 Keyed MAC — ${keyedOutLen * 8}-bit`} value={keyedResult} bits={keyedOutLen * 8} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── KDF ───────────────────────────────────────────────────────── */}
          <TabsContent value="kdf">
            <Card className="bg-[#0c0300] border-[#2a1400] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a2010] font-mono">
                  BLAKE3 key derivation mode. A human-readable context string domain-separates
                  different keys from the same material. Context should be globally unique and
                  describe the exact purpose (e.g. <span className="text-[#a04020]">"myapp 2024-01-01 session key"</span>).
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Material format</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={kdfMatFmt} onChange={(v) => setKdfMatFmt(v)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Output</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={kdfFmt} onChange={(v) => setKdfFmt(v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#e06030]">{kdfOutLen} bytes</span>
                  </div>
                  <input type="range" min={1} max={64} value={kdfOutLen}
                    onChange={(e) => setKdfOutLen(Number(e.target.value))}
                    className="w-full accent-[#c04010]" />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Context string (plain text, globally unique)</Label>
                  <Input placeholder='e.g. "myapp 2024-01-01 encryption subkey"' value={kdfContext}
                    onChange={(e) => setKdfContext(e.target.value)} className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Key material ({kdfMatFmt})</Label>
                  <Input placeholder={`Input key material as ${kdfMatFmt}…`} value={kdfMaterial}
                    onChange={(e) => setKdfMaterial(e.target.value)} className={inputCls} />
                </div>

                {kdfError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {kdfError}
                  </div>
                )}

                <Button onClick={handleKDF}
                  className="w-full bg-[#180800] hover:bg-[#220c00] border border-[#5a2010] text-[#ff6830] font-mono text-[10px] uppercase tracking-widest">
                  <GitBranch size={13} className="mr-2" /> Derive Key
                </Button>

                {kdfResult && (
                  <div className="space-y-2 pt-2 border-t border-[#1a0800]">
                    <HashOutput label={`Derived Key — ${kdfOutLen * 8}-bit`} value={kdfResult} bits={kdfOutLen * 8} />
                    <div className="bg-[#080200] border border-[#1a0800] rounded px-3 py-2 text-[10px] font-mono text-[#3a1800]">
                      ℹ Different context strings always produce completely different keys from the
                      same material. This provides domain separation without any additional salt or
                      nonce — the context is hashed first to produce the key-derivation key.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── XOF ───────────────────────────────────────────────────────── */}
          <TabsContent value="xof">
            <Card className="bg-[#0c0300] border-[#2a1400] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a2010] font-mono">
                  Extended Output Function — generate an arbitrarily long pseudorandom byte stream
                  from any input. Unlike SHA-3/SHAKE, BLAKE3 XOF truncates a single output stream
                  deterministically: the first 32 bytes are always identical to the standard hash.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Encoding</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={xofFmt} onChange={(v) => setXofFmt(v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#e06030]">{xofOutLen} bytes ({xofOutLen * 8} bits)</span>
                  </div>
                  <input type="range" min={32} max={512} step={8} value={xofOutLen}
                    onChange={(e) => setXofOutLen(Number(e.target.value))}
                    className="w-full accent-[#c04010]" />
                  <div className="flex justify-between text-[9px] font-mono text-[#3a1800]">
                    <span>32 bytes</span><span>128 bytes</span><span>256 bytes</span><span>512 bytes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Input</Label>
                  <Textarea placeholder="Input to expand…" value={xofInput}
                    onChange={(e) => setXofInput(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                {xofError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {xofError}
                  </div>
                )}

                <Button onClick={handleXOF}
                  className="w-full bg-[#180800] hover:bg-[#220c00] border border-[#5a2010] text-[#ff6830] font-mono text-[10px] uppercase tracking-widest">
                  Generate Extended Output
                </Button>

                {xofResult && (
                  <div className="space-y-2 pt-2 border-t border-[#1a0800]">
                    <HashOutput label={`XOF output — ${xofOutLen * 8} bits`} value={xofResult} bits={xofOutLen * 8}
                      sub={`first 64 hex chars = standard 32-byte hash`} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FILE ──────────────────────────────────────────────────────── */}
          <TabsContent value="file">
            <Card className="bg-[#0c0300] border-[#2a1400] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a2010] font-mono">
                  Hash any local file entirely in-browser — nothing is uploaded. BLAKE3's Merkle-tree
                  structure makes it ideal for large file integrity verification.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Encoding</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={fileFmt} onChange={(v) => setFileFmt(v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>Output length</Label>
                    <span className="text-[10px] font-mono text-[#e06030]">{fileOutLen} bytes ({fileOutLen * 8} bits)</span>
                  </div>
                  <input type="range" min={1} max={64} value={fileOutLen}
                    onChange={(e) => setFileOutLen(Number(e.target.value))}
                    className="w-full accent-[#c04010]" />
                </div>

                <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[#2a1400] rounded-lg p-8 text-center cursor-pointer hover:border-[#5a2010] transition-colors group">
                  <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
                  <Upload size={24} className="mx-auto mb-3 text-[#3a1800] group-hover:text-[#6a2810] transition-colors" />
                  <p className="text-[11px] font-mono text-[#3a1800] group-hover:text-[#6a2810]">
                    Drop a file here or click to browse
                  </p>
                  <p className="text-[9px] font-mono text-[#1a0800] mt-1">Processed entirely in-browser · No upload</p>
                </div>

                {fileError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {fileError}
                  </div>
                )}

                {fileLoading && (
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#7a3010]">
                    <RefreshCw size={13} className="animate-spin" /> Hashing file…
                  </div>
                )}

                {fileResult && (
                  <div className="space-y-3 pt-2 border-t border-[#1a0800]">
                    <div className="bg-[#080200] border border-[#1a0800] rounded px-3 py-2 text-[10px] font-mono text-[#5a2a10] flex gap-4 flex-wrap">
                      <span>File: <span className="text-[#e06030]">{fileName}</span></span>
                      <span>Size: <span className="text-[#e06030]">{fileSize.toLocaleString()} bytes</span></span>
                    </div>
                    <HashOutput label={`BLAKE3-${fileOutLen * 8} digest`} value={fileResult} bits={fileOutLen * 8} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 grid grid-cols-5 gap-2 text-center">
          {[
            ['BLAKE3', 'Algorithm'],
            ['XOF', 'Output mode'],
            ['Built-in MAC', 'Keyed mode'],
            ['Built-in KDF', 'Key derive'],
            ['Merkle tree', 'Structure'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#0c0300] border border-[#180800] rounded p-3">
              <div className="text-[#c04010] font-mono text-[10px] font-bold">{val}</div>
              <div className="text-[#2a1000] font-mono text-[9px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blake3Tool;