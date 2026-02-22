import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Copy, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type LegacyMdc2Crypto = typeof CryptoJS & {
  MDC2?: (message: string) => { toString(): string };
};

const MDC2Tool = () => {
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
      let mdc2 = (CryptoJS as LegacyMdc2Crypto).MDC2;
      if (typeof mdc2 !== 'function') {
        try {
          await import('../../../lib/crypto-polyfills/mdc2');
          mdc2 = (CryptoJS as LegacyMdc2Crypto).MDC2;
        } catch (e) {
          toast({
            variant: 'destructive',
            title: 'algorithm unavailable',
            description: 'MDC2 is not available in this browser build'
          });
          return;
        }
      }
      const mdc2Hash = mdc2!(input).toString();
      setHash(mdc2Hash);
      // Reset verification state
      setIsMatch(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hash Generation Error',
        description: 'Failed to generate MDC2 hash'
      });
    }
  };

  const verifyMDC2 = async () => {
    try {
      if (!input.trim() || !verifyHash.trim()) {
        toast({
          variant: 'destructive',
          title: 'Input Required',
          description: 'Please enter both text and hash to verify'
        });
        return;
      }
      let mdc2 = (CryptoJS as LegacyMdc2Crypto).MDC2;
      if (typeof mdc2 !== 'function') {
        try {
          await import('../../../lib/crypto-polyfills/mdc2');
          mdc2 = (CryptoJS as LegacyMdc2Crypto).MDC2;
        } catch (e) {
          toast({
            variant: 'destructive',
            title: 'algorithm unavailable',
            description: 'MDC2 is not available in this browser build'
          });
          return;
        }
      }
      const generatedHash = mdc2!(input).toString();
      setIsMatch(generatedHash.toLowerCase() === verifyHash.toLowerCase());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Error',
        description: 'Failed to verify MDC2 hash'
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
          <h2 className="text-2xl font-bold mb-4">MDC2 Hash Generator</h2>
          <p className="mb-2">MDC2 (Modification Detection Code 2) is a cryptographic hash function that produces a 128-bit (16-byte) hash value.</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ <strong>What is MDC2?</strong> MDC2 is a one-way hash function based on block cipher operations, designed to provide data integrity verification.</p>
            <p>🔐 <strong>Common Uses:</strong> Legacy systems for data integrity verification and digital signatures (Note: MDC2 is primarily used in specific legacy applications).</p>
            <p>📝 <strong>How to Use:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Enter your text in the input field</li>
              <li>Click Generate to create the MDC2 hash</li>
              <li>Use the verification section to compare and verify MDC2 hashes</li>
              <li>Note: MDC2 is considered legacy and should only be used when specifically required</li>
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <Label>Input Text</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter text to generate MDC2 hash"
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
              Generate MDC2 Hash
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
              <Label>Verify MDC2 Hash</Label>
              <Input
                placeholder="Enter MDC2 hash to verify"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
              />
            </div>

            <Button onClick={verifyMDC2} className="w-full">
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

export default MDC2Tool;
