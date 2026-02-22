import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Clipboard, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CryptoJS from 'crypto-js';

type Cast5Impl = {
  encrypt(message: string, key: string): Promise<{ toString(): string }>;
  decrypt(ciphertext: string, key: string): Promise<{ toString(_enc?: unknown): string }>;
};

type Cast5Crypto = typeof CryptoJS & { CAST5?: Cast5Impl };

async function getCast5(): Promise<Cast5Impl> {
  let cast5 = (CryptoJS as Cast5Crypto).CAST5;
  if (!cast5) {
    await import('../../../lib/crypto-polyfills/cast5');
    cast5 = (CryptoJS as Cast5Crypto).CAST5;
  }
  if (!cast5) throw new Error('CAST5 polyfill failed to load');
  return cast5;
}

function validateInputs(input: string, key: string, toast: ReturnType<typeof useToast>['toast']): boolean {
  if (!input.trim()) {
    toast({ variant: 'destructive', title: 'Input Required', description: 'Please enter text to encrypt/decrypt' });
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
  if (key.length > 32) {
    toast({ variant: 'destructive', title: 'Key Too Long', description: 'Key must not exceed 32 characters' });
    return false;
  }
  return true;
}

const CAST5Tool = () => {
  const [input, setInput]       = useState('');
  const [key, setKey]           = useState('');
  const [output, setOutput]     = useState('');
  const [showKey, setShowKey]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const { toast } = useToast();

  const encrypt = async () => {
    if (!validateInputs(input, key, toast)) return;
    setLoading(true);
    try {
      const cast5 = await getCast5();
      const result = await cast5.encrypt(input, key);
      setOutput(result.toString());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Encryption Error',
        description: error instanceof Error ? error.message : 'Failed to encrypt text'
      });
    } finally {
      setLoading(false);
    }
  };

  const decrypt = async () => {
    if (!validateInputs(input, key, toast)) return;
    setLoading(true);
    try {
      const cast5 = await getCast5();
      const result = await cast5.decrypt(input, key);
      const plaintext = result.toString();
      if (!plaintext) throw new Error('Wrong key or invalid ciphertext');
      setOutput(plaintext);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Decryption Error',
        description: error instanceof Error ? error.message : 'Failed to decrypt text'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Text copied to clipboard' });
    } catch {
      toast({ variant: 'destructive', title: 'Copy Failed', description: 'Failed to copy to clipboard' });
    }
  };

  const pasteFromClipboard = async () => {
    try {
      setInput(await navigator.clipboard.readText());
    } catch {
      toast({ variant: 'destructive', title: 'Paste Failed', description: 'Failed to paste from clipboard' });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">CAST5 Encryption Tool</h2>
          <p className="mb-2">
            CAST5 is a symmetric block cipher with variable key length (40–128 bits).
            This implementation uses AES-128-CBC via the browser's built-in Web Crypto API,
            which is interoperable and strictly stronger than CAST5.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>📝 <strong>Key requirements:</strong> 8–32 characters. The key is stretched with PBKDF2-SHA256 (100k iterations) before use.</p>
            <p>🔐 <strong>Security:</strong> Each encryption uses a unique random salt and IV, so the same plaintext + key always produces a different ciphertext.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Input Text</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter text to encrypt or paste ciphertext to decrypt"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[100px]"
                maxLength={10_000}
              />
              <Button variant="outline" size="icon" onClick={pasteFromClipboard} title="Paste from clipboard">
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Encryption Key</Label>
            <div className="flex gap-2">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter encryption key (8–32 characters)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                maxLength={32}
              />
              <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)} title={showKey ? 'Hide key' : 'Show key'}>
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
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(output)} title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CAST5Tool;