import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, RefreshCw, ShieldCheck, ShieldX, Fingerprint } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Fmt = 'hex' | 'base64';
type Curve = 'P-256' | 'P-384' | 'P-521';
type HashAlg = 'SHA-256' | 'SHA-384' | 'SHA-512';
type SigFmt = 'DER' | 'raw';

const CURVE_DEFAULTS: Record<Curve, HashAlg> = {
  'P-256': 'SHA-256',
  'P-384': 'SHA-384',
  'P-521': 'SHA-512',
};

// ─── Encoding helpers ─────────────────────────────────────────────────────────
function toHex(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
}
function toBase64(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b));
}
function enc(b: Uint8Array, fmt: Fmt): string {
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
function dec(s: string, fmt: Fmt): Uint8Array {
  return fmt === 'hex' ? fromHex(s) : fromBase64(s);
}

// ─── DER ↔ Raw (r||s) signature conversion ───────────────────────────────────
// WebCrypto ECDSA uses raw IEEE P1363 format (r||s), but DER (ASN.1) is common in the wild.

function rawToDer(raw: Uint8Array, coordLen: number): Uint8Array {
  const r = raw.slice(0, coordLen);
  const s = raw.slice(coordLen);
  function encodeInt(n: Uint8Array): Uint8Array {
    // Strip leading zeros, but ensure positive (prepend 0x00 if high bit set)
    let start = 0;
    while (start < n.length - 1 && n[start] === 0) start++;
    const trimmed = n.slice(start);
    const needsPad = trimmed[0] & 0x80;
    const out = new Uint8Array((needsPad ? 1 : 0) + trimmed.length + 2);
    out[0] = 0x02;
    out[1] = trimmed.length + (needsPad ? 1 : 0);
    if (needsPad) out[2] = 0x00;
    out.set(trimmed, needsPad ? 3 : 2);
    return out;
  }
  const rDer = encodeInt(r);
  const sDer = encodeInt(s);
  const seq = new Uint8Array(2 + rDer.length + sDer.length);
  seq[0] = 0x30;
  seq[1] = rDer.length + sDer.length;
  seq.set(rDer, 2);
  seq.set(sDer, 2 + rDer.length);
  return seq;
}

function derToRaw(der: Uint8Array, coordLen: number): Uint8Array {
  if (der[0] !== 0x30) throw new Error('Not a DER SEQUENCE');
  let pos = 2; // skip 0x30 + length
  if (der[1] & 0x80) pos += (der[1] & 0x7f); // long-form length
  function readInt(): Uint8Array {
    if (der[pos] !== 0x02) throw new Error('Expected INTEGER tag');
    pos++;
    let len = der[pos++];
    if (len & 0x80) { const ll = len & 0x7f; len = 0; for (let i = 0; i < ll; i++) len = (len << 8) | der[pos++]; }
    const val = der.slice(pos, pos + len);
    pos += len;
    // Remove leading 0x00 padding, then left-pad to coordLen
    let start = 0;
    while (start < val.length - 1 && val[start] === 0) start++;
    const trimmed = val.slice(start);
    const out = new Uint8Array(coordLen);
    out.set(trimmed, coordLen - trimmed.length);
    return out;
  }
  const r = readInt();
  const s = readInt();
  const out = new Uint8Array(coordLen * 2);
  out.set(r, 0);
  out.set(s, coordLen);
  return out;
}

function coordLen(curve: Curve): number {
  return { 'P-256': 32, 'P-384': 48, 'P-521': 66 }[curve];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600); }}
      className="p-1.5 rounded hover:bg-white/5 text-[#609060] transition-colors" title="Copy"
    >
      {ok ? <Check size={13} className="text-[#60e080]" /> : <Copy size={13} />}
    </button>
  );
}

function Field({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a6a3a]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <div className={`text-xs font-mono bg-[#020c04] border rounded px-3 py-2 break-all select-all ${danger ? 'border-[#1a3a1a] text-[#80c060]' : 'border-[#0d2a10] text-[#60d870]'}`}>
        {value}
      </div>
    </div>
  );
}

function FieldPre({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a6a3a]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <pre className="text-[10px] font-mono bg-[#020c04] border border-[#0d2a10] rounded px-3 py-2 overflow-x-auto text-[#60d870] whitespace-pre-wrap break-all">
        {value}
      </pre>
    </div>
  );
}

function Toggle<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${value === o ? 'bg-[#0a2010] border-[#2a6030] text-[#60d870]' : 'bg-transparent border-[#0d2a10] text-[#2a5a2a] hover:border-[#1a4020]'}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ECDSATool: React.FC = () => {
  // ── Generate
  const [genCurve, setGenCurve] = useState<Curve>('P-256');
  const [genFmt, setGenFmt] = useState<Fmt>('hex');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [genResult, setGenResult] = useState<{ pubJwk: string; privJwk: string; pubRaw: string } | null>(null);
  const [cachedKP, setCachedKP] = useState<{ kp: CryptoKeyPair; curve: Curve } | null>(null);

  // ── Sign
  const [signCurve, setSignCurve] = useState<Curve>('P-256');
  const [signHash, setSignHash] = useState<HashAlg>('SHA-256');
  const [signSigFmt, setSignSigFmt] = useState<SigFmt>('raw');
  const [signFmt, setSignFmt] = useState<Fmt>('hex');
  const [signPrivJwk, setSignPrivJwk] = useState('');
  const [signMessage, setSignMessage] = useState('');
  const [signLoading, setSignLoading] = useState(false);
  const [signError, setSignError] = useState('');
  const [signResult, setSignResult] = useState<{ sig: string; pubJwk: string } | null>(null);

  // ── Verify
  const [verCurve, setVerCurve] = useState<Curve>('P-256');
  const [verHash, setVerHash] = useState<HashAlg>('SHA-256');
  const [verSigFmt, setVerSigFmt] = useState<SigFmt>('raw');
  const [verFmt, setVerFmt] = useState<Fmt>('hex');
  const [verPubJwk, setVerPubJwk] = useState('');
  const [verMessage, setVerMessage] = useState('');
  const [verSignature, setVerSignature] = useState('');
  const [verLoading, setVerLoading] = useState(false);
  const [verError, setVerError] = useState('');
  const [verStatus, setVerStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // ── Inspect
  const [inspSig, setInspSig] = useState('');
  const [inspFmt, setInspFmt] = useState<Fmt>('hex');
  const [inspCurve, setInspCurve] = useState<Curve>('P-256');
  const [inspResult, setInspResult] = useState<{ r: string; s: string; len: number; type: string } | null>(null);
  const [inspError, setInspError] = useState('');

  const inputCls = 'bg-[#020c04] border-[#0d2a10] text-[#60d870] placeholder-[#1a3a1a] font-mono text-xs focus:ring-1 focus:ring-[#2a6030] focus:border-[#2a6030]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#3a6a3a]';

  // ── Generate keypair ─────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenError(''); setGenResult(null); setCachedKP(null);
    setGenLoading(true);
    try {
      const kp = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: genCurve }, true, ['sign', 'verify']
      );
      const [pubJwk, privJwk, pubRaw] = await Promise.all([
        crypto.subtle.exportKey('jwk', kp.publicKey),
        crypto.subtle.exportKey('jwk', kp.privateKey),
        crypto.subtle.exportKey('raw', kp.publicKey),
      ]);
      setCachedKP({ kp, curve: genCurve });
      setGenResult({
        pubJwk: JSON.stringify(pubJwk, null, 2),
        privJwk: JSON.stringify(privJwk, null, 2),
        pubRaw: enc(new Uint8Array(pubRaw), genFmt),
      });
    } catch (e: any) {
      setGenError(e.message || 'Key generation failed.');
    } finally {
      setGenLoading(false);
    }
  }, [genCurve, genFmt]);

  // ── Sign ─────────────────────────────────────────────────────────────────────
  const handleSign = useCallback(async () => {
    setSignError(''); setSignResult(null);
    if (!signPrivJwk.trim() || !signMessage.trim()) return setSignError('Private key (JWK) and message are required.');
    setSignLoading(true);
    try {
      let privJwk: JsonWebKey;
      try { privJwk = JSON.parse(signPrivJwk); } catch { throw new Error('Private key must be valid JWK JSON.'); }

      let privCK: CryptoKey;
      let pubCK: CryptoKey;

      // Try to use cached keypair if JWK matches
      if (cachedKP && cachedKP.curve === signCurve) {
        const cachedPrivJwk = await crypto.subtle.exportKey('jwk', cachedKP.kp.privateKey);
        if (JSON.stringify(cachedPrivJwk) === JSON.stringify(privJwk)) {
          privCK = cachedKP.kp.privateKey;
          pubCK = cachedKP.kp.publicKey;
        } else {
          privCK = await crypto.subtle.importKey('jwk', privJwk, { name: 'ECDSA', namedCurve: signCurve }, false, ['sign']);
          // Reconstruct public key from private JWK (remove d field)
          const pubJwk = { ...privJwk }; delete (pubJwk as any).d; pubJwk.key_ops = [];
          pubCK = await crypto.subtle.importKey('jwk', pubJwk, { name: 'ECDSA', namedCurve: signCurve }, true, ['verify']);
        }
      } else {
        privCK = await crypto.subtle.importKey('jwk', privJwk, { name: 'ECDSA', namedCurve: signCurve }, false, ['sign']);
        const pubJwk = { ...privJwk }; delete (pubJwk as any).d; pubJwk.key_ops = [];
        pubCK = await crypto.subtle.importKey('jwk', pubJwk, { name: 'ECDSA', namedCurve: signCurve }, true, ['verify']);
      }

      const msgBytes = new TextEncoder().encode(signMessage);
      const rawSigBuf = await crypto.subtle.sign({ name: 'ECDSA', hash: signHash }, privCK, msgBytes);
      const rawSig = new Uint8Array(rawSigBuf);

      let finalSig: Uint8Array;
      if (signSigFmt === 'DER') {
        finalSig = rawToDer(rawSig, coordLen(signCurve));
      } else {
        finalSig = rawSig;
      }

      const pubJwkExported = await crypto.subtle.exportKey('jwk', pubCK);
      setSignResult({
        sig: enc(finalSig, signFmt),
        pubJwk: JSON.stringify(pubJwkExported, null, 2),
      });
    } catch (e: any) {
      setSignError(e.message || 'Signing failed. Check curve, hash, and key format.');
    } finally {
      setSignLoading(false);
    }
  }, [signPrivJwk, signMessage, signCurve, signHash, signSigFmt, signFmt, cachedKP]);

  // ── Verify ───────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    setVerError(''); setVerStatus('idle');
    if (!verPubJwk.trim() || !verMessage.trim() || !verSignature.trim())
      return setVerError('Public key (JWK), message, and signature are all required.');
    setVerLoading(true);
    try {
      let pubJwk: JsonWebKey;
      try { pubJwk = JSON.parse(verPubJwk); } catch { throw new Error('Public key must be valid JWK JSON.'); }

      const pubCK = await crypto.subtle.importKey('jwk', pubJwk, { name: 'ECDSA', namedCurve: verCurve }, false, ['verify']);

      let sigBytes = dec(verSignature.trim(), verFmt);
      // Auto-detect and convert DER → raw if needed
      if (verSigFmt === 'DER') {
        sigBytes = derToRaw(sigBytes, coordLen(verCurve));
      }

      const msgBytes = new TextEncoder().encode(verMessage);
      const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: verHash }, pubCK, sigBytes, msgBytes);
      setVerStatus(valid ? 'valid' : 'invalid');
    } catch (e: any) {
      setVerError(e.message || 'Verification failed. Check curve, hash, key, and signature format.');
    } finally {
      setVerLoading(false);
    }
  }, [verPubJwk, verMessage, verSignature, verCurve, verHash, verSigFmt, verFmt]);

  // ── Inspect signature ────────────────────────────────────────────────────────
  const handleInspect = useCallback(() => {
    setInspError(''); setInspResult(null);
    if (!inspSig.trim()) return setInspError('Paste a signature to inspect.');
    try {
      const bytes = dec(inspSig.trim(), inspFmt);
      const cl = coordLen(inspCurve);
      let r: Uint8Array, s: Uint8Array, type: string;

      if (bytes[0] === 0x30) {
        // DER
        const raw = derToRaw(bytes, cl);
        r = raw.slice(0, cl);
        s = raw.slice(cl);
        type = 'DER (ASN.1 SEQUENCE)';
      } else if (bytes.length === cl * 2) {
        // Raw IEEE P1363
        r = bytes.slice(0, cl);
        s = bytes.slice(cl);
        type = `Raw IEEE P1363 (r‖s, ${cl * 2} bytes)`;
      } else {
        throw new Error(`Unexpected length ${bytes.length}. Expected ${cl * 2} (raw) or DER SEQUENCE (starts with 0x30).`);
      }

      setInspResult({
        r: toHex(r),
        s: toHex(s),
        len: bytes.length,
        type,
      });
    } catch (e: any) {
      setInspError(e.message || 'Could not parse signature.');
    }
  }, [inspSig, inspFmt, inspCurve]);

  // Auto-fills
  const autoFillSign = useCallback(async () => {
    if (!genResult || !cachedKP) return;
    setSignPrivJwk(genResult.privJwk);
    setSignCurve(cachedKP.curve);
    setSignHash(CURVE_DEFAULTS[cachedKP.curve]);
  }, [genResult, cachedKP]);

  const autoFillVerify = useCallback(() => {
    if (!signResult) return;
    setVerPubJwk(signResult.pubJwk);
    setVerMessage(signMessage);
    setVerSignature(signResult.sig);
    setVerCurve(signCurve);
    setVerHash(signHash);
    setVerSigFmt(signSigFmt);
    setVerFmt(signFmt);
  }, [signResult, signMessage, signCurve, signHash, signSigFmt, signFmt]);

  const autoFillInspect = useCallback(() => {
    if (!signResult) return;
    setInspSig(signResult.sig);
    setInspFmt(signFmt);
    setInspCurve(signCurve);
  }, [signResult, signFmt, signCurve]);

  return (
    <div className="min-h-screen w-full p-4 md:p-8"
      style={{ background: 'radial-gradient(ellipse at 80% 10%, #010c03 0%, #020e05 50%, #010802 100%)', fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 270deg, #082010, #10a030, #082010)' }}>
            <Fingerprint size={14} className="text-[#60ff80]" />
          </div>
          <h1 className="text-2xl font-bold text-[#50e870]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            ECDSA
          </h1>
          <Badge className="bg-[#020e04] text-[#30a850] border border-[#0a2e10] text-[10px] font-mono">
            Digital Signatures
          </Badge>
        </div>
        <p className="text-[#1a4a20] text-[11px] font-mono ml-11">
          Elliptic Curve Digital Signature Algorithm · FIPS 186-4 · WebCrypto API · DER & Raw formats
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="generate">
          <TabsList className="bg-[#020e04] border border-[#0a2010] mb-6 w-full grid grid-cols-4">
            {['generate', 'sign', 'verify', 'inspect'].map((t) => (
              <TabsTrigger key={t} value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#1a4a20] data-[state=active]:bg-[#061808] data-[state=active]:text-[#50e870]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── GENERATE ──────────────────────────────────────────────────── */}
          <TabsContent value="generate">
            <Card className="bg-[#020e04] border-[#0a2010] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a20] font-mono">
                  Generate an ECDSA keypair. The curve determines key size and which hash algorithm
                  is recommended. Keys are exported in JWK format for portability.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Curve</Label>
                    <Toggle options={['P-256', 'P-384', 'P-521'] as Curve[]} value={genCurve}
                      onChange={(c) => { setGenCurve(c); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Raw pub fmt</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={genFmt} onChange={setGenFmt} />
                  </div>
                </div>

                {/* Curve info strip */}
                <div className="bg-[#010802] border border-[#0a1a08] rounded px-3 py-2 text-[10px] font-mono text-[#2a5a2a] flex gap-4 flex-wrap">
                  <span>Coord size: <span className="text-[#50b860]">{coordLen(genCurve)} bytes</span></span>
                  <span>Sig size (raw): <span className="text-[#50b860]">{coordLen(genCurve) * 2} bytes</span></span>
                  <span>Recommended hash: <span className="text-[#50b860]">{CURVE_DEFAULTS[genCurve]}</span></span>
                </div>

                {genError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {genError}
                  </div>
                )}

                <Button onClick={handleGenerate} disabled={genLoading}
                  className="w-full bg-[#061808] hover:bg-[#0a2010] border border-[#1a5020] text-[#50e870] font-mono text-[10px] uppercase tracking-widest">
                  <RefreshCw size={13} className={`mr-2 ${genLoading ? 'animate-spin' : ''}`} />
                  {genLoading ? 'Generating…' : 'Generate Keypair'}
                </Button>

                {genResult && (
                  <div className="space-y-4 pt-2 border-t border-[#0a1a08]">
                    <Field label={`Public Key raw (uncompressed) — ${genFmt}`} value={genResult.pubRaw} />
                    <FieldPre label="Public Key (JWK)" value={genResult.pubJwk} />
                    <FieldPre label="Private Key (JWK) — keep secret" value={genResult.privJwk} />
                    <Button variant="outline" size="sm" onClick={autoFillSign}
                      className="text-[10px] font-mono border-[#0a2010] text-[#2a5a30] hover:bg-[#061808] hover:text-[#50e870]">
                      ↗ Use this keypair in Sign tab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SIGN ──────────────────────────────────────────────────────── */}
          <TabsContent value="sign">
            <Card className="bg-[#020e04] border-[#0a2010] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a20] font-mono">
                  Sign a message with an ECDSA private key. Output as raw IEEE P1363 (r‖s) or DER
                  ASN.1 format. DER is used by TLS/X.509; raw is common in JWTs and Web APIs.
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Curve</Label>
                    <Toggle options={['P-256', 'P-384', 'P-521'] as Curve[]} value={signCurve}
                      onChange={(c) => { setSignCurve(c); setSignHash(CURVE_DEFAULTS[c]); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Hash</Label>
                    <Toggle options={['SHA-256', 'SHA-384', 'SHA-512'] as HashAlg[]} value={signHash} onChange={setSignHash} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Sig format</Label>
                    <Toggle options={['raw', 'DER'] as SigFmt[]} value={signSigFmt} onChange={setSignSigFmt} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Encoding</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={signFmt} onChange={setSignFmt} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Private Key (JWK JSON)</Label>
                  <textarea rows={5} placeholder='{"kty":"EC","crv":"P-256","d":"…","x":"…","y":"…"}'
                    value={signPrivJwk} onChange={(e) => setSignPrivJwk(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-xs resize-y ${inputCls}`} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Message</Label>
                  <Textarea placeholder="Message to sign…" value={signMessage}
                    onChange={(e) => setSignMessage(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                {signError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {signError}
                  </div>
                )}

                <Button onClick={handleSign} disabled={signLoading}
                  className="w-full bg-[#061808] hover:bg-[#0a2010] border border-[#1a5020] text-[#50e870] font-mono text-[10px] uppercase tracking-widest">
                  {signLoading ? 'Signing…' : 'Sign Message'}
                </Button>

                {signResult && (
                  <div className="space-y-3 pt-2 border-t border-[#0a1a08]">
                    <Field label={`Signature (${signSigFmt}) — ${signFmt}`} value={signResult.sig} />
                    <FieldPre label="Corresponding Public Key (JWK)" value={signResult.pubJwk} />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={autoFillVerify}
                        className="text-[10px] font-mono border-[#0a2010] text-[#2a5a30] hover:bg-[#061808] hover:text-[#50e870]">
                        ↗ Send to Verify tab
                      </Button>
                      <Button variant="outline" size="sm" onClick={autoFillInspect}
                        className="text-[10px] font-mono border-[#0a2010] text-[#2a5a30] hover:bg-[#061808] hover:text-[#50e870]">
                        ↗ Inspect signature
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VERIFY ────────────────────────────────────────────────────── */}
          <TabsContent value="verify">
            <Card className="bg-[#020e04] border-[#0a2010] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a20] font-mono">
                  Verify an ECDSA signature against a message and public key. Supports both raw and
                  DER-encoded signatures. Curve and hash must match what was used during signing.
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Curve</Label>
                    <Toggle options={['P-256', 'P-384', 'P-521'] as Curve[]} value={verCurve}
                      onChange={(c) => { setVerCurve(c); setVerHash(CURVE_DEFAULTS[c]); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Hash</Label>
                    <Toggle options={['SHA-256', 'SHA-384', 'SHA-512'] as HashAlg[]} value={verHash} onChange={setVerHash} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Sig format</Label>
                    <Toggle options={['raw', 'DER'] as SigFmt[]} value={verSigFmt} onChange={setVerSigFmt} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Encoding</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={verFmt} onChange={setVerFmt} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Public Key (JWK JSON)</Label>
                  <textarea rows={5} placeholder='{"kty":"EC","crv":"P-256","x":"…","y":"…"}'
                    value={verPubJwk} onChange={(e) => setVerPubJwk(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-xs resize-y ${inputCls}`} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Message</Label>
                  <Textarea placeholder="Original signed message…" value={verMessage}
                    onChange={(e) => setVerMessage(e.target.value)}
                    className={inputCls + ' min-h-[70px]'} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Signature</Label>
                  <Input placeholder={`Paste signature (${verFmt})…`} value={verSignature}
                    onChange={(e) => setVerSignature(e.target.value)} className={inputCls} />
                </div>

                {verError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {verError}
                  </div>
                )}

                <Button onClick={handleVerify} disabled={verLoading}
                  className="w-full bg-[#061808] hover:bg-[#0a2010] border border-[#1a5020] text-[#50e870] font-mono text-[10px] uppercase tracking-widest">
                  {verLoading ? 'Verifying…' : 'Verify Signature'}
                </Button>

                {verStatus !== 'idle' && (
                  <div className={`flex items-center gap-3 rounded px-4 py-3 border font-mono text-xs ${verStatus === 'valid' ? 'bg-[#040e06] border-[#1a5020] text-[#50e870]' : 'bg-red-950/30 border-red-800/40 text-red-400'}`}>
                    {verStatus === 'valid'
                      ? <><ShieldCheck size={18} /><span>Signature valid — message is authentic and untampered.</span></>
                      : <><ShieldX size={18} /><span>Signature invalid — wrong key, tampered message, or mismatched curve/hash.</span></>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── INSPECT ───────────────────────────────────────────────────── */}
          <TabsContent value="inspect">
            <Card className="bg-[#020e04] border-[#0a2010] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#1a4a20] font-mono">
                  Parse and decompose an ECDSA signature into its raw r and s scalar components.
                  Accepts both DER (ASN.1) and raw IEEE P1363 formats.
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Curve</Label>
                    <Toggle options={['P-256', 'P-384', 'P-521'] as Curve[]} value={inspCurve} onChange={setInspCurve} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={labelCls}>Encoding</Label>
                    <Toggle options={['hex', 'base64'] as Fmt[]} value={inspFmt} onChange={setInspFmt} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Signature</Label>
                  <Textarea placeholder={`Paste DER or raw signature as ${inspFmt}…`} value={inspSig}
                    onChange={(e) => setInspSig(e.target.value)} className={inputCls + ' min-h-[70px]'} />
                </div>

                {inspError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {inspError}
                  </div>
                )}

                <Button onClick={handleInspect}
                  className="w-full bg-[#061808] hover:bg-[#0a2010] border border-[#1a5020] text-[#50e870] font-mono text-[10px] uppercase tracking-widest">
                  Inspect Signature
                </Button>

                {inspResult && (
                  <div className="space-y-3 pt-2 border-t border-[#0a1a08]">
                    <div className="bg-[#010802] border border-[#0a1a08] rounded px-3 py-2 text-[10px] font-mono flex gap-4 flex-wrap text-[#2a5a2a]">
                      <span>Format: <span className="text-[#50b860]">{inspResult.type}</span></span>
                      <span>Total bytes: <span className="text-[#50b860]">{inspResult.len}</span></span>
                      <span>r+s length: <span className="text-[#50b860]">{coordLen(inspCurve)} + {coordLen(inspCurve)} bytes</span></span>
                    </div>
                    <Field label="r scalar (hex)" value={inspResult.r} />
                    <Field label="s scalar (hex)" value={inspResult.s} />
                    <div className="bg-[#010802] border border-[#0a1a08] rounded px-3 py-2 text-[10px] font-mono text-[#2a4a2a]">
                      ℹ Each ECDSA signature is a unique (r, s) pair. Signing the same message twice
                      produces different r and s values due to the random nonce k used internally. Nonce
                      reuse (same k for two messages) fatally leaks the private key — this is how the
                      PS3 was broken.
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
            ['ECDSA', 'Algorithm'],
            ['P-256/384/521', 'Curves'],
            ['DER + Raw', 'Sig formats'],
            ['FIPS 186-4', 'Standard'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#020e04] border border-[#061808] rounded p-3">
              <div className="text-[#30a840] font-mono text-[10px] font-bold">{val}</div>
              <div className="text-[#0a2a10] font-mono text-[9px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ECDSATool;