import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, Hash, RefreshCw, GitCompare } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// MDC2 — ISO/IEC 10118-2
// MDC2 uses DES as the underlying block cipher to produce a 128-bit hash.
// We implement DES from scratch, then MDC2 on top.
// ═══════════════════════════════════════════════════════════════════════════════

// DES constants
const IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
const IP_INV = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
const E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];
const SBOXES = [
  [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
  [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
  [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
  [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
  [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
  [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
  [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
  [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11],
];

function getBit(bytes, n) {
  const i = n - 1;
  return (bytes[Math.floor(i / 8)] >> (7 - (i % 8))) & 1;
}
function setBit(bytes, n, val) {
  const i = n - 1;
  if (val) bytes[Math.floor(i / 8)] |= (1 << (7 - (i % 8)));
  else bytes[Math.floor(i / 8)] &= ~(1 << (7 - (i % 8)));
}
function permute(input, table) {
  const out = new Uint8Array(Math.ceil(table.length / 8));
  for (let i = 0; i < table.length; i++) setBit(out, i + 1, getBit(input, table[i]));
  return out;
}

function desKeySchedule(key8) {
  const cd = permute(key8, PC1); // 7 bytes = 56 bits
  // split into 28-bit halves
  let C = new Uint8Array(4), D = new Uint8Array(4);
  for (let i = 0; i < 28; i++) setBit(C, i + 1, getBit(cd, i + 1));
  for (let i = 0; i < 28; i++) setBit(D, i + 1, getBit(cd, i + 29));

  const rotateLeft28 = (half, n) => {
    const bits = [];
    for (let i = 1; i <= 28; i++) bits.push(getBit(half, i));
    const rotated = [...bits.slice(n), ...bits.slice(0, n)];
    const out = new Uint8Array(4);
    rotated.forEach((b, i) => setBit(out, i + 1, b));
    return out;
  };

  const subkeys = [];
  for (let round = 0; round < 16; round++) {
    C = rotateLeft28(C, SHIFTS[round]);
    D = rotateLeft28(D, SHIFTS[round]);
    const cd56 = new Uint8Array(7);
    for (let i = 0; i < 28; i++) setBit(cd56, i + 1, getBit(C, i + 1));
    for (let i = 0; i < 28; i++) setBit(cd56, i + 29, getBit(D, i + 1));
    subkeys.push(permute(cd56, PC2)); // 6 bytes = 48 bits
  }
  return subkeys;
}

function desF(R, subkey) {
  // E expansion: 32 → 48 bits
  const ER = permute(R, E); // 6 bytes
  // XOR with subkey
  const xored = new Uint8Array(6);
  for (let i = 0; i < 6; i++) xored[i] = ER[i] ^ subkey[i];

  // S-boxes: 48 → 32 bits
  const sOut = new Uint8Array(4);
  for (let s = 0; s < 8; s++) {
    const bitOff = s * 6 + 1;
    const b1 = getBit(xored, bitOff);
    const b6 = getBit(xored, bitOff + 5);
    const row = (b1 << 1) | b6;
    let col = 0;
    for (let c = 0; c < 4; c++) col = (col << 1) | getBit(xored, bitOff + 1 + c);
    const val = SBOXES[s][row * 16 + col];
    for (let b = 0; b < 4; b++) setBit(sOut, s * 4 + b + 1, (val >> (3 - b)) & 1);
  }
  return permute(sOut, P);
}

function desBlock(block8, key8, encrypt = true) {
  const subkeys = desKeySchedule(key8);
  if (!encrypt) subkeys.reverse();

  const ip = permute(block8, IP);
  let L = ip.slice(0, 4), R = ip.slice(4, 8);

  for (let round = 0; round < 16; round++) {
    const f = desF(R, subkeys[round]);
    const newR = new Uint8Array(4);
    for (let i = 0; i < 4; i++) newR[i] = L[i] ^ f[i];
    L = R;
    R = newR;
  }

  const combined = new Uint8Array(8);
  combined.set(R); combined.set(L, 4);
  return permute(combined, IP_INV);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MDC2 — ISO/IEC 10118-2
// Two independent DES chains produce a 128-bit hash
// ═══════════════════════════════════════════════════════════════════════════════

function mdc2(msgBytes) {
  // Initial values: two 64-bit hash states
  let V1 = new Uint8Array([0x52,0x52,0x52,0x52,0x52,0x52,0x52,0x52]); // 0x52 = 'R'
  let V2 = new Uint8Array([0x25,0x25,0x25,0x25,0x25,0x25,0x25,0x25]); // 0x25

  // Pad: append 0x80, then zeros, to make length ≡ 0 (mod 8) — MDC2 uses 64-bit blocks
  const padded = [];
  for (let b of msgBytes) padded.push(b);
  // ISO/IEC 10118-2 padding: single 1-bit then zeros to fill block
  padded.push(0x80);
  while (padded.length % 8 !== 0) padded.push(0x00);

  for (let i = 0; i < padded.length; i += 8) {
    const M = new Uint8Array(padded.slice(i, i + 8));

    // Key for DES1: M with specific bit pattern applied to V1
    const K1 = new Uint8Array(8);
    for (let j = 0; j < 8; j++) K1[j] = V1[j];
    // Set bit 1 of each byte (parity) and modify MSBs per spec
    K1[0] = (K1[0] & 0x9f) | 0x40; // set bit pattern on first byte

    const K2 = new Uint8Array(8);
    for (let j = 0; j < 8; j++) K2[j] = V2[j];
    K2[0] = (K2[0] & 0x9f) | 0x20;

    // Encrypt M with K1 and K2
    const W1 = desBlock(M, K1, true);
    const W2 = desBlock(M, K2, true);

    // XOR with message block
    const newV1 = new Uint8Array(8);
    const newV2 = new Uint8Array(8);
    for (let j = 0; j < 8; j++) {
      newV1[j] = W1[j] ^ M[j];
      newV2[j] = W2[j] ^ M[j];
    }

    // Cross-swap middle bytes to create interdependency
    const tmp1 = new Uint8Array(newV1);
    const tmp2 = new Uint8Array(newV2);
    // V1 gets left half of tmp1 + left half of tmp2
    for (let j = 0; j < 4; j++) V1[j] = tmp1[j];
    for (let j = 4; j < 8; j++) V1[j] = tmp2[j];
    // V2 gets right half of tmp1 + right half of tmp2
    for (let j = 0; j < 4; j++) V2[j] = tmp2[j];
    for (let j = 4; j < 8; j++) V2[j] = tmp1[j];
  }

  // Concatenate V1 and V2 for 128-bit digest
  const digest = new Uint8Array(16);
  digest.set(V1, 0);
  digest.set(V2, 8);
  return digest;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════════════

function toHex(b) {
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

function toHexSpaced(b) {
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join(' ');
}

function hexEqual(a, b) {
  return toHex(a) === toHex(b);
}

function strToBytes(s) {
  return new TextEncoder().encode(s);
}

function hexToBytes(hex) {
  const h = hex.replace(/\s/g, '');
  if (h.length % 2 !== 0) throw new Error('Odd hex length');
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600); }}
      className="p-1.5 rounded hover:bg-white/5 transition-colors"
      style={{ color: ok ? '#f0a030' : '#8a6030' }}
      title="Copy"
    >
      {ok ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function HashDisplay({ label, value, showSpaced = false }) {
  if (!value) return null;
  const display = showSpaced ? toHexSpaced(value) : toHex(value);
  const halfA = toHex(value.slice(0, 8));
  const halfB = toHex(value.slice(8, 16));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '10px', letterSpacing: '0.15em', color: '#8a6030' }} className="uppercase">{label}</span>
        <CopyBtn text={toHex(value)} />
      </div>
      <div style={{
        background: '#0e0800',
        border: '1px solid #3a2010',
        borderRadius: '4px',
        padding: '10px 12px',
        fontFamily: "'Courier New', monospace",
        fontSize: '12px',
        color: '#f0a030',
        letterSpacing: '0.05em',
        wordBreak: 'break-all',
      }}>
        <span style={{ color: '#f0c060' }}>{halfA}</span>
        <span style={{ color: '#6a4020', margin: '0 4px' }}>·</span>
        <span style={{ color: '#d08020' }}>{halfB}</span>
      </div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', color: '#4a3010', display: 'flex', gap: '8px' }}>
        <span>V1 (DES₁ chain) ──── {halfA}</span>
        <span style={{ color: '#3a2a10' }}>│</span>
        <span>V2 (DES₂ chain) ──── {halfB}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

const MDC2Tool = () => {
  const inputStyle = {
    background: '#0e0800',
    border: '1px solid #3a2010',
    color: '#f0a030',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
  };
  const labelStyle = {
    fontFamily: "'Courier New', monospace",
    fontSize: '10px',
    letterSpacing: '0.15em',
    color: '#8a6030',
    textTransform: 'uppercase',
  };
  const cardStyle = {
    background: '#080500',
    border: '1px solid #2a1a08',
    boxShadow: '0 0 40px rgba(180,80,0,0.04)',
  };

  // ── Hash tab
  const [hashInput, setHashInput] = useState('');
  const [hashMode, setHashMode] = useState('text'); // 'text' | 'hex'
  const [hashResult, setHashResult] = useState(null);
  const [hashError, setHashError] = useState('');

  // ── Verify tab
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyMode, setVerifyMode] = useState('text');
  const [verifyExpected, setVerifyExpected] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); // true | false | null
  const [verifyError, setVerifyError] = useState('');

  // ── HMAC-like tab
  const [hmacInput, setHmacInput] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [hmacResult, setHmacResult] = useState(null);
  const [hmacError, setHmacError] = useState('');

  // ── Hash ────────────────────────────────────────────────────────────────────
  const handleHash = useCallback(() => {
    setHashError(''); setHashResult(null);
    if (!hashInput.trim()) return setHashError('Input is required.');
    try {
      let bytes;
      if (hashMode === 'hex') bytes = hexToBytes(hashInput);
      else bytes = strToBytes(hashInput);
      const digest = mdc2(bytes);
      setHashResult(digest);
    } catch (e) {
      setHashError(e.message || 'Hashing failed.');
    }
  }, [hashInput, hashMode]);

  // ── Verify ──────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(() => {
    setVerifyError(''); setVerifyResult(null);
    if (!verifyInput.trim()) return setVerifyError('Input is required.');
    if (!verifyExpected.trim()) return setVerifyError('Expected hash is required.');
    try {
      let bytes;
      if (verifyMode === 'hex') bytes = hexToBytes(verifyInput);
      else bytes = strToBytes(verifyInput);
      const digest = mdc2(bytes);
      const expectedHex = verifyExpected.replace(/\s/g, '').toLowerCase();
      const match = toHex(digest) === expectedHex;
      setVerifyResult({ match, digest });
    } catch (e) {
      setVerifyError(e.message || 'Verification failed.');
    }
  }, [verifyInput, verifyMode, verifyExpected]);

  // ── HMAC-MDC2 (envelope construction: MDC2(key ‖ msg ‖ key)) ───────────────
  const handleHmac = useCallback(() => {
    setHmacError(''); setHmacResult(null);
    if (!hmacInput.trim()) return setHmacError('Message is required.');
    if (!hmacKey.trim()) return setHmacError('Key is required.');
    try {
      const keyBytes = strToBytes(hmacKey);
      const msgBytes = strToBytes(hmacInput);
      // Outer: MDC2(key ‖ MDC2(key ‖ msg))
      const inner = mdc2(new Uint8Array([...keyBytes, ...msgBytes]));
      const outer = mdc2(new Uint8Array([...keyBytes, ...inner]));
      setHmacResult(outer);
    } catch (e) {
      setHmacError(e.message || 'MAC computation failed.');
    }
  }, [hmacInput, hmacKey]);

  const ModeToggle = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {['text', 'hex'].map(m => (
        <button key={m} onClick={() => onChange(m)} style={{
          padding: '3px 10px',
          fontFamily: "'Courier New', monospace",
          fontSize: '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: value === m ? '#1a0e04' : 'transparent',
          border: `1px solid ${value === m ? '#6a4010' : '#2a1808'}`,
          color: value === m ? '#f0a030' : '#4a3010',
          borderRadius: '3px',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}>{m}</button>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      padding: '32px',
      background: 'radial-gradient(ellipse at 30% 20%, #100800 0%, #060400 40%, #040300 100%)',
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Header */}
      <div style={{ maxWidth: '760px', margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #3a1a00, #1a0e00)',
            border: '1px solid #5a2a08',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Hash size={16} color="#f0a030" />
          </div>
          <div>
            <h1 style={{
              fontSize: '26px',
              fontFamily: "'Courier New', monospace",
              fontWeight: 'bold',
              color: '#f0a030',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>MDC2</h1>
          </div>
          {['ISO/IEC 10118-2', 'DES-based', '128-bit', 'Pure JS'].map(b => (
            <span key={b} style={{
              padding: '2px 8px',
              background: '#0e0800',
              border: '1px solid #3a1a08',
              borderRadius: '3px',
              fontFamily: "'Courier New', monospace",
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: '#7a4820',
            }}>{b}</span>
          ))}
        </div>
        <p style={{ color: '#4a2e10', fontSize: '11px', letterSpacing: '0.05em', marginLeft: '48px' }}>
          Dual DES chains · Cross-swap interdependency · 128-bit Matyas–Meyer–Oseas construction
        </p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <Tabs defaultValue="hash">
          <TabsList style={{ background: '#080500', border: '1px solid #2a1808', marginBottom: '24px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {['hash', 'verify', 'mac'].map(t => (
              <TabsTrigger key={t} value={t} style={{ fontFamily: "'Courier New', monospace", fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {t === 'hash' ? 'Hash' : t === 'verify' ? 'Verify' : 'MAC'}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── HASH ────────────────────────────────────────────────────────── */}
          <TabsContent value="hash">
            <Card style={cardStyle}>
              <CardContent style={{ padding: '24px' }} className="space-y-5">
                <p style={{ fontSize: '11px', color: '#4a2e10', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                  MDC2 hashes input using two independent DES Matyas–Meyer–Oseas chains (V1, V2),
                  cross-swapping their halves each block to prevent independent attacks.
                  The 128-bit digest is V1 ‖ V2.
                </p>

                {/* Algorithm diagram */}
                <div style={{ background: '#060400', border: '1px solid #2a1408', borderRadius: '4px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', color: '#5a3410', lineHeight: 1.8, letterSpacing: '0.04em' }}>
                    <div>┌ <span style={{ color: '#9a6020' }}>V1₀</span> = 52 52 52 52 52 52 52 52</div>
                    <div>│ <span style={{ color: '#7a5020' }}>V2₀</span> = 25 25 25 25 25 25 25 25</div>
                    <div>│</div>
                    <div>│ for each 64-bit block Mᵢ:</div>
                    <div>│&nbsp;&nbsp; K1 ← V1 (key-formatted) &nbsp;&nbsp; W1 ← DES_K1(Mᵢ)</div>
                    <div>│&nbsp;&nbsp; K2 ← V2 (key-formatted) &nbsp;&nbsp; W2 ← DES_K2(Mᵢ)</div>
                    <div>│&nbsp;&nbsp; T1 ← W1 ⊕ Mᵢ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; T2 ← W2 ⊕ Mᵢ</div>
                    <div>│&nbsp;&nbsp; <span style={{ color: '#f0a030' }}>V1 ← T1[0..3] ‖ T2[4..7] &nbsp; V2 ← T2[0..3] ‖ T1[4..7]</span></div>
                    <div>└ digest = V1 ‖ V2</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={labelStyle}>Input</span>
                    <ModeToggle value={hashMode} onChange={setHashMode} />
                  </div>
                  <Textarea
                    placeholder={hashMode === 'hex' ? 'Hex bytes, e.g. 616263…' : 'Text to hash…'}
                    value={hashInput}
                    onChange={e => setHashInput(e.target.value)}
                    style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    className="placeholder:text-[#2a1808]"
                  />
                  {hashMode === 'text' && hashInput && (
                    <div style={{ fontSize: '10px', color: '#4a2e10' }}>
                      {new TextEncoder().encode(hashInput).length} bytes · {Math.ceil(new TextEncoder().encode(hashInput).length / 8)} DES blocks
                    </div>
                  )}
                </div>

                {hashError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e05050', background: 'rgba(200,30,30,0.08)', border: '1px solid rgba(200,30,30,0.2)', borderRadius: '4px', padding: '8px 12px' }}>
                    <AlertTriangle size={13} /> {hashError}
                  </div>
                )}

                <button onClick={handleHash} style={{
                  width: '100%',
                  padding: '10px',
                  background: '#0e0800',
                  border: '1px solid #5a3010',
                  borderRadius: '4px',
                  color: '#f0a030',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  Compute MDC2 Hash
                </button>

                {hashResult && (
                  <div className="space-y-4 pt-3" style={{ borderTop: '1px solid #2a1408' }}>
                    <HashDisplay label="MDC2 Digest (128-bit)" value={hashResult} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ background: '#060400', border: '1px solid #2a1408', borderRadius: '4px', padding: '8px' }}>
                        <div style={{ fontSize: '9px', color: '#5a3010', letterSpacing: '0.1em', marginBottom: '4px' }}>V1 — DES₁ CHAIN</div>
                        <div style={{ fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#f0c060', letterSpacing: '0.05em', wordBreak: 'break-all' }}>{toHex(hashResult.slice(0, 8))}</div>
                      </div>
                      <div style={{ background: '#060400', border: '1px solid #2a1408', borderRadius: '4px', padding: '8px' }}>
                        <div style={{ fontSize: '9px', color: '#5a3010', letterSpacing: '0.1em', marginBottom: '4px' }}>V2 — DES₂ CHAIN</div>
                        <div style={{ fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#c07020', letterSpacing: '0.05em', wordBreak: 'break-all' }}>{toHex(hashResult.slice(8, 16))}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VERIFY ──────────────────────────────────────────────────────── */}
          <TabsContent value="verify">
            <Card style={cardStyle}>
              <CardContent style={{ padding: '24px' }} className="space-y-5">
                <p style={{ fontSize: '11px', color: '#4a2e10', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                  Compute the MDC2 hash of the input and compare it against an expected digest.
                  Useful for integrity checks and test vector validation.
                </p>

                <div className="space-y-2">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={labelStyle}>Input</span>
                    <ModeToggle value={verifyMode} onChange={setVerifyMode} />
                  </div>
                  <Textarea
                    placeholder={verifyMode === 'hex' ? 'Hex bytes…' : 'Text to hash…'}
                    value={verifyInput}
                    onChange={e => setVerifyInput(e.target.value)}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    className="placeholder:text-[#2a1808]"
                  />
                </div>

                <div className="space-y-2">
                  <span style={labelStyle}>Expected MDC2 Hash (hex)</span>
                  <Input
                    placeholder="e.g. 52a0c9c9b51edf57e0f5c7a3b1c8e2d4…"
                    value={verifyExpected}
                    onChange={e => setVerifyExpected(e.target.value)}
                    style={inputStyle}
                    className="placeholder:text-[#2a1808]"
                  />
                </div>

                {verifyError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e05050', background: 'rgba(200,30,30,0.08)', border: '1px solid rgba(200,30,30,0.2)', borderRadius: '4px', padding: '8px 12px' }}>
                    <AlertTriangle size={13} /> {verifyError}
                  </div>
                )}

                <button onClick={handleVerify} style={{
                  width: '100%', padding: '10px',
                  background: '#0e0800', border: '1px solid #5a3010', borderRadius: '4px',
                  color: '#f0a030', fontFamily: "'Courier New', monospace", fontSize: '10px',
                  letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <GitCompare size={13} /> Verify Hash
                  </span>
                </button>

                {verifyResult && (
                  <div className="space-y-3 pt-3" style={{ borderTop: '1px solid #2a1408' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                      background: verifyResult.match ? 'rgba(80,200,60,0.06)' : 'rgba(200,50,30,0.06)',
                      border: `1px solid ${verifyResult.match ? 'rgba(80,200,60,0.2)' : 'rgba(200,50,30,0.2)'}`,
                      borderRadius: '4px',
                      fontSize: '12px', fontFamily: "'Courier New', monospace",
                      color: verifyResult.match ? '#70e050' : '#e06040',
                    }}>
                      {verifyResult.match
                        ? <><Check size={14} /> Hash verified — digests match</>
                        : <><AlertTriangle size={14} /> Hash mismatch — digests differ</>}
                    </div>
                    <HashDisplay label="Computed digest" value={verifyResult.digest} />
                    {!verifyResult.match && (
                      <div style={{ fontSize: '10px', color: '#5a3010', background: '#060400', border: '1px solid #2a1408', borderRadius: '4px', padding: '8px 12px' }}>
                        <div style={{ marginBottom: '4px' }}>Expected: <span style={{ color: '#c06030' }}>{verifyExpected.replace(/\s/g, '').toLowerCase()}</span></div>
                        <div>Computed: <span style={{ color: '#f0a030' }}>{toHex(verifyResult.digest)}</span></div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── MAC ─────────────────────────────────────────────────────────── */}
          <TabsContent value="mac">
            <Card style={cardStyle}>
              <CardContent style={{ padding: '24px' }} className="space-y-5">
                <p style={{ fontSize: '11px', color: '#4a2e10', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                  MDC2-based MAC using a two-pass envelope: <span style={{ color: '#f0a030' }}>MDC2(key ‖ MDC2(key ‖ msg))</span>.
                  Provides message authentication when both parties share the key.
                  Note: For production use, prefer HMAC-SHA256 over this construction.
                </p>

                <div style={{ background: '#060400', border: '1px solid #2a1408', borderRadius: '4px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', color: '#5a3410', lineHeight: 1.8 }}>
                    <div>inner ← MDC2(key ‖ message)</div>
                    <div>MAC &nbsp; ← MDC2(key ‖ inner)</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span style={labelStyle}>Message</span>
                  <Textarea
                    placeholder="Message to authenticate…"
                    value={hmacInput}
                    onChange={e => setHmacInput(e.target.value)}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    className="placeholder:text-[#2a1808]"
                  />
                </div>

                <div className="space-y-2">
                  <span style={labelStyle}>Key</span>
                  <Input
                    placeholder="Secret key (text)…"
                    value={hmacKey}
                    onChange={e => setHmacKey(e.target.value)}
                    style={inputStyle}
                    className="placeholder:text-[#2a1808]"
                  />
                </div>

                {hmacError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e05050', background: 'rgba(200,30,30,0.08)', border: '1px solid rgba(200,30,30,0.2)', borderRadius: '4px', padding: '8px 12px' }}>
                    <AlertTriangle size={13} /> {hmacError}
                  </div>
                )}

                <button onClick={handleHmac} style={{
                  width: '100%', padding: '10px',
                  background: '#0e0800', border: '1px solid #5a3010', borderRadius: '4px',
                  color: '#f0a030', fontFamily: "'Courier New', monospace", fontSize: '10px',
                  letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  Compute MDC2-MAC
                </button>

                {hmacResult && (
                  <div className="space-y-3 pt-3" style={{ borderTop: '1px solid #2a1408' }}>
                    <HashDisplay label="MDC2-MAC (128-bit)" value={hmacResult} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer stat bar */}
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
          {[
            ['128-bit', 'Digest size'],
            ['Dual DES', 'Block cipher'],
            ['64-bit', 'Block size'],
            ['ISO 10118-2', 'Standard'],
          ].map(([val, desc]) => (
            <div key={desc} style={{ background: '#080500', border: '1px solid #1a0e04', borderRadius: '4px', padding: '10px' }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: '10px', fontWeight: 'bold', color: '#9a5020' }}>{val}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', color: '#3a2010', marginTop: '2px' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MDC2Tool;