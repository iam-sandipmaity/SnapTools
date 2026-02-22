import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Clipboard, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type LegacyMd4Crypto = typeof CryptoJS & {
  MD4?: (message: string) => { toString(): string };
};

const MD4Tool = () => {
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
      let md4 = (CryptoJS as LegacyMd4Crypto).MD4;
      if (typeof md4 !== 'function') {
        try {
          // Load local polyfill (avoid importing non-existent crypto-js submodule)
          await import('../../../lib/crypto-polyfills/md4');
          md4 = (CryptoJS as LegacyMd4Crypto).MD4;
        } catch (e) {
          toast({
            variant: 'destructive',
            title: 'algorithm unavailable',
            description: 'MD4 is not available in this browser build'
          });
          return;
        }
      }
      const md4Hash = md4!(input).toString();
      setHash(md4Hash);
      // Reset verification state
      setIsMatch(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hash Generation Error',
        description: 'Failed to generate MD4 hash'
      });
    }
  };

  const verifyMD4 = async () => {
    try {
      if (!input.trim() || !verifyHash.trim()) {
        toast({
          variant: 'destructive',
          title: 'Input Required',
          description: 'Please enter both text and hash to verify'
        });
        return;
      }
      let md4 = (CryptoJS as LegacyMd4Crypto).MD4;
      if (typeof md4 !== 'function') {
        try {
          await import('@/lib/crypto-polyfills/md4');
          md4 = (CryptoJS as LegacyMd4Crypto).MD4;
        } catch (e) {
          toast({
            variant: 'destructive',
            title: 'algorithm unavailable',
            description: 'MD4 is not available in this browser build'
          });
          return;
        }
      }
      const generatedHash = md4!(input).toString();
      setIsMatch(generatedHash.toLowerCase() === verifyHash.toLowerCase());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Error',
        description: 'Failed to verify MD4 hash'
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
          <h2 className="text-2xl font-bold mb-4">MD4 Hash Generator</h2>
          <p className="mb-2">MD4 (Message Digest Algorithm 4) is a cryptographic hash function that produces a 128-bit (16-byte) hash value.</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ <strong>What is MD4?</strong> MD4 is a one-way hash function that converts any input into a fixed-size string of characters. It was a predecessor to MD5.</p>
            <p>🔐 <strong>Common Uses:</strong> Historical file integrity verification and digital signatures (Note: MD4 is considered cryptographically broken and should not be used for security purposes).</p>
            <p>📝 <strong>How to Use:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Enter your text in the input field</li>
              <li>Click Generate to create the MD4 hash</li>
              <li>Use the verification section to compare and verify MD4 hashes</li>
              <li>Note: MD4 is not secure for cryptographic purposes and should only be used for legacy system compatibility</li>
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <Label>Input Text</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter text to generate MD4 hash"
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
              Generate MD4 Hash
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
              <Label>Verify MD4 Hash</Label>
              <Input
                placeholder="Enter MD4 hash to verify"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
              />
            </div>

            <Button onClick={verifyMD4} className="w-full">
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

export default MD4Tool;
