import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Clipboard, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CryptoJS from 'crypto-js';

type XChaCha20Impl = {
  encrypt(message: string, key: string): Promise<{ toString(): string }>;
  decrypt(ciphertext: string, key: string): Promise<{ toString(): string }>;
};
type XChaCha20Crypto = typeof CryptoJS & { XChaCha20?: XChaCha20Impl };

async function getImpl(): Promise<XChaCha20Impl> {
  let impl = (CryptoJS as XChaCha20Crypto).XChaCha20;
  if (!impl) {
    await import('@/lib/crypto-polyfills/xchacha20');
    impl = (CryptoJS as XChaCha20Crypto).XChaCha20;
  }
  if (!impl) throw new Error('XChaCha20 polyfill failed to load');
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

const XChaCha20Tool: React.FC = () => {
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
      const impl   = await getImpl();
      const result = await impl.encrypt(input, key);
      setOutput(result.toString());
    } catch (err) {
      toast({ variant: 'destructive', title: 'Encryption Error', description: err instanceof Error ? err.message : 'Failed to encrypt' });
    } finally { setLoading(false); }
  };

  const decrypt = async () => {
    if (!validate(input, key, toast)) return;
    setLoading(true);
    try {
      const impl   = await getImpl();
      const result = await impl.decrypt(input, key);
      const plain  = result.toString();
      if (!plain) throw new Error('Wrong key or invalid ciphertext');
      setOutput(plain);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Decryption Error', description: err instanceof Error ? err.message : 'Failed to decrypt' });
    } finally { setLoading(false); }
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

          <div className="space-y-2 mb-6 text-sm text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground">XChaCha20-Poly1305</h2>
            <p>
              XChaCha20 is an extended-nonce variant of ChaCha20 (draft-irtf-cfrg-xchacha).
              It uses a <strong>192-bit (24-byte) nonce</strong> instead of ChaCha20's 96-bit nonce,
              which makes it safe to generate nonces randomly without a counter — the probability
              of collision is negligible even after billions of messages.
            </p>
            <div className="mt-3 space-y-1">
              <p className="font-medium text-foreground">How it works:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>HChaCha20</strong> derives a 256-bit subkey from your key and the first 16 bytes of the nonce</li>
                <li><strong>ChaCha20</strong> uses the subkey + remaining 8 nonce bytes to generate the keystream</li>
                <li><strong>Poly1305</strong> authenticates the ciphertext — any tampering is detected on decryption</li>
                <li>Your password is stretched to 256 bits via PBKDF2-SHA256 (100k iterations)</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Wire format: <code>base64(salt[16] || nonce[24] || ciphertext || tag[16])</code>
            </p>
          </div>

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

          <div className="space-y-2">
            <Label>Encryption Key (password)</Label>
            <div className="flex gap-2">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter key (min 8 characters)"
                value={key}
                onChange={e => setKey(e.target.value)}
              />
              <Button variant="outline" size="icon" onClick={() => setShowKey(s => !s)} title={showKey ? 'Hide' : 'Show'}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={encrypt} disabled={loading} className="flex-1">
              {loading ? 'Working…' : 'Encrypt'}
            </Button>
            <Button onClick={decrypt} disabled={loading} className="flex-1">
              {loading ? 'Working…' : 'Decrypt'}
            </Button>
          </div>

          {output && (
            <div className="space-y-2">
              <Label>Output</Label>
              <div className="flex gap-2">
                <Textarea value={output} readOnly className="min-h-[100px] font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copy(output)} title="Copy">
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

export default XChaCha20Tool;