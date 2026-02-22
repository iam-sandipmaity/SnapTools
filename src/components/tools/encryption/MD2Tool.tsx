import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Copy, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type LegacyMd2Crypto = typeof CryptoJS & {
  MD2?: (message: string) => { toString(): string };
};

const MD2Tool = () => {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const { toast } = useToast();

  const generateHash = async () => {
    try {
      if (!input.trim()) {
        toast({
          variant: 'destructive',
          title: 'Input Required',
          description: 'Please enter text to generate hash'
        });
        return;
      }
      let md2 = (CryptoJS as LegacyMd2Crypto).MD2;
      if (typeof md2 !== 'function') {
        try {
          await import('../../../lib/crypto-polyfills/md2');
          md2 = (CryptoJS as LegacyMd2Crypto).MD2;
        } catch (e) {
          toast({
            variant: 'destructive',
            title: 'algorithm unavailable',
            description: 'MD2 is not available in this browser build'
          });
          return;
        }
      }
      const md2Hash = md2!(input).toString();
      setHash(md2Hash);
      // Reset verification state
      setIsMatch(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hash Generation Error',
        description: 'Failed to generate MD2 hash'
      });
    }
  };

  const verifyMD2 = async () => {
    try {
      if (!input.trim() || !verifyHash.trim()) {
        toast({
          variant: 'destructive',
          title: 'Input Required',
          description: 'Please enter both text and hash to verify'
        });
        return;
      }
      let md2 = (CryptoJS as LegacyMd2Crypto).MD2;
      if (typeof md2 !== 'function') {
        try {
          await import('../../../lib/crypto-polyfills/md2');
          md2 = (CryptoJS as LegacyMd2Crypto).MD2;
        } catch (e) {
          toast({
            variant: 'destructive',
            title: 'algorithm unavailable',
            description: 'MD2 is not available in this browser build'
          });
          return;
        }
      }
      const generatedHash = md2!(input).toString();
      setIsMatch(generatedHash.toLowerCase() === verifyHash.toLowerCase());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Error',
        description: 'Failed to verify MD2 hash'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Failed to copy text to clipboard'
      });
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Paste Failed',
        description: 'Failed to paste text from clipboard'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">MD2 Hash Generator</h2>
          <p className="mb-2">MD2 (Message Digest Algorithm 2) is one of the earliest cryptographic hash functions that produces a 128-bit (16-byte) hash value.</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ <strong>What is MD2?</strong> MD2 is a one-way hash function designed specifically for 8-bit processors, converting any input into a fixed-size string of characters.</p>
            <p>🔐 <strong>Common Uses:</strong> Historical file integrity verification and digital signatures (Note: MD2 is considered cryptographically broken and should not be used for security purposes).</p>
            <p>📝 <strong>How to Use:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Enter your text in the input field</li>
              <li>Click Generate to create the MD2 hash</li>
              <li>Use the verification section to compare and verify MD2 hashes</li>
              <li>Note: MD2 is not secure for cryptographic purposes and should only be used for legacy system compatibility</li>
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <Label>Input Text</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter text to generate MD2 hash"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={pasteFromClipboard}
                title="Paste from clipboard"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hash Generation Section */}
          <div className="space-y-4">
            <Button onClick={generateHash} className="w-full">
              Generate MD2 Hash
            </Button>

            {hash && (
              <div className="space-y-2">
                <Label>Generated Hash</Label>
                <div className="flex gap-2">
                  <Input value={hash} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(hash)}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Hash Verification Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verify MD2 Hash</Label>
              <Input
                placeholder="Enter MD2 hash to verify"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
              />
            </div>

            <Button onClick={verifyMD2} className="w-full">
              Verify Hash
            </Button>

            {isMatch !== null && (
              <div className={`text-center font-medium ${isMatch ? 'text-green-600' : 'text-red-600'}`}>
                {isMatch ? 'Hash matches!' : 'Hash does not match!'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MD2Tool;
