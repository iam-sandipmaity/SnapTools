import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Clipboard, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CryptoJS from 'crypto-js';

type ChaCha20Impl = {
  encrypt(message: string, key: string): Promise<{ toString(): string }>;
  decrypt(ciphertext: string, key: string): Promise<{ toString(): string }>;
};
type ChaCha20Crypto = typeof CryptoJS & { ChaCha20Poly1305?: ChaCha20Impl };

async function getImpl(): Promise<ChaCha20Impl> {
  let impl = (CryptoJS as ChaCha20Crypto).ChaCha20Poly1305;
  if (!impl) {
    await import('@/lib/crypto-polyfills/chacha20poly1305');
    impl = (CryptoJS as ChaCha20Crypto).ChaCha20Poly1305;
  }
  if (!impl) throw new Error('ChaCha20-Poly1305 polyfill failed to load');
  return impl;
}

function validate(input: string, key: string, toast: ReturnType<typeof useToast>['toast']): boolean {
  if (!input.trim()) {
    toast({ variant: 'destructive', title: 'Input Required', description: 'Please enter text to encrypt or decrypt' });
    return false;
  }
  if (input.length > 10_000) {
    toast({ variant: 'destructive', title: 'Input Too Long', description: 'Input must not exceed 10,000 characters' });
    return false;
  }
  if (!key.trim()) {
    toast({ variant: 'destructive', title: 'Key Required', description: 'Please enter an encryption key' });
    return false;
  }
  if (key.length < 8) {
    toast({ variant: 'destructive', title: 'Key Too Short', description: 'Key must be at least 8 characters' });
    return false;
  }
  return true;
}

const Chacha20Poly1305Tool: React.FC = () => {
  const [input, setInput]     = useState('');
  const [key, setKey]         = useState('');
  const [output, setOutput]   = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const encrypt = async () => {
    if (!validate(input, key, toast)) return;
    setLoading(true);
    try {
      const impl = await getImpl();
      const result = await impl.encrypt(input, key);
      setOutput(result.toString());
    } catch (err) {
      toast({ variant: 'destructive', title: 'Encryption Error', description: err instanceof Error ? err.message : 'Failed to encrypt' });
    } finally {
      setLoading(false);
    }
  };

  const decrypt = async () => {
    if (!validate(input, key, toast)) return;
    setLoading(true);
    try {
      const impl = await getImpl();
      const result = await impl.decrypt(input, key);
      const plain = result.toString();
      if (!plain) throw new Error('Wrong key or invalid ciphertext');
      setOutput(plain);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Decryption Error', description: err instanceof Error ? err.message : 'Failed to decrypt' });
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Copied to clipboard' });
    } catch {
      toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy to clipboard' });
    }
  };

  const paste = async () => {
    try { setInput(await navigator.clipboard.readText()); }
    catch { toast({ variant: 'destructive', title: 'Paste Failed', description: 'Could not read clipboard' }); }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">

          {/* Header */}
          <div className="space-y-2 mb-6 text-sm text-muted-foreground">
            <p className="text-2xl font-bold text-foreground">ChaCha20-Poly1305</p>
            <p>
              ChaCha20-Poly1305 is a modern authenticated encryption algorithm (AEAD) specified in
              RFC 8439. It combines the ChaCha20 stream cipher with the Poly1305 message
              authentication code to provide both confidentiality and integrity in one pass.
            </p>
            <div className="mt-3 space-y-1">
              <p className="font-medium text-foreground">Key properties:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>256-bit security — immune to timing attacks by design</li>
                <li>Authenticated encryption — any tampering is detected on decryption</li>
                <li>Unique random nonce per message — same plaintext + key always produces different ciphertext</li>
                <li>Key is stretched via PBKDF2-SHA256 (100k iterations) from your password</li>
              </ul>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label>Input Text</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter plaintext to encrypt, or paste ciphertext to decrypt"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="min-h-[100px] font-mono text-xs"
                maxLength={10_000}
              />
              <Button variant="outline" size="icon" onClick={paste} title="Paste from clipboard">
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Key */}
          <div className="space-y-2">
            <Label>Encryption Key (password)</Label>
            <div className="flex gap-2">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter key (min 8 characters)"
                value={key}
                onChange={e => setKey(e.target.value)}
              />
              <Button variant="outline" size="icon" onClick={() => setShowKey(s => !s)} title={showKey ? 'Hide key' : 'Show key'}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={encrypt} disabled={loading} className="flex-1">
              {loading ? 'Working…' : 'Encrypt'}
            </Button>
            <Button onClick={decrypt} disabled={loading} className="flex-1">
              {loading ? 'Working…' : 'Decrypt'}
            </Button>
          </div>

          {/* Output */}
          {output && (
            <div className="space-y-2">
              <Label>Output</Label>
              <div className="flex gap-2">
                <Textarea value={output} readOnly className="min-h-[100px] font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copy(output)} title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
};

export default Chacha20Poly1305Tool;