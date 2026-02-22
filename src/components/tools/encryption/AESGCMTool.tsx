import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, ShieldCheck, ShieldX, Eye, EyeOff } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  if (clean.length % 2 !== 0) throw new Error('Invalid hex length');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function base64ToBuf(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function parseBuf(value: string, format: 'hex' | 'base64'): Uint8Array {
  return format === 'hex' ? hexToBuf(value) : base64ToBuf(value);
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 200_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface EncryptResult {
  ciphertext: string;
  tag: string;
  iv: string;
  salt: string;
}

type OutputFormat = 'hex' | 'base64';

// ─── Sub-components ──────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handle}
      title="Copy"
      className="p-1.5 rounded hover:bg-white/10 transition-colors text-[#a0c4b8]"
    >
      {copied ? <Check size={14} className="text-[#4de0b0]" /> : <Copy size={14} />}
    </button>
  );
}

function OutputRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-[#5a8a7a]">{label}</span>
        <CopyButton text={value} />
      </div>
      <div className="font-mono text-xs bg-[#0a1a14] border border-[#1a3a2a] rounded px-3 py-2 break-all text-[#80d4b0] select-all">
        {value}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const AESGCMTool: React.FC = () => {
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [plaintext, setPlaintext] = useState('');
  const [aad, setAad] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('hex');
  const [encResult, setEncResult] = useState<EncryptResult | null>(null);
  const [encError, setEncError] = useState('');
  const [encLoading, setEncLoading] = useState(false);

  // Decrypt state
  const [decCiphertext, setDecCiphertext] = useState('');
  const [decTag, setDecTag] = useState('');
  const [decIv, setDecIv] = useState('');
  const [decSalt, setDecSalt] = useState('');
  const [decPassphrase, setDecPassphrase] = useState('');
  const [decAad, setDecAad] = useState('');
  const [decShowPass, setDecShowPass] = useState(false);
  const [decResult, setDecResult] = useState('');
  const [decError, setDecError] = useState('');
  const [decLoading, setDecLoading] = useState(false);
  const [decInputFormat, setDecInputFormat] = useState<OutputFormat>('hex');

  // Verify state
  const [verCiphertext, setVerCiphertext] = useState('');
  const [verTag, setVerTag] = useState('');
  const [verIv, setVerIv] = useState('');
  const [verSalt, setVerSalt] = useState('');
  const [verPassphrase, setVerPassphrase] = useState('');
  const [verAad, setVerAad] = useState('');
  const [verShowPass, setVerShowPass] = useState(false);
  const [verStatus, setVerStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [verError, setVerError] = useState('');
  const [verLoading, setVerLoading] = useState(false);
  const [verInputFormat, setVerInputFormat] = useState<OutputFormat>('hex');

  // ── Encrypt ────────────────────────────────────────────────────────────────
  const handleEncrypt = useCallback(async () => {
    setEncError('');
    setEncResult(null);
    if (!passphrase) return setEncError('Passphrase is required.');
    if (!plaintext) return setEncError('Plaintext is required.');
    setEncLoading(true);
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(passphrase, salt);
      const enc = new TextEncoder();
      const additionalData = aad ? enc.encode(aad) : undefined;

      const ciphertextWithTag = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: 128, ...(additionalData ? { additionalData } : {}) },
        key,
        enc.encode(plaintext)
      );

      // WebCrypto appends the 16-byte tag at the end of ciphertext
      const ctBuf = ciphertextWithTag.slice(0, ciphertextWithTag.byteLength - 16);
      const tagBuf = ciphertextWithTag.slice(ciphertextWithTag.byteLength - 16);

      const fmt = outputFormat === 'hex' ? bufToHex : bufToBase64;
      setEncResult({
        ciphertext: fmt(ctBuf),
        tag: fmt(tagBuf),
        iv: fmt(iv.buffer),
        salt: fmt(salt.buffer),
      });
    } catch (e: any) {
      setEncError(e.message || 'Encryption failed.');
    } finally {
      setEncLoading(false);
    }
  }, [passphrase, plaintext, aad, outputFormat]);

  // ── Decrypt ────────────────────────────────────────────────────────────────
  const handleDecrypt = useCallback(async () => {
    setDecError('');
    setDecResult('');
    if (!decPassphrase || !decCiphertext || !decTag || !decIv || !decSalt)
      return setDecError('All fields (passphrase, ciphertext, tag, IV, salt) are required.');
    setDecLoading(true);
    try {
      const fmt = decInputFormat;
      const saltBuf = parseBuf(decSalt, fmt);
      const ivBuf = parseBuf(decIv, fmt);
      const ctBuf = parseBuf(decCiphertext, fmt);
      const tagBuf = parseBuf(decTag, fmt);

      const key = await deriveKey(decPassphrase, saltBuf);

      // Recombine ciphertext + tag for WebCrypto
      const combined = new Uint8Array(ctBuf.length + tagBuf.length);
      combined.set(ctBuf);
      combined.set(tagBuf, ctBuf.length);

      const enc = new TextEncoder();
      const additionalData = decAad ? enc.encode(decAad) : undefined;

      const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf, tagLength: 128, ...(additionalData ? { additionalData } : {}) },
        key,
        combined
      );
      setDecResult(new TextDecoder().decode(plainBuf));
    } catch (e: any) {
      setDecError('Decryption failed — wrong passphrase, corrupted data, or mismatched AAD.');
    } finally {
      setDecLoading(false);
    }
  }, [decPassphrase, decCiphertext, decTag, decIv, decSalt, decAad, decInputFormat]);

  // ── Verify Tag ─────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    setVerError('');
    setVerStatus('idle');
    if (!verPassphrase || !verCiphertext || !verTag || !verIv || !verSalt)
      return setVerError('All fields are required for tag verification.');
    setVerLoading(true);
    try {
      const fmt = verInputFormat;
      const saltBuf = parseBuf(verSalt, fmt);
      const ivBuf = parseBuf(verIv, fmt);
      const ctBuf = parseBuf(verCiphertext, fmt);
      const tagBuf = parseBuf(verTag, fmt);

      const key = await deriveKey(verPassphrase, saltBuf);
      const combined = new Uint8Array(ctBuf.length + tagBuf.length);
      combined.set(ctBuf);
      combined.set(tagBuf, ctBuf.length);

      const enc = new TextEncoder();
      const additionalData = verAad ? enc.encode(verAad) : undefined;

      await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf, tagLength: 128, ...(additionalData ? { additionalData } : {}) },
        key,
        combined
      );
      setVerStatus('valid');
    } catch {
      setVerStatus('invalid');
    } finally {
      setVerLoading(false);
    }
  }, [verPassphrase, verCiphertext, verTag, verIv, verSalt, verAad, verInputFormat]);

  // ─── Shared styles ──────────────────────────────────────────────────────────
  const inputCls =
    'bg-[#0a1a14] border-[#1a3a2a] text-[#c0e8d8] placeholder-[#2a5a44] font-mono text-sm focus:ring-1 focus:ring-[#2a7a5a] focus:border-[#2a7a5a]';
  const labelCls = 'text-xs font-mono uppercase tracking-widest text-[#5a8a7a]';
  const sectionCls = 'space-y-3';

  return (
    <div
      className="min-h-screen w-full p-4 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #040e09 0%, #071410 50%, #040e09 100%)',
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-[#2a9a6a] rounded-full" />
          <h1 className="text-2xl font-bold tracking-tight text-[#80ffc8]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            AES-GCM
          </h1>
          <Badge className="bg-[#0a2a1a] text-[#40c080] border border-[#1a4a2a] text-xs font-mono">
            256-bit · AEAD
          </Badge>
        </div>
        <p className="text-[#3a6a54] text-xs font-mono ml-5">
          Authenticated Encryption with Associated Data — WebCrypto API · PBKDF2 key derivation
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="encrypt">
          <TabsList className="bg-[#071410] border border-[#1a3a2a] mb-6 w-full grid grid-cols-3">
            {['encrypt', 'decrypt', 'verify'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="font-mono text-xs uppercase tracking-widest text-[#3a6a54] data-[state=active]:bg-[#0d2a1e] data-[state=active]:text-[#60d090]"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── ENCRYPT ─────────────────────────────────────────────────────── */}
          <TabsContent value="encrypt">
            <Card className="bg-[#071410] border-[#1a3a2a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <div className={sectionCls}>
                  <Label className={labelCls}>Passphrase</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter passphrase…"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className={inputCls + ' pr-10'}
                    />
                    <button
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3a6a54] hover:text-[#60d090]"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className={sectionCls}>
                  <Label className={labelCls}>Plaintext</Label>
                  <Textarea
                    placeholder="Text to encrypt…"
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    className={inputCls + ' min-h-[90px]'}
                  />
                </div>

                <div className={sectionCls}>
                  <Label className={labelCls}>
                    Additional Authenticated Data (AAD)
                    <span className="ml-2 text-[#2a4a3a] normal-case tracking-normal">optional</span>
                  </Label>
                  <Input
                    placeholder="Associated data (not encrypted, but authenticated)…"
                    value={aad}
                    onChange={(e) => setAad(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Output format */}
                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Output</Label>
                  <div className="flex gap-1">
                    {(['hex', 'base64'] as OutputFormat[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setOutputFormat(f)}
                        className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                          outputFormat === f
                            ? 'bg-[#0d2a1e] border-[#2a7a5a] text-[#60d090]'
                            : 'bg-transparent border-[#1a3a2a] text-[#3a6a54] hover:border-[#2a5a3a]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {encError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} />
                    {encError}
                  </div>
                )}

                <Button
                  onClick={handleEncrypt}
                  disabled={encLoading}
                  className="w-full bg-[#0d3a22] hover:bg-[#0d4a2a] border border-[#1a5a34] text-[#60e090] font-mono text-xs uppercase tracking-widest"
                >
                  {encLoading ? 'Encrypting…' : 'Encrypt'}
                </Button>

                {encResult && (
                  <div className="space-y-3 pt-2 border-t border-[#0d2a1a]">
                    <OutputRow label="Ciphertext" value={encResult.ciphertext} />
                    <OutputRow label="Auth Tag (GCM)" value={encResult.tag} />
                    <OutputRow label="IV (Nonce)" value={encResult.iv} />
                    <OutputRow label="Salt (PBKDF2)" value={encResult.salt} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DECRYPT ─────────────────────────────────────────────────────── */}
          <TabsContent value="decrypt">
            <Card className="bg-[#071410] border-[#1a3a2a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                {/* Input format toggle */}
                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Input format</Label>
                  <div className="flex gap-1">
                    {(['hex', 'base64'] as OutputFormat[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setDecInputFormat(f)}
                        className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                          decInputFormat === f
                            ? 'bg-[#0d2a1e] border-[#2a7a5a] text-[#60d090]'
                            : 'bg-transparent border-[#1a3a2a] text-[#3a6a54] hover:border-[#2a5a3a]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={sectionCls}>
                  <Label className={labelCls}>Passphrase</Label>
                  <div className="relative">
                    <Input
                      type={decShowPass ? 'text' : 'password'}
                      placeholder="Enter passphrase…"
                      value={decPassphrase}
                      onChange={(e) => setDecPassphrase(e.target.value)}
                      className={inputCls + ' pr-10'}
                    />
                    <button
                      onClick={() => setDecShowPass((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3a6a54] hover:text-[#60d090]"
                    >
                      {decShowPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {[
                  { label: 'Ciphertext', val: decCiphertext, set: setDecCiphertext },
                  { label: 'Auth Tag', val: decTag, set: setDecTag },
                  { label: 'IV (Nonce)', val: decIv, set: setDecIv },
                  { label: 'Salt (PBKDF2)', val: decSalt, set: setDecSalt },
                ].map(({ label, val, set }) => (
                  <div key={label} className={sectionCls}>
                    <Label className={labelCls}>{label}</Label>
                    <Input
                      placeholder={`Paste ${label.toLowerCase()}…`}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                ))}

                <div className={sectionCls}>
                  <Label className={labelCls}>
                    AAD <span className="ml-2 text-[#2a4a3a] normal-case tracking-normal">optional</span>
                  </Label>
                  <Input
                    placeholder="Must match AAD used during encryption…"
                    value={decAad}
                    onChange={(e) => setDecAad(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {decError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} />
                    {decError}
                  </div>
                )}

                <Button
                  onClick={handleDecrypt}
                  disabled={decLoading}
                  className="w-full bg-[#0d3a22] hover:bg-[#0d4a2a] border border-[#1a5a34] text-[#60e090] font-mono text-xs uppercase tracking-widest"
                >
                  {decLoading ? 'Decrypting…' : 'Decrypt'}
                </Button>

                {decResult && (
                  <div className="space-y-2 pt-2 border-t border-[#0d2a1a]">
                    <div className="flex items-center justify-between">
                      <Label className={labelCls}>Decrypted Plaintext</Label>
                      <CopyButton text={decResult} />
                    </div>
                    <Textarea
                      value={decResult}
                      readOnly
                      className={inputCls + ' min-h-[80px] text-[#80ffc8]'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VERIFY ──────────────────────────────────────────────────────── */}
          <TabsContent value="verify">
            <Card className="bg-[#071410] border-[#1a3a2a] shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <p className="text-xs text-[#3a6a54] font-mono">
                  Verifies the GCM authentication tag without returning plaintext. Any modification to
                  ciphertext, tag, or AAD will fail verification.
                </p>

                {/* Input format toggle */}
                <div className="flex items-center gap-3">
                  <Label className={labelCls}>Input format</Label>
                  <div className="flex gap-1">
                    {(['hex', 'base64'] as OutputFormat[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setVerInputFormat(f)}
                        className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                          verInputFormat === f
                            ? 'bg-[#0d2a1e] border-[#2a7a5a] text-[#60d090]'
                            : 'bg-transparent border-[#1a3a2a] text-[#3a6a54] hover:border-[#2a5a3a]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={sectionCls}>
                  <Label className={labelCls}>Passphrase</Label>
                  <div className="relative">
                    <Input
                      type={verShowPass ? 'text' : 'password'}
                      placeholder="Enter passphrase…"
                      value={verPassphrase}
                      onChange={(e) => setVerPassphrase(e.target.value)}
                      className={inputCls + ' pr-10'}
                    />
                    <button
                      onClick={() => setVerShowPass((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3a6a54] hover:text-[#60d090]"
                    >
                      {verShowPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {[
                  { label: 'Ciphertext', val: verCiphertext, set: setVerCiphertext },
                  { label: 'Auth Tag', val: verTag, set: setVerTag },
                  { label: 'IV (Nonce)', val: verIv, set: setVerIv },
                  { label: 'Salt (PBKDF2)', val: verSalt, set: setVerSalt },
                ].map(({ label, val, set }) => (
                  <div key={label} className={sectionCls}>
                    <Label className={labelCls}>{label}</Label>
                    <Input
                      placeholder={`Paste ${label.toLowerCase()}…`}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                ))}

                <div className={sectionCls}>
                  <Label className={labelCls}>
                    AAD <span className="ml-2 text-[#2a4a3a] normal-case tracking-normal">optional</span>
                  </Label>
                  <Input
                    placeholder="Must match AAD used during encryption…"
                    value={verAad}
                    onChange={(e) => setVerAad(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {verError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                    <AlertTriangle size={13} />
                    {verError}
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={verLoading}
                  className="w-full bg-[#0d3a22] hover:bg-[#0d4a2a] border border-[#1a5a34] text-[#60e090] font-mono text-xs uppercase tracking-widest"
                >
                  {verLoading ? 'Verifying…' : 'Verify Tag'}
                </Button>

                {verStatus !== 'idle' && (
                  <div
                    className={`flex items-center gap-3 rounded px-4 py-3 border font-mono text-sm ${
                      verStatus === 'valid'
                        ? 'bg-green-950/30 border-green-800/40 text-green-400'
                        : 'bg-red-950/30 border-red-800/40 text-red-400'
                    }`}
                  >
                    {verStatus === 'valid' ? (
                      <>
                        <ShieldCheck size={18} />
                        <span>Tag valid — data integrity confirmed.</span>
                      </>
                    ) : (
                      <>
                        <ShieldX size={18} />
                        <span>Tag invalid — data may be tampered or key is wrong.</span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer info */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            ['AES-256-GCM', 'Cipher mode'],
            ['PBKDF2 · 200k iter', 'Key derivation'],
            ['96-bit IV · 128-bit tag', 'Parameters'],
          ].map(([val, desc]) => (
            <div key={desc} className="bg-[#071410] border border-[#0d2a1a] rounded p-3">
              <div className="text-[#40b080] font-mono text-xs font-bold">{val}</div>
              <div className="text-[#2a5a3a] font-mono text-[10px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AESGCMTool;