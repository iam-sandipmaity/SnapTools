import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, RefreshCw, ArrowLeftRight } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function hexToBuf(hex: string): Uint8Array {
  const clean = hex.replace(/\s/g, '');
  if (clean.length % 2 !== 0) throw new Error('Invalid hex');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function base64ToBuf(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64.trim()), (c) => c.charCodeAt(0));
}

type Fmt = 'hex' | 'base64';

function encode(buf: ArrayBuffer, fmt: Fmt): string {
  return fmt === 'hex' ? bufToHex(buf) : bufToBase64(buf);
}

function decode(s: string, fmt: Fmt): Uint8Array {
  return fmt === 'hex' ? hexToBuf(s) : base64ToBuf(s);
}

const CURVES = ['P-256', 'P-384', 'P-521'] as const;
type Curve = (typeof CURVES)[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      }}
      className="p-1.5 rounded hover:bg-white/5 text-[#7ab8d4] transition-colors"
      title="Copy"
    >
      {ok ? <Check size={13} className="text-[#40d0f0]" /> : <Copy size={13} />}
    </button>
  );
}

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a7a94]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <div
        className={`text-xs bg-[#030d12] border border-[#0d2a3a] rounded px-3 py-2 break-all select-all text-[#70c8e8] ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FmtToggle({ value, onChange }: { value: Fmt; onChange: (f: Fmt) => void }) {
  return (
    <div className="flex gap-1">
      {(['hex', 'base64'] as Fmt[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${
            value === f
              ? 'bg-[#082030] border-[#1a6080] text-[#40b8e0]'
              : 'bg-transparent border-[#0d2a3a] text-[#2a6a84] hover:border-[#1a4a64]'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ECDHTool: React.FC = () => {
  // ── Generate tab
  const [curve, setCurve] = useState<Curve>('P-256');
  const [fmt, setFmt] = useState<Fmt>('hex');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [keypair, setKeypair] = useState<{
    publicKey: string;
    privateKey: string;
    publicKeyRaw: string;
  } | null>(null);
  // store raw CryptoKeyPair for derive tab auto-fill
  const [rawKP, setRawKP] = useState<CryptoKeyPair | null>(null);

  // ── Derive tab
  const [derCurve, setDerCurve] = useState<Curve>('P-256');
  const [derFmt, setDerFmt] = useState<Fmt>('hex');
  const [myPrivKey, setMyPrivKey] = useState('');
  const [theirPubKey, setTheirPubKey] = useState('');
  const [derLoading, setDerLoading] = useState(false);
  const [derError, setDerError] = useState('');
  const [sharedSecret, setSharedSecret] = useState('');
  const [derivedKey, setDerivedKey] = useState('');

  // ── Simulate tab (Alice + Bob)
  const [simCurve, setSimCurve] = useState<Curve>('P-256');
  const [simFmt, setSimFmt] = useState<Fmt>('hex');
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [sim, setSim] = useState<{
    alice: { pub: string; priv: string };
    bob: { pub: string; priv: string };
    aliceSecret: string;
    bobSecret: string;
    match: boolean;
  } | null>(null);

  const inputCls =
    'bg-[#030d12] border-[#0d2a3a] text-[#90d0e8] placeholder-[#1a4a60] font-mono text-xs focus:ring-1 focus:ring-[#1a6080] focus:border-[#1a6080]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#3a7a94]';

  // ── Generate keypair ────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenError('');
    setKeypair(null);
    setRawKP(null);
    setGenLoading(true);
    try {
      const kp = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: curve },
        true,
        ['deriveKey', 'deriveBits']
      );

      const pubJwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
      const privJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
      const pubRaw = await crypto.subtle.exportKey('raw', kp.publicKey);

      setKeypair({
        publicKey: JSON.stringify(pubJwk, null, 2),
        privateKey: JSON.stringify(privJwk, null, 2),
        publicKeyRaw: encode(pubRaw, fmt),
      });
      setRawKP(kp);
    } catch (e: any) {
      setGenError(e.message || 'Key generation failed.');
    } finally {
      setGenLoading(false);
    }
  }, [curve, fmt]);

  // ── Derive shared secret ────────────────────────────────────────────────────
  const handleDerive = useCallback(async () => {
    setDerError('');
    setSharedSecret('');
    setDerivedKey('');
    if (!myPrivKey.trim() || !theirPubKey.trim())
      return setDerError('Both private key (JWK) and their public key are required.');
    setDerLoading(true);
    try {
      // Parse my private key (JWK JSON)
      let privJwk: JsonWebKey;
      try {
        privJwk = JSON.parse(myPrivKey);
      } catch {
        throw new Error('Private key must be valid JWK JSON.');
      }

      const myPrivCK = await crypto.subtle.importKey(
        'jwk',
        privJwk,
        { name: 'ECDH', namedCurve: derCurve },
        false,
        ['deriveKey', 'deriveBits']
      );

      // Parse their public key — try JWK first, then raw bytes
      let theirPubCK: CryptoKey;
      const trimmed = theirPubKey.trim();
      try {
        const pubJwk: JsonWebKey = JSON.parse(trimmed);
        theirPubCK = await crypto.subtle.importKey(
          'jwk',
          pubJwk,
          { name: 'ECDH', namedCurve: derCurve },
          false,
          []
        );
      } catch {
        // Try as raw bytes
        const rawBytes = decode(trimmed, derFmt);
        theirPubCK = await crypto.subtle.importKey(
          'raw',
          rawBytes,
          { name: 'ECDH', namedCurve: derCurve },
          false,
          []
        );
      }

      const bits = await crypto.subtle.deriveBits(
        { name: 'ECDH', public: theirPubCK },
        myPrivCK,
        { 'P-256': 256, 'P-384': 384, 'P-521': 528 }[derCurve]
      );

      setSharedSecret(encode(bits, derFmt));

      // Also derive AES-256 key from shared secret via HKDF
      const rawKey = await crypto.subtle.importKey('raw', bits, { name: 'HKDF' }, false, [
        'deriveKey',
      ]);
      const aesKey = await crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: new Uint8Array(32),
          info: new TextEncoder().encode('ecdh derived key'),
        },
        rawKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      const aesRaw = await crypto.subtle.exportKey('raw', aesKey);
      setDerivedKey(encode(aesRaw, derFmt));
    } catch (e: any) {
      setDerError(e.message || 'Key derivation failed. Check curve, key format, and inputs.');
    } finally {
      setDerLoading(false);
    }
  }, [myPrivKey, theirPubKey, derCurve, derFmt]);

  // ── Simulate Alice & Bob ────────────────────────────────────────────────────
  const handleSimulate = useCallback(async () => {
    setSimError('');
    setSim(null);
    setSimLoading(true);
    try {
      const [aliceKP, bobKP] = await Promise.all([
        crypto.subtle.generateKey({ name: 'ECDH', namedCurve: simCurve }, true, [
          'deriveKey',
          'deriveBits',
        ]),
        crypto.subtle.generateKey({ name: 'ECDH', namedCurve: simCurve }, true, [
          'deriveKey',
          'deriveBits',
        ]),
      ]);

      const bits = { 'P-256': 256, 'P-384': 384, 'P-521': 528 }[simCurve];

      const [alicePubRaw, alicePrivJwk, bobPubRaw, bobPrivJwk] = await Promise.all([
        crypto.subtle.exportKey('raw', aliceKP.publicKey),
        crypto.subtle.exportKey('jwk', aliceKP.privateKey),
        crypto.subtle.exportKey('raw', bobKP.publicKey),
        crypto.subtle.exportKey('jwk', bobKP.privateKey),
      ]);

      const [aliceBits, bobBits] = await Promise.all([
        crypto.subtle.deriveBits({ name: 'ECDH', public: bobKP.publicKey }, aliceKP.privateKey, bits),
        crypto.subtle.deriveBits({ name: 'ECDH', public: aliceKP.publicKey }, bobKP.privateKey, bits),
      ]);

      const aliceSecret = encode(aliceBits, simFmt);
      const bobSecret = encode(bobBits, simFmt);

      setSim({
        alice: {
          pub: encode(alicePubRaw, simFmt),
          priv: JSON.stringify(alicePrivJwk),
        },
        bob: {
          pub: encode(bobPubRaw, simFmt),
          priv: JSON.stringify(bobPrivJwk),
        },
        aliceSecret,
        bobSecret,
        match: aliceSecret === bobSecret,
      });
    } catch (e: any) {
      setSimError(e.message || 'Simulation failed.');
    } finally {
      setSimLoading(false);
    }
  }, [simCurve, simFmt]);

  // ─── Auto-fill derive tab from generated keypair ───────────────────────────
  const autoFillDerive = useCallback(async () => {
    if (!rawKP || !keypair) return;
    try {
      const privJwk = await crypto.subtle.exportKey('jwk', rawKP.privateKey);
      setMyPrivKey(JSON.stringify(privJwk, null, 2));
      setDerCurve(curve);
    } catch (err) {
      console.error('Failed to export private key:', err);
    }
  }, [rawKP, keypair, curve]);

  return (
    <div
      className="min-h-screen w-full p-4 md:p-8"
      style={{
        background: 'radial-gradient(ellipse at 20% 0%, #020810 0%, #030d18 60%, #020810 100%)',
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 0deg, #0a4060, #1080c0, #0a4060)' }}
          >
            <ArrowLeftRight size={14} className="text-[#70d0f0]" />
          </div>
          <h1
            className="text-2xl font-bold text-[#70d8f8]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}
          >
            ECDH
          </h1>
          <Badge className="bg-[#041830] text-[#40a8d0] border border-[#0d3a5a] text-[10px] font-mono">
            Key Exchange
          </Badge>
        </div>
        <p className="text-[#1a5a74] text-[11px] font-mono ml-11">
          Elliptic Curve Diffie-Hellman · WebCrypto API · P-256 / P-384 / P-521
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="generate">
          <TabsList className="bg-[#030d18] border border-[#0d2a3a] mb-6 w-full grid grid-cols-3">
            {['generate', 'derive', 'simulate'].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#1a5a74] data-[state=active]:bg-[#061828] data-[state=active]:text-[#40b8e0]"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── GENERATE ──────────────────────────────────────────────────── */}
          <TabsContent value="generate">
            <Card className="bg-[#040f1a] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a5a74] font-mono">
                  Generate an ECDH keypair. The public key can be shared freely; keep the private key
                  secret.
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Curve</Label>
                    <div className="flex gap-1">
                      {CURVES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCurve(c)}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                            curve === c
                              ? 'bg-[#061828] border-[#1a6080] text-[#40b8e0]'
                              : 'bg-transparent border-[#0d2a3a] text-[#2a6a84] hover:border-[#1a4a64]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Raw key fmt</Label>
                    <FmtToggle value={fmt} onChange={setFmt} />
                  </div>
                </div>

                {genError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {genError}
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={genLoading}
                  className="w-full bg-[#061828] hover:bg-[#082038] border border-[#1a5070] text-[#40b8e0] font-mono text-[10px] uppercase tracking-widest"
                >
                  <RefreshCw size={13} className={`mr-2 ${genLoading ? 'animate-spin' : ''}`} />
                  {genLoading ? 'Generating…' : 'Generate Keypair'}
                </Button>

                {keypair && (
                  <div className="space-y-4 pt-2 border-t border-[#0a2030]">
                    <Field label="Public Key (Raw bytes)" value={keypair.publicKeyRaw} />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a7a94]">
                          Public Key (JWK)
                        </span>
                        <CopyBtn text={keypair.publicKey} />
                      </div>
                      <pre className="text-[10px] bg-[#030d12] border border-[#0d2a3a] rounded px-3 py-2 overflow-x-auto text-[#70c8e8] font-mono">
                        {keypair.publicKey}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a7a94]">
                          Private Key (JWK) — keep secret
                        </span>
                        <CopyBtn text={keypair.privateKey} />
                      </div>
                      <pre className="text-[10px] bg-[#030d12] border border-[#1a2020] rounded px-3 py-2 overflow-x-auto text-[#c08060] font-mono">
                        {keypair.privateKey}
                      </pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={autoFillDerive}
                      className="text-[10px] font-mono border-[#0d2a3a] text-[#3a7a94] hover:bg-[#061828] hover:text-[#40b8e0]"
                    >
                      ↗ Use this keypair in Derive tab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DERIVE ────────────────────────────────────────────────────── */}
          <TabsContent value="derive">
            <Card className="bg-[#040f1a] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a5a74] font-mono">
                  Combine your private key with the other party's public key to derive a shared secret.
                  Neither key travels over the wire.
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Curve</Label>
                    <div className="flex gap-1">
                      {CURVES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setDerCurve(c)}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                            derCurve === c
                              ? 'bg-[#061828] border-[#1a6080] text-[#40b8e0]'
                              : 'bg-transparent border-[#0d2a3a] text-[#2a6a84] hover:border-[#1a4a64]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Format</Label>
                    <FmtToggle value={derFmt} onChange={setDerFmt} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>My Private Key (JWK JSON)</Label>
                  <textarea
                    placeholder='{"kty":"EC","crv":"P-256","d":"…","x":"…","y":"…"}'
                    value={myPrivKey}
                    onChange={(e) => setMyPrivKey(e.target.value)}
                    rows={4}
                    className={`w-full rounded-md border px-3 py-2 text-xs resize-y ${inputCls}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Their Public Key (JWK JSON or raw {derFmt})</Label>
                  <textarea
                    placeholder={`Paste JWK JSON or raw public key bytes as ${derFmt}…`}
                    value={theirPubKey}
                    onChange={(e) => setTheirPubKey(e.target.value)}
                    rows={4}
                    className={`w-full rounded-md border px-3 py-2 text-xs resize-y ${inputCls}`}
                  />
                </div>

                {derError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {derError}
                  </div>
                )}

                <Button
                  onClick={handleDerive}
                  disabled={derLoading}
                  className="w-full bg-[#061828] hover:bg-[#082038] border border-[#1a5070] text-[#40b8e0] font-mono text-[10px] uppercase tracking-widest"
                >
                  {derLoading ? 'Deriving…' : 'Derive Shared Secret'}
                </Button>

                {sharedSecret && (
                  <div className="space-y-3 pt-2 border-t border-[#0a2030]">
                    <Field label={`Shared Secret (ECDH raw bits) — ${derFmt}`} value={sharedSecret} />
                    <Field label={`Derived AES-256 Key (HKDF-SHA256) — ${derFmt}`} value={derivedKey} />
                    <p className="text-[10px] text-[#1a5a74] font-mono">
                      The AES-256 key is derived from the shared secret via HKDF-SHA256 and is ready to
                      use for symmetric encryption (e.g. AES-GCM).
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SIMULATE ──────────────────────────────────────────────────── */}
          <TabsContent value="simulate">
            <Card className="bg-[#040f1a] border-[#0d2a3a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a5a74] font-mono">
                  Simulate a full Alice ↔ Bob key exchange. Both parties generate keypairs
                  independently, exchange public keys, and derive the same shared secret.
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Curve</Label>
                    <div className="flex gap-1">
                      {CURVES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSimCurve(c)}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                            simCurve === c
                              ? 'bg-[#061828] border-[#1a6080] text-[#40b8e0]'
                              : 'bg-transparent border-[#0d2a3a] text-[#2a6a84] hover:border-[#1a4a64]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Format</Label>
                    <FmtToggle value={simFmt} onChange={setSimFmt} />
                  </div>
                </div>

                {simError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {simError}
                  </div>
                )}

                <Button
                  onClick={handleSimulate}
                  disabled={simLoading}
                  className="w-full bg-[#061828] hover:bg-[#082038] border border-[#1a5070] text-[#40b8e0] font-mono text-[10px] uppercase tracking-widest"
                >
                  <RefreshCw size={13} className={`mr-2 ${simLoading ? 'animate-spin' : ''}`} />
                  {simLoading ? 'Simulating…' : 'Run Simulation'}
                </Button>

                {sim && (
                  <div className="space-y-5 pt-2 border-t border-[#0a2030]">
                    {/* Alice */}
                    <div className="rounded border border-[#0d2a3a] p-4 space-y-3">
                      <div className="text-[10px] font-mono text-[#2a8aaa] uppercase tracking-widest mb-1">
                        Alice
                      </div>
                      <Field label={`Public Key (${simFmt})`} value={sim.alice.pub} />
                    </div>

                    {/* Bob */}
                    <div className="rounded border border-[#0d2a3a] p-4 space-y-3">
                      <div className="text-[10px] font-mono text-[#2a8aaa] uppercase tracking-widest mb-1">
                        Bob
                      </div>
                      <Field label={`Public Key (${simFmt})`} value={sim.bob.pub} />
                    </div>

                    {/* Exchange arrow */}
                    <div className="flex items-center gap-3 px-2">
                      <div className="flex-1 h-px bg-[#0d2a3a]" />
                      <span className="text-[10px] font-mono text-[#1a5a74]">
                        ← public keys exchanged →
                      </span>
                      <div className="flex-1 h-px bg-[#0d2a3a]" />
                    </div>

                    {/* Shared secrets */}
                    <div className="space-y-3">
                      <Field label="Alice's derived shared secret" value={sim.aliceSecret} />
                      <Field label="Bob's derived shared secret" value={sim.bobSecret} />
                    </div>

                    {/* Match indicator */}
                    <div
                      className={`flex items-center gap-3 rounded px-4 py-3 border font-mono text-xs ${
                        sim.match
                          ? 'bg-[#041820] border-[#1a6080] text-[#40c0e0]'
                          : 'bg-red-950/30 border-red-800/40 text-red-400'
                      }`}
                    >
                      <span className="text-lg">{sim.match ? '✓' : '✗'}</span>
                      {sim.match
                        ? 'Shared secrets match — key exchange successful! Alice and Bob can now communicate securely using this shared key.'
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
            ['ECDH', 'Protocol'],
            ['P-256 / P-384 / P-521', 'Curves'],
            ['HKDF-SHA256', 'KDF'],
            ['WebCrypto API', 'Engine'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#040f1a] border border-[#0a2030] rounded p-3">
              <div className="text-[#2090b8] font-mono text-[10px] font-bold">{val}</div>
              <div className="text-[#1a4a60] font-mono text-[9px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ECDHTool;