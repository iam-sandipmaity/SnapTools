/**
 * PBKDF2 Key Derivation Function Tool Component
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

// Encode a string as UTF-8 bytes
function encodeUTF8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// ---------------------------------------------------------------------------
// Core PBKDF2 via Web Crypto API (always available in modern browsers)
// ---------------------------------------------------------------------------

async function derivePBKDF2(
  password: string,
  saltBytes: Uint8Array,
  iterations: number,
  hash: 'SHA-1' | 'SHA-256' | 'SHA-512',
  keyLengthBytes: number
): Promise<Uint8Array> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encodeUTF8(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash,
      salt: saltBytes,
      iterations,
    },
    passwordKey,
    keyLengthBytes * 8
  );

  return new Uint8Array(derivedBits);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HASH_OPTIONS: { value: string; label: string; subtle: 'SHA-1' | 'SHA-256' | 'SHA-512' }[] = [
  { value: 'sha256', label: 'SHA-256', subtle: 'SHA-256' },
  { value: 'sha512', label: 'SHA-512', subtle: 'SHA-512' },
  { value: 'sha1',   label: 'SHA-1',   subtle: 'SHA-1'   },
];

const PBKDF2Tool: React.FC = () => {
  const [input, setInput]           = useState('');
  const [salt, setSalt]             = useState('');
  const [iterations, setIterations] = useState('10000');
  const [hashFunction, setHashFunction] = useState('sha256');
  const [output, setOutput]         = useState('');
  const [loading, setLoading]       = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!input) {
      toast({ title: 'Error', description: 'Please enter a password', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Salt: use provided string as UTF-8, or generate 16 random bytes
      const saltBytes: Uint8Array = salt
        ? encodeUTF8(salt)
        : crypto.getRandomValues(new Uint8Array(16));

      const iter = parseInt(iterations, 10);
      const hashOpt = HASH_OPTIONS.find((h) => h.value === hashFunction) ?? HASH_OPTIONS[0];

      const derived = await derivePBKDF2(input, saltBytes, iter, hashOpt.subtle, 32);

      // Encode salt and key for display
      const saltHex    = toHex(saltBytes);
      const derivedHex = toHex(derived);

      setOutput(`$pbkdf2$i=${iter},h=${hashFunction}$${saltHex}$${derivedHex}`);
    } catch (err) {
      console.error('PBKDF2 error:', err);
      toast({
        title: 'Error',
        description: 'Failed to derive key. Your browser may not support the Web Crypto API.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      toast({ title: 'Copied', description: 'Key copied to clipboard' });
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2 mb-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">PBKDF2 Key Derivation</p>
            <p>
              PBKDF2 applies a pseudorandom function (HMAC) multiple times to derive a
              secure cryptographic key from a password. The high iteration count makes
              brute-force attacks computationally expensive.
            </p>
            <div className="mt-4">
              <p className="font-medium text-foreground mb-2">Security Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use at least 10,000 iterations (NIST recommendation)</li>
                <li>Prefer SHA-256 or SHA-512 over SHA-1</li>
                <li>Always use a cryptographically secure random salt</li>
              </ul>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Salt */}
          <div className="space-y-2">
            <Label>Salt (optional — leave blank to generate randomly)</Label>
            <Input
              placeholder="Enter salt value"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
            />
          </div>

          {/* Iterations */}
          <div className="space-y-2">
            <Label>Iterations</Label>
            <Select value={iterations} onValueChange={setIterations}>
              <SelectTrigger>
                <SelectValue placeholder="Select iterations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1,000</SelectItem>
                <SelectItem value="10000">10,000</SelectItem>
                <SelectItem value="100000">100,000</SelectItem>
                <SelectItem value="200000">200,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hash function */}
          <div className="space-y-2">
            <Label>Hash Function</Label>
            <Select value={hashFunction} onValueChange={setHashFunction}>
              <SelectTrigger>
                <SelectValue placeholder="Select hash function" />
              </SelectTrigger>
              <SelectContent>
                {HASH_OPTIONS.map((h) => (
                  <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? 'Deriving key…' : 'Generate Key'}
          </Button>

          {output && (
            <div className="space-y-2">
              <Label>Derived Key</Label>
              <div className="relative">
                <Input value={output} readOnly className="pr-20 font-mono text-xs" />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleCopy}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PBKDF2Tool;