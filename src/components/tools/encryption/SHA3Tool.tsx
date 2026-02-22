import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Clipboard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { sha3Hash } from '@/lib/crypto-polyfills/sha3';

const SHA3Tool: React.FC = () => {
  const [input, setInput]       = useState('');
  const [outputSize, setOutputSize] = useState<'224'|'256'|'384'|'512'>('256');
  const [hash, setHash]         = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [isMatch, setIsMatch]   = useState<boolean | null>(null);
  const { toast } = useToast();

  const generateHash = () => {
    if (!input.trim()) {
      toast({ variant: 'destructive', title: 'Input Required', description: 'Please enter text to hash' });
      return;
    }
    try {
      const bits = parseInt(outputSize) as 224 | 256 | 384 | 512;
      setHash(sha3Hash(input, bits));
      setIsMatch(null);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate SHA-3 hash' });
    }
  };

  const verifyHashFn = () => {
    if (!input.trim() || !verifyHash.trim()) {
      toast({ variant: 'destructive', title: 'Input Required', description: 'Please enter both text and a hash to verify' });
      return;
    }
    try {
      const bits = parseInt(outputSize) as 224 | 256 | 384 | 512;
      const computed = sha3Hash(input, bits);
      setIsMatch(computed.toLowerCase() === verifyHash.trim().toLowerCase());
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to verify hash' });
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Hash copied to clipboard' });
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
            <h2 className="text-2xl font-bold text-foreground">SHA-3 Hash Generator</h2>
            <p>
              SHA-3 (FIPS 202) is the latest member of the Secure Hash Algorithm family,
              based on the Keccak sponge construction. It produces a fixed-size digest
              that is used for data integrity verification and digital signatures.
            </p>
            <p className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">
              ⚠ Note: CryptoJS's built-in SHA3 produces <em>Keccak-256</em> output, which differs
              from NIST SHA-3. This tool uses a correct FIPS 202 implementation.
            </p>
            <div className="mt-2 space-y-1">
              <p className="font-medium text-foreground">Available variants:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>SHA3-224 — 56 hex characters</li>
                <li>SHA3-256 — 64 hex characters (recommended)</li>
                <li>SHA3-384 — 96 hex characters</li>
                <li>SHA3-512 — 128 hex characters (maximum security)</li>
              </ul>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label>Input Text</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter text to hash"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="min-h-[100px]"
              />
              <Button variant="outline" size="icon" onClick={paste} title="Paste from clipboard">
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Output size selector */}
          <div className="space-y-2">
            <Label>Output Size (bits)</Label>
            <Select value={outputSize} onValueChange={v => { setOutputSize(v as any); setHash(''); setIsMatch(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select output size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="224">SHA3-224</SelectItem>
                <SelectItem value="256">SHA3-256</SelectItem>
                <SelectItem value="384">SHA3-384</SelectItem>
                <SelectItem value="512">SHA3-512</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateHash} className="w-full">Generate Hash</Button>

          {/* Hash output */}
          {hash && (
            <div className="space-y-2">
              <Label>Generated Hash</Label>
              <div className="flex gap-2">
                <Input value={hash} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copy(hash)} title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Verification */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Verify Hash</Label>
            <Input
              placeholder={`Paste a SHA3-${outputSize} hash to verify against the input above`}
              value={verifyHash}
              onChange={e => { setVerifyHash(e.target.value); setIsMatch(null); }}
              className="font-mono text-xs"
            />
            <Button onClick={verifyHashFn} className="w-full" variant="outline">
              Verify
            </Button>
            {isMatch !== null && (
              <p className={`text-center font-medium text-sm ${isMatch ? 'text-green-600' : 'text-red-600'}`}>
                {isMatch ? '✓ Hash matches!' : '✗ Hash does not match'}
              </p>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default SHA3Tool;