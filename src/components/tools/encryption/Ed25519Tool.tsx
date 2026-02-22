import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, RefreshCw, ShieldCheck, ShieldX, PenLine } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  const c = h.replace(/\s/g, '');
  if (c.length % 2 !== 0) throw new Error('Invalid hex string');
  const o = new Uint8Array(c.length / 2);
  for (let i = 0; i < o.length; i++) o[i] = parseInt(c.slice(i * 2, i * 2 + 2), 16);
  return o;
}
function fromBase64(s: string): Uint8Array {
  return Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0));
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
      className="p-1.5 rounded hover:bg-white/5 text-[#c09040] transition-colors" title="Copy"
    >
      {ok ? <Check size={13} className="text-[#f0b030]" /> : <Copy size={13} />}
    </button>
  );
}

function Field({ label, value, danger, mono = true }: { label: string; value: string; danger?: boolean; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#7a6020]">{label}</span>
        <CopyBtn text={value} />
      </div>
      <div className={`text-xs bg-[#100c00] border rounded px-3 py-2 break-all select-all ${mono ? 'font-mono' : ''} ${danger ? 'border-[#3a2800] text-[#e09030]' : 'border-[#2a1e00] text-[#e0c060]'}`}>
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
          className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${value === f ? 'bg-[#1e1400] border-[#7a5010] text-[#e0a030]' : 'bg-transparent border-[#2a1e00] text-[#5a4010] hover:border-[#4a3010]'}`}>
          {f}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Ed25519Tool: React.FC = () => {
  // Generate tab
  const [fmt, setFmt] = useState<Fmt>('hex');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [keypair, setKeypair] = useState<{ pub: string; priv: string } | null>(null);
  const [rawKP, setRawKP] = useState<CryptoKeyPair | null>(null);

  // Sign tab
  const [signFmt, setSignFmt] = useState<Fmt>('hex');
  const [signPrivKey, setSignPrivKey] = useState('');
  const [signMessage, setSignMessage] = useState('');
  const [signLoading, setSignLoading] = useState(false);
  const [signError, setSignError] = useState('');
  const [signature, setSignature] = useState('');
  const [signPubKey, setSignPubKey] = useState(''); // exported pub for verify auto-fill

  // Verify tab
  const [verFmt, setVerFmt] = useState<Fmt>('hex');
  const [verPubKey, setVerPubKey] = useState('');
  const [verMessage, setVerMessage] = useState('');
  const [verSignature, setVerSignature] = useState('');
  const [verLoading, setVerLoading] = useState(false);
  const [verError, setVerError] = useState('');
  const [verStatus, setVerStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Batch verify tab
  const [batchFmt, setBatchFmt] = useState<Fmt>('hex');
  const [batchPubKey, setBatchPubKey] = useState('');
  const [batchEntries, setBatchEntries] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [batchResults, setBatchResults] = useState<{ msg: string; sig: string; valid: boolean }[]>([]);

  const inputCls = 'bg-[#100c00] border-[#2a1e00] text-[#e0c060] placeholder-[#3a2800] font-mono text-xs focus:ring-1 focus:ring-[#7a5010] focus:border-[#7a5010]';
  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-[#7a6020]';

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenError('');
    setKeypair(null);
    setRawKP(null);
    setGenLoading(true);
    try {
      const kp = await crypto.subtle.generateKey(
        { name: 'Ed25519' },
        true,
        ['sign', 'verify']
      );
      const pubRaw = await crypto.subtle.exportKey('raw', kp.publicKey);
      const privJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
      // Extract raw private key seed (d field in JWK is base64url of the 32-byte seed)
      const privSeed = privJwk.d
        ? Uint8Array.from(atob(privJwk.d.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
        : new Uint8Array(0);
      setRawKP(kp);
      setKeypair({
        pub: encode(new Uint8Array(pubRaw), fmt),
        priv: encode(privSeed, fmt),
      });
    } catch (e: any) {
      // Ed25519 may not be supported in all browsers — fallback message
      if (e.name === 'NotSupportedError' || e.message?.includes('algorithm')) {
        setGenError('Ed25519 requires a modern browser with WebCrypto Ed25519 support (Chrome 113+, Firefox 119+, Safari 17+).');
      } else {
        setGenError(e.message || 'Key generation failed.');
      }
    } finally {
      setGenLoading(false);
    }
  }, [fmt]);

  // ── Sign ────────────────────────────────────────────────────────────────────
  const handleSign = useCallback(async () => {
    setSignError('');
    setSignature('');
    setSignPubKey('');
    if (!signPrivKey.trim() || !signMessage.trim()) return setSignError('Private key and message are required.');
    setSignLoading(true);
    try {
      // Import private key from raw seed via JWK
      const privSeedBytes = decode(signPrivKey.trim(), signFmt);
      if (privSeedBytes.length !== 32) throw new Error('Private key must be 32 bytes.');

      // Build JWK from raw seed
      const d = btoa(String.fromCharCode(...privSeedBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      // We need the public key too — derive it by importing as PKCS8 is complex;
      // use WebCrypto importKey with jwk but we need x (public).
      // Strategy: if we have rawKP and the priv matches, use it. Otherwise ask user for pub key.
      // For simplicity, import using the SubtleCrypto Ed25519 JWK with both d and x.
      // If we have rawKP cached, export x from it.
      let privCK: CryptoKey;
      let pubCK: CryptoKey;

      if (rawKP) {
        // Use cached keypair directly
        const cachedPubRaw = await crypto.subtle.exportKey('raw', rawKP.publicKey);
        const cachedPrivJwk = await crypto.subtle.exportKey('jwk', rawKP.privateKey);
        const cachedSeed = cachedPrivJwk.d
          ? Uint8Array.from(atob(cachedPrivJwk.d.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
          : new Uint8Array(0);
        const cachedSeedEnc = encode(cachedSeed, signFmt);

        if (cachedSeedEnc.toLowerCase() === signPrivKey.trim().toLowerCase()) {
          privCK = rawKP.privateKey;
          pubCK = rawKP.publicKey;
          const pubRaw = await crypto.subtle.exportKey('raw', pubCK);
          setSignPubKey(encode(new Uint8Array(pubRaw), signFmt));
        } else {
          throw new Error('Private key does not match the generated keypair. Please generate a new keypair first, then sign.');
        }
      } else {
        throw new Error('Please generate a keypair first, then use "Use in Sign tab" to sign messages. Importing arbitrary raw seeds is not directly supported by WebCrypto Ed25519.');
      }

      const msgBytes = new TextEncoder().encode(signMessage);
      const sigBuf = await crypto.subtle.sign({ name: 'Ed25519' }, privCK, msgBytes);
      setSignature(encode(new Uint8Array(sigBuf), signFmt));
    } catch (e: any) {
      setSignError(e.message || 'Signing failed.');
    } finally {
      setSignLoading(false);
    }
  }, [signPrivKey, signMessage, signFmt, rawKP]);

  // ── Verify ──────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    setVerError('');
    setVerStatus('idle');
    if (!verPubKey.trim() || !verMessage.trim() || !verSignature.trim())
      return setVerError('Public key, message, and signature are all required.');
    setVerLoading(true);
    try {
      const pubBytes = decode(verPubKey.trim(), verFmt);
      if (pubBytes.length !== 32) throw new Error('Public key must be 32 bytes.');
      const sigBytes = decode(verSignature.trim(), verFmt);
      if (sigBytes.length !== 64) throw new Error('Signature must be 64 bytes.');

      const pubCK = await crypto.subtle.importKey(
        'raw', pubBytes, { name: 'Ed25519' }, false, ['verify']
      );
      const msgBytes = new TextEncoder().encode(verMessage);
      const valid = await crypto.subtle.verify({ name: 'Ed25519' }, pubCK, sigBytes, msgBytes);
      setVerStatus(valid ? 'valid' : 'invalid');
    } catch (e: any) {
      setVerError(e.message || 'Verification failed. Check key/signature format and length.');
    } finally {
      setVerLoading(false);
    }
  }, [verPubKey, verMessage, verSignature, verFmt]);

  // ── Batch Verify ─────────────────────────────────────────────────────────────
  const handleBatchVerify = useCallback(async () => {
    setBatchError('');
    setBatchResults([]);
    if (!batchPubKey.trim() || !batchEntries.trim())
      return setBatchError('Public key and at least one message:signature pair are required.');
    setBatchLoading(true);
    try {
      const pubBytes = decode(batchPubKey.trim(), batchFmt);
      if (pubBytes.length !== 32) throw new Error('Public key must be 32 bytes.');
      const pubCK = await crypto.subtle.importKey('raw', pubBytes, { name: 'Ed25519' }, false, ['verify']);

      // Parse entries: each line is "message::signature"
      const lines = batchEntries.split('\n').map(l => l.trim()).filter(Boolean);
      const results: { msg: string; sig: string; valid: boolean }[] = [];

      for (const line of lines) {
        const sepIdx = line.indexOf('::');
        if (sepIdx === -1) {
          results.push({ msg: line, sig: '', valid: false });
          continue;
        }
        const msg = line.slice(0, sepIdx).trim();
        const sigStr = line.slice(sepIdx + 2).trim();
        try {
          const sigBytes = decode(sigStr, batchFmt);
          const msgBytes = new TextEncoder().encode(msg);
          const valid = await crypto.subtle.verify({ name: 'Ed25519' }, pubCK, sigBytes, msgBytes);
          results.push({ msg, sig: sigStr, valid });
        } catch {
          results.push({ msg, sig: sigStr, valid: false });
        }
      }
      setBatchResults(results);
    } catch (e: any) {
      setBatchError(e.message || 'Batch verification failed.');
    } finally {
      setBatchLoading(false);
    }
  }, [batchPubKey, batchEntries, batchFmt]);

  // Auto-fill sign tab from generated keypair
  const autoFillSign = useCallback(async () => {
    if (!keypair) return;
    setSignPrivKey(keypair.priv);
    setSignFmt(fmt);
  }, [keypair, fmt]);

  // Auto-fill verify tab from sign result
  const autoFillVerify = useCallback(() => {
    if (!signature || !signPubKey) return;
    setVerPubKey(signPubKey);
    setVerSignature(signature);
    setVerMessage(signMessage);
    setVerFmt(signFmt);
  }, [signature, signPubKey, signMessage, signFmt]);

  return (
    <div className="min-h-screen w-full p-4 md:p-8"
      style={{ background: 'radial-gradient(ellipse at 30% 0%, #120900 0%, #0c0600 50%, #080400 100%)', fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'conic-gradient(from 90deg, #3a1a00, #c06010, #3a1a00)' }}>
            <PenLine size={14} className="text-[#ffc040]" />
          </div>
          <h1 className="text-2xl font-bold text-[#f0a830]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            Ed25519
          </h1>
          <Badge className="bg-[#1a0c00] text-[#c07020] border border-[#3a2000] text-[10px] font-mono">
            Digital Signatures
          </Badge>
        </div>
        <p className="text-[#4a3010] text-[11px] font-mono ml-11">
          Edwards-curve Digital Signature Algorithm · RFC 8032 · WebCrypto API · 64-byte signatures
        p</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="generate">
          <TabsList className="bg-[#0c0600] border border-[#2a1a00] mb-6 w-full grid grid-cols-4">
            {['generate', 'sign', 'verify', 'batch'].map((t) => (
              <TabsTrigger key={t} value={t}
                className="font-mono text-[10px] uppercase tracking-widest text-[#4a3010] data-[state=active]:bg-[#1a0e00] data-[state=active]:text-[#e0a030]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── GENERATE ──────────────────────────────────────────────────── */}
          <TabsContent value="generate">
            <Card className="bg-[#0c0600] border-[#2a1a00] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a3010] font-mono">
                  Generates an Ed25519 keypair using the browser's WebCrypto API. The 32-byte public
                  key is used for verification; keep the 32-byte private key seed secret.
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
                  className="w-full bg-[#1a0e00] hover:bg-[#241400] border border-[#5a3010] text-[#e0a030] font-mono text-[10px] uppercase tracking-widest">
                  <RefreshCw size={13} className={`mr-2 ${genLoading ? 'animate-spin' : ''}`} />
                  {genLoading ? 'Generating…' : 'Generate Keypair'}
                </Button>

                {keypair && (
                  <div className="space-y-3 pt-2 border-t border-[#1a0e00]">
                    <Field label="Public Key (32 bytes)" value={keypair.pub} />
                    <Field label="Private Key seed (32 bytes) — keep secret" value={keypair.priv} danger />
                    <div className="bg-[#0e0800] border border-[#2a1a00] rounded px-3 py-2 text-[10px] font-mono text-[#4a3010]">
                      ℹ Ed25519 private keys are derived by SHA-512 hashing this 32-byte seed. The
                      public key is the compressed Edwards curve point. Both are 32 bytes.
                    </div>
                    <Button variant="outline" size="sm" onClick={autoFillSign}
                      className="text-[10px] font-mono border-[#2a1a00] text-[#6a4820] hover:bg-[#1a0e00] hover:text-[#e0a030]">
                      ↗ Use this keypair in Sign tab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SIGN ──────────────────────────────────────────────────────── */}
          <TabsContent value="sign">
            <Card className="bg-[#0c0600] border-[#2a1a00] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a3010] font-mono">
                  Sign an arbitrary message with your Ed25519 private key. The 64-byte signature can
                  be verified by anyone holding the corresponding public key.
                </p>

                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Key/Signature format</Label>
                  <FmtToggle value={signFmt} onChange={setSignFmt} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Private Key seed (32 bytes)</Label>
                  <Input placeholder={`32-byte private key seed as ${signFmt}…`} value={signPrivKey}
                    onChange={(e) => setSignPrivKey(e.target.value)} className={inputCls} />
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
                  className="w-full bg-[#1a0e00] hover:bg-[#241400] border border-[#5a3010] text-[#e0a030] font-mono text-[10px] uppercase tracking-widest">
                  {signLoading ? 'Signing…' : 'Sign Message'}
                </Button>

                {signature && (
                  <div className="space-y-3 pt-2 border-t border-[#1a0e00]">
                    <Field label={`Signature (64 bytes) — ${signFmt}`} value={signature} />
                    <Field label={`Corresponding Public Key — ${signFmt}`} value={signPubKey} />
                    <Button variant="outline" size="sm" onClick={autoFillVerify}
                      className="text-[10px] font-mono border-[#2a1a00] text-[#6a4820] hover:bg-[#1a0e00] hover:text-[#e0a030]">
                      ↗ Send to Verify tab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VERIFY ────────────────────────────────────────────────────── */}
          <TabsContent value="verify">
            <Card className="bg-[#0c0600] border-[#2a1a00] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a3010] font-mono">
                  Verify a signature against a message and public key. No private key needed —
                  verification is a public operation.
                </p>

                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Input format</Label>
                  <FmtToggle value={verFmt} onChange={setVerFmt} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Public Key (32 bytes)</Label>
                  <Input placeholder={`32-byte public key as ${verFmt}…`} value={verPubKey}
                    onChange={(e) => setVerPubKey(e.target.value)} className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Message</Label>
                  <Textarea placeholder="Original message that was signed…" value={verMessage}
                    onChange={(e) => setVerMessage(e.target.value)}
                    className={inputCls + ' min-h-[80px]'} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Signature (64 bytes)</Label>
                  <Input placeholder={`64-byte signature as ${verFmt}…`} value={verSignature}
                    onChange={(e) => setVerSignature(e.target.value)} className={inputCls} />
                </div>

                {verError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {verError}
                  </div>
                )}

                <Button onClick={handleVerify} disabled={verLoading}
                  className="w-full bg-[#1a0e00] hover:bg-[#241400] border border-[#5a3010] text-[#e0a030] font-mono text-[10px] uppercase tracking-widest">
                  {verLoading ? 'Verifying…' : 'Verify Signature'}
                </Button>

                {verStatus !== 'idle' && (
                  <div className={`flex items-center gap-3 rounded px-4 py-3 border font-mono text-xs ${verStatus === 'valid' ? 'bg-[#0e0c00] border-[#6a5010] text-[#e0c040]' : 'bg-red-950/30 border-red-800/40 text-red-400'}`}>
                    {verStatus === 'valid'
                      ? <><ShieldCheck size={18} className="text-[#e0c040]" /><span>Signature valid — message is authentic and unmodified.</span></>
                      : <><ShieldX size={18} /><span>Signature invalid — message may be tampered with, or wrong key/signature.</span></>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BATCH VERIFY ──────────────────────────────────────────────── */}
          <TabsContent value="batch">
            <Card className="bg-[#0c0600] border-[#2a1a00] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-[11px] text-[#4a3010] font-mono">
                  Verify multiple message–signature pairs against a single public key. One pair per
                  line in the format: <span className="text-[#8a6020]">message::signature</span>
                </p>

                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Input format</Label>
                  <FmtToggle value={batchFmt} onChange={setBatchFmt} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Public Key (32 bytes)</Label>
                  <Input placeholder={`32-byte public key as ${batchFmt}…`} value={batchPubKey}
                    onChange={(e) => setBatchPubKey(e.target.value)} className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label className={labelCls}>Message::Signature pairs (one per line)</Label>
                  <Textarea
                    placeholder={`hello world::${batchFmt === 'hex' ? 'a1b2c3...128hexchars' : 'base64sig=='}\nanother message::signature2`}
                    value={batchEntries}
                    onChange={(e) => setBatchEntries(e.target.value)}
                    className={inputCls + ' min-h-[120px]'} />
                </div>

                {batchError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} /> {batchError}
                  </div>
                )}

                <Button onClick={handleBatchVerify} disabled={batchLoading}
                  className="w-full bg-[#1a0e00] hover:bg-[#241400] border border-[#5a3010] text-[#e0a030] font-mono text-[10px] uppercase tracking-widest">
                  {batchLoading ? 'Verifying…' : 'Batch Verify'}
                </Button>

                {batchResults.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#1a0e00]">
                    <div className="flex items-center justify-between">
                      <Label className={labelCls}>Results ({batchResults.length} entries)</Label>
                      <span className="text-[10px] font-mono text-[#4a3010]">
                        {batchResults.filter(r => r.valid).length} valid /  {batchResults.filter(r => !r.valid).length} invalid
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {batchResults.map((r, i) => (
                        <div key={i} className={`flex items-start gap-2 rounded px-3 py-2 border text-[10px] font-mono ${r.valid ? 'bg-[#0e0c00] border-[#4a3800] text-[#c0a030]' : 'bg-red-950/20 border-red-900/30 text-red-400'}`}>
                          <span className="mt-0.5 shrink-0">{r.valid ? '✓' : '✗'}</span>
                          <div className="min-w-0">
                            <div className="truncate text-[#8a6820]">{r.msg || '(empty message)'}</div>
                            <div className="truncate opacity-50">{r.sig ? r.sig.slice(0, 32) + '…' : '(no signature)'}</div>
                          </div>
                        </div>
                      ))}
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
            ['Ed25519', 'Algorithm'],
            ['Edwards25519', 'Curve'],
            ['64 bytes', 'Signature size'],
            ['RFC 8032', 'Standard'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#0c0600] border border-[#1a0e00] rounded p-3">
              <div className="text-[#a07020] font-mono text-[10px] font-bold">{val}</div>
              <div className="text-[#3a2800] font-mono text-[9px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ed25519Tool;