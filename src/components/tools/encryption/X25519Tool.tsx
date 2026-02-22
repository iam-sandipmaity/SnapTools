import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

// ─── X25519 Pure-JS Implementation ───────────────────────────────────────────
// Based on the RFC 7748 specification for X25519 Diffie-Hellman function

// Field arithmetic mod p = 2^255 - 19
// Using BigInt for correctness

const P = (2n ** 255n) - 19n;
const A24 = 121665n;

function mod(a: bigint, m = P): bigint {
  return ((a % m) + m) % m;
}

function pow2(x: bigint, power: bigint): bigint {
  let result = x;
  for (let i = 0n; i < power - 1n; i++) result = mod(result * result);
  return result;
}

function inv(x: bigint): bigint {
  // Fermat's little theorem: x^(p-2) mod p
  // p - 2 = 2^255 - 21
  // Use square-and-multiply
  let n = P - 2n;
  let result = 1n;
  let base = mod(x);
  while (n > 0n) {
    if (n & 1n) result = mod(result * base);
    base = mod(base * base);
    n >>= 1n;
  }
  return result;
}

// Montgomery ladder scalar multiplication
function x25519(k: bigint, u: bigint): bigint {
  // Clamp scalar per RFC 7748
  // (done outside, on the byte-level k before calling)
  u = mod(u);

  let x1 = u;
  let x2 = 1n;
  let z2 = 0n;
  let x3 = u;
  let z3 = 1n;
  let swap = 0n;

  for (let t = 254n; t >= 0n; t--) {
    const kt = (k >> t) & 1n;
    swap ^= kt;
    // Conditional swap
    if (swap) {
      [x2, x3] = [x3, x2];
      [z2, z3] = [z3, z2];
    }
    swap = kt;

    const A = mod(x2 + z2);
    const AA = mod(A * A);
    const B = mod(x2 - z2 + P);
    const BB = mod(B * B);
    const E = mod(AA - BB + P);
    const C = mod(x3 + z3);
    const D = mod(x3 - z3 + P);
    const DA = mod(D * A);
    const CB = mod(C * B);
    x3 = mod((DA + CB) ** 2n);
    z3 = mod(x1 * mod((DA - CB + P) ** 2n));
    x2 = mod(AA * BB);
    z2 = mod(E * (AA + mod(A24 * E)));
  }

  if (swap) {
    [x2, x3] = [x3, x2];
    [z2, z3] = [z3, z2];
  }

  return mod(x2 * inv(z2));
}

const BASE_U = 9n;

function clampScalar(bytes: Uint8Array): bigint {
  const b = new Uint8Array(bytes);
  b[0] &= 248;
  b[31] &= 127;
  b[31] |= 64;
  // Little-endian decode
  let k = 0n;
  for (let i = 0; i < 32; i++) k |= BigInt(b[i]) << BigInt(8 * i);
  return k;
}

function decodeLEBytes(bytes: Uint8Array): bigint {
  let u = 0n;
  for (let i = 0; i < 32; i++) u |= BigInt(bytes[i]) << BigInt(8 * i);
  return u;
}

function encodeLEBigint(n: bigint): Uint8Array {
  const out = new Uint8Array(32);
  let v = mod(n);
  for (let i = 0; i < 32; i++) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

function generatePrivateKey(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

function getPublicKey(privateKeyBytes: Uint8Array): Uint8Array {
  const k = clampScalar(privateKeyBytes);
  const pub = x25519(k, BASE_U);
  return encodeLEBigint(pub);
}

function computeSharedSecret(myPriv: Uint8Array, theirPub: Uint8Array): Uint8Array {
  const k = clampScalar(myPriv);
  const u = decodeLEBytes(theirPub);
  const shared = x25519(k, u);
  return encodeLEBigint(shared);
}

// ─── HKDF-SHA256 for AES-256 key derivation ──────────────────────────────────
async function hkdfDerive(secret: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', secret, { name: 'HKDF' }, false, ['deriveKey']);
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('x25519 derived key') },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const raw = await crypto.subtle.exportKey('raw', aesKey);
  return new Uint8Array(raw);
}

// ─── Encoding helpers ─────────────────────────────────────────────────────────
type Fmt = 'hex' | 'base64';

function toHex(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
}
function toBase64(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b));
}
function encode(b: Uint8Array, fmt: Fmt): string {
  return fmt === 'hex' ? toHex(b) : toBase64(b);
}
function fromHex(h: string): Uint8Array {
  const clean = h.replace(/\s/g, '');
  if (clean.length !== 64) throw new Error('Expected 32 bytes (64 hex chars)');
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function fromBase64(s: string): Uint8Array {
  const bytes = Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0));
  if (bytes.length !== 32) throw new Error('Expected 32 bytes');
  return bytes;
}
function decode(s: string, fmt: Fmt): Uint8Array {
  return fmt === 'hex' ? fromHex(s) : fromBase64(s);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600); }}
      className="p-1.5 rounded hover:bg-white/5 text-[#a070e0] transition-colors"
      title="Copy"
    >
      {ok ? <Check size={13} className="text-[#c060ff]" /> : <Copy size={13} />}
    </button>
  );
}

function Field({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#7050a0]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <div className={`text-xs font-mono bg-[#080412] border rounded px-3 py-2 break-all select-all ${danger ? 'border-[#3a1a4a] text-[#e08050]' : 'border-[#1a0a2e] text-[#c090ff]'}`}>
        {value}
      </div>
    </div>
  );
}

function FmtToggle({ value, onChange }: { value: Fmt; onChange: (f: Fmt) => void }) {
  return (
    <div className="flex gap-1">
      {(['hex', 'base64'] as Fmt[]).map((f) => (
        <button key={f} onClick={() => onChange(f)}
          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${value === f ? 'bg-[#120828] border-[#5020a0] text-[#b060ff]' : 'bg-transparent border-[#1a0a2e] text-[#5030a0] hover:border-[#3a1a6a]'}`}>
          {f}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const X25519Tool: React.FC = () => {
  // Generate tab
  const [fmt, setFmt] = useState<Fmt>('hex');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [keypair, setKeypair] = useState<{ priv: string; pub: string } | null>(null);
  const [rawPriv, setRawPriv] = useState<Uint8Array | null>(null);

  // Derive tab
  const [derFmt, setDerFmt] = useState<Fmt>('hex');
  const [myPriv, setMyPriv] = useState('');
  const [theirPub, setTheirPub] = useState('');
  const [derLoading, setDerLoading] = useState(false);
  const [derError, setDerError] = useState('');
  const [sharedSecret, setSharedSecret] = useState('');
  const [derivedAES, setDerivedAES] = useState('');

  // Simulate tab
  const [simFmt, setSimFmt] = useState<Fmt>('hex');
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [sim, setSim] = useState<{
    alice: { priv: string; pub: string };
    bob: { priv: string; pub: string };
    aliceSecret: string;
    bobSecret: string;
    aesKey: string;
    match: boolean;
  } | null>(null);

  const inputCls = 'bg-[#080412] border-[#1a0a2e] text-[#c090ff] placeholder-[#2a1050] font-mono text-xs focus:ring-1 focus:ring-[#5020a0] focus:border-[#5020a0]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#7050a0]';

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    setGenError('');
    setKeypair(null);
    setGenLoading(true);
    try {
      const privBytes = generatePrivateKey();
      const pubBytes = getPublicKey(privBytes);
      setRawPriv(privBytes);
      setKeypair({ priv: encode(privBytes, fmt), pub: encode(pubBytes, fmt) });
    } catch (e: any) {
      setGenError(e.message || 'Key generation failed.');
    } finally {
      setGenLoading(false);
    }
  }, [fmt]);

  // ── Derive ──────────────────────────────────────────────────────────────────
  const handleDerive = useCallback(async () => {
    setDerError('');
    setSharedSecret('');
    setDerivedAES('');
    if (!myPriv.trim() || !theirPub.trim()) return setDerError('Both keys are required.');
    setDerLoading(true);
    try {
      const privBytes = decode(myPriv.trim(), derFmt);
      const pubBytes = decode(theirPub.trim(), derFmt);
      const secret = computeSharedSecret(privBytes, pubBytes);
      setSharedSecret(encode(secret, derFmt));
      const aes = await hkdfDerive(secret);
      setDerivedAES(encode(aes, derFmt));
    } catch (e: any) {
      setDerError(e.message || 'Derivation failed. Check key format and length (32 bytes each).');
    } finally {
      setDerLoading(false);
    }
  }, [myPriv, theirPub, derFmt]);

  // ── Simulate ────────────────────────────────────────────────────────────────
  const handleSimulate = useCallback(async () => {
    setSimError('');
    setSim(null);
    setSimLoading(true);
    try {
      const alicePrivBytes = generatePrivateKey();
      const bobPrivBytes = generatePrivateKey();
      const alicePubBytes = getPublicKey(alicePrivBytes);
      const bobPubBytes = getPublicKey(bobPrivBytes);
      const aliceSecretBytes = computeSharedSecret(alicePrivBytes, bobPubBytes);
      const bobSecretBytes = computeSharedSecret(bobPrivBytes, alicePubBytes);
      const aesBytes = await hkdfDerive(aliceSecretBytes);
      const aliceSecret = encode(aliceSecretBytes, simFmt);
      const bobSecret = encode(bobSecretBytes, simFmt);
      setSim({
        alice: { priv: encode(alicePrivBytes, simFmt), pub: encode(alicePubBytes, simFmt) },
        bob: { priv: encode(bobPrivBytes, simFmt), pub: encode(bobPubBytes, simFmt) },
        aliceSecret,
        bobSecret,
        aesKey: encode(aesBytes, simFmt),
        match: aliceSecret === bobSecret,
      });
    } catch (e: any) {
      setSimError(e.message || 'Simulation failed.');
    } finally {
      setSimLoading(false);
    }
  }, [simFmt]);

  // Auto-fill derive tab
  const autoFill = useCallback(() => {
    if (!keypair) return;
    setMyPriv(keypair.priv);
    setDerFmt(fmt);
  }, [keypair, fmt]);

  return (
    <div className="min-h-screen w-full p-4 md:p-8"
      style={{ background: 'radial-gradient(ellipse at 60% 0%, #0a0418 0%, #060110 60%, #04010c 100%)', fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 180deg, #200a50, #6010c0, #200a50)' }}>
            <Zap size={14} className="text-[#d080ff]" />
          </div>
          <h1 className="text-2xl font-bold text-[#c878ff]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            X25519
          </h1>
          <Badge className="bg-[#100428] text-[#9050e0] border border-[#2a0a60] text-[10px] font-mono">
            Key Agreement
          </Badge>
        </div>
        <p className="text-[#3a1a60] text-[11px] font-mono ml-11">
          Elliptic Curve Diffie-Hellman over Curve25519 · RFC 7748 · Pure JS — no external libs
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="generate">
          <TabsList className="bg-[#060110] border border-[#1a0a2e] mb-6 w-full grid grid-cols-3">
            {['generate', 'derive', 'simulate'].map((t) => (
              <TabsTrigger key={t} value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#3a1a60] data-[state=active]:bg-[#0e0420] data-[state=active]:text-[#b060ff]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── GENERATE ──────────────────────────────────────────────────── */}
          <TabsContent value="generate">
            <Card className="bg-[#060110] border-[#1a0a2e] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#3a1a60] font-mono">
                  Generates a random 32-byte private key and derives its Curve25519 public key using
                  the RFC 7748 base point u=9.
                </p>

                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Output format</Label>
                  <FmtToggle value={fmt} onChange={setFmt} />
                </div>

                {genError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {genError}
                  </div>
                )}

                <Button onClick={handleGenerate} disabled={genLoading}
                  className="w-full bg-[#0e0428] hover:bg-[#160638] border border-[#3a1060] text-[#b060ff] font-mono text-[10px] uppercase tracking-widest">
                  <RefreshCw size={13} className={`mr-2 ${genLoading ? 'animate-spin' : ''}`} />
                  {genLoading ? 'Generating…' : 'Generate Keypair'}
                </Button>

                {keypair && (
                  <div className="space-y-3 pt-2 border-t border-[#0e0428]">
                    <Field label="Public Key (32 bytes)" value={keypair.pub} />
                    <Field label="Private Key (32 bytes) — keep secret" value={keypair.priv} danger />
                    <div className="bg-[#0a0218] border border-[#1a0a2e] rounded px-3 py-2 text-[10px] font-mono text-[#4a2a70]">
                      ℹ The private key is automatically clamped (RFC 7748 §5) before use: bits 0–2
                      of byte 0 cleared, bit 7 of byte 31 cleared, bit 6 of byte 31 set.
                    </div>
                    <Button variant="outline" size="sm" onClick={autoFill}
                      className="text-[10px] font-mono border-[#1a0a2e] text-[#5030a0] hover:bg-[#0e0428] hover:text-[#b060ff]">
                      ↗ Use this keypair in Derive tab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DERIVE ────────────────────────────────────────────────────── */}
          <TabsContent value="derive">
            <Card className="bg-[#060110] border-[#1a0a2e] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#3a1a60] font-mono">
                  Input your 32-byte private key and the other party's 32-byte public key to derive
                  the shared secret. Outputs raw X25519 shared bytes and an AES-256 key via HKDF.
                </p>

                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Input format</Label>
                  <FmtToggle value={derFmt} onChange={setDerFmt} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>My Private Key (32 bytes)</Label>
                  <Input placeholder={`32-byte private key as ${derFmt}…`} value={myPriv}
                    onChange={(e) => setMyPriv(e.target.value)} className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Their Public Key (32 bytes)</Label>
                  <Input placeholder={`32-byte public key as ${derFmt}…`} value={theirPub}
                    onChange={(e) => setTheirPub(e.target.value)} className={inputCls} />
                </div>

                {derError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {derError}
                  </div>
                )}

                <Button onClick={handleDerive} disabled={derLoading}
                  className="w-full bg-[#0e0428] hover:bg-[#160638] border border-[#3a1060] text-[#b060ff] font-mono text-[10px] uppercase tracking-widest">
                  {derLoading ? 'Deriving…' : 'Derive Shared Secret'}
                </Button>

                {sharedSecret && (
                  <div className="space-y-3 pt-2 border-t border-[#0e0428]">
                    <Field label={`Shared Secret (X25519 raw) — ${derFmt}`} value={sharedSecret} />
                    <Field label={`Derived AES-256 Key (HKDF-SHA256) — ${derFmt}`} value={derivedAES} />
                    <p className="text-[10px] text-[#3a1a60] font-mono">
                      The AES-256 key is ready for use with AES-GCM symmetric encryption.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SIMULATE ──────────────────────────────────────────────────── */}
          <TabsContent value="simulate">
            <Card className="bg-[#060110] border-[#1a0a2e] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#3a1a60] font-mono">
                  Full Alice ↔ Bob simulation. Both generate keypairs independently, exchange public
                  keys, and each derive the same shared secret without ever transmitting private keys.
                </p>

                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Output format</Label>
                  <FmtToggle value={simFmt} onChange={setSimFmt} />
                </div>

                {simError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {simError}
                  </div>
                )}

                <Button onClick={handleSimulate} disabled={simLoading}
                  className="w-full bg-[#0e0428] hover:bg-[#160638] border border-[#3a1060] text-[#b060ff] font-mono text-[10px] uppercase tracking-widest">
                  <RefreshCw size={13} className={`mr-2 ${simLoading ? 'animate-spin' : ''}`} />
                  {simLoading ? 'Simulating…' : 'Run Simulation'}
                </Button>

                {sim && (
                  <div className="space-y-5 pt-2 border-t border-[#0e0428]">
                    {/* Alice */}
                    <div className="rounded border border-[#1a0a2e] p-4 space-y-3">
                      <div className="text-[10px] font-mono text-[#8040c0] uppercase tracking-widest">Alice</div>
                      <Field label={`Public Key — ${simFmt}`} value={sim.alice.pub} />
                      <Field label={`Private Key — ${simFmt}`} value={sim.alice.priv} danger />
                    </div>

                    {/* Exchange */}
                    <div className="flex items-center gap-3 px-2">
                      <div className="flex-1 h-px bg-[#1a0a2e]" />
                      <span className="text-[10px] font-mono text-[#3a1a60]">← public keys only exchanged →</span>
                      <div className="flex-1 h-px bg-[#1a0a2e]" />
                    </div>

                    {/* Bob */}
                    <div className="rounded border border-[#1a0a2e] p-4 space-y-3">
                      <div className="text-[10px] font-mono text-[#8040c0] uppercase tracking-widest">Bob</div>
                      <Field label={`Public Key — ${simFmt}`} value={sim.bob.pub} />
                      <Field label={`Private Key — ${simFmt}`} value={sim.bob.priv} danger />
                    </div>

                    {/* Secrets */}
                    <div className="space-y-3">
                      <Field label="Alice's shared secret" value={sim.aliceSecret} />
                      <Field label="Bob's shared secret" value={sim.bobSecret} />
                      <Field label={`Derived AES-256 key (HKDF) — ${simFmt}`} value={sim.aesKey} />
                    </div>

                    {/* Match */}
                    <div className={`flex items-center gap-3 rounded px-4 py-3 border font-mono text-xs ${sim.match ? 'bg-[#0a0428] border-[#5020a0] text-[#b060ff]' : 'bg-red-950/30 border-red-800/40 text-red-400'}`}>
                      <span className="text-lg">{sim.match ? '✓' : '✗'}</span>
                      {sim.match
                        ? 'Shared secrets match — X25519 key agreement successful! Alice and Bob share an identical secret without it ever crossing the wire.'
                        : 'Secrets do not match — something went wrong.'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 grid grid-cols-4 gap-2 text-center">
          {[
            ['X25519', 'Protocol'],
            ['Curve25519', 'Curve'],
            ['HKDF-SHA256', 'KDF'],
            ['RFC 7748', 'Standard'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#060110] border border-[#0e0428] rounded p-3">
              <div className="text-[#7030c0] font-mono text-[10px] font-bold">{val}</div>
              <div className="text-[#2a0a50] font-mono text-[9px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default X25519Tool;