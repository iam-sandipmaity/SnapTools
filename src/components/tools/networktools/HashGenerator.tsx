import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Hash, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

// Simple SHA-1, SHA-256, SHA-512 implementations using crypto-js
const simpleSha1 = (text: string): string => {
  // Using crypto-js for demo (in production, use proper SHA-1 lib)
  return CryptoJS.SHA1(text).toString();
};

const simpleSha256 = (text: string): string => {
  return CryptoJS.SHA256(text).toString();
};

const simpleSha512 = (text: string): string => {
  return CryptoJS.SHA512(text).toString();
};

const HashGenerator = () => {
  const [inputText, setInputText] = useState<string>('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('text');

  // Calculate all hashes
  const calculateHashes = async () => {
    if (!inputText && !inputFile) {
      toast.error('Please enter text or select a file');
      return;
    }

    setIsCalculating(true);
    const results: Record<string, string> = {};

    try {
      let textToHash = inputText;

      // If file is selected, read it
      if (inputFile) {
        textToHash = await readFileAsText(inputFile);
      }

      // MD5
      results.md5 = CryptoJS.MD5(textToHash).toString();

      // SHA-1
      const sha1 = new jsSHA('SHA-1', 'TEXT', { encoding: 'UTF8' });
      sha1.update(textToHash);
      results.sha1 = sha1.getHash('HEX');

      // SHA-256
      const sha256 = new jsSHA('SHA-256', 'TEXT', { encoding: 'UTF8' });
      sha256.update(textToHash);
      results.sha256 = sha256.getHash('HEX');

      // SHA-512
      const sha512 = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      sha512.update(textToHash);
      results.sha512 = sha512.getHash('HEX');

      // SHA-3 (Keccak)
      results.sha3 = CryptoJS.SHA3(textToHash).toString();

      // RIPEMD-160 (using CryptoJS)
      results.ripemd160 = CryptoJS.RIPEMD160(textToHash).toString();

      setHashes(results);
      toast.success('Hashes calculated successfully!');
    } catch (error) {
      toast.error('Error calculating hashes');
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const clearAll = () => {
    setInputText('');
    setInputFile(null);
    setHashes({});
  };

  const hashAlgorithms = [
    { key: 'md5', name: 'MD5', bits: 128, color: 'bg-red-100 text-red-800' },
    { key: 'sha1', name: 'SHA-1', bits: 160, color: 'bg-orange-100 text-orange-800' },
    { key: 'sha256', name: 'SHA-256', bits: 256, color: 'bg-blue-100 text-blue-800' },
    { key: 'sha512', name: 'SHA-512', bits: 512, color: 'bg-purple-100 text-purple-800' },
    { key: 'sha3', name: 'SHA-3', bits: 256, color: 'bg-green-100 text-green-800' },
    { key: 'ripemd160', name: 'RIPEMD-160', bits: 160, color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hash Generator - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="file">File Input</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hash-input">Text to Hash</Label>
                <Textarea
                  id="hash-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to generate hashes..."
                  className="min-h-[150px] font-mono"
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="file-input">Select File</Label>
                <Input
                  id="file-input"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setInputFile(file);
                  }}
                  className="cursor-pointer"
                />
                {inputFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {inputFile.name} ({(inputFile.size / 1024).toFixed(2)} KB
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button
              onClick={calculateHashes}
              disabled={isCalculating || (!inputText && !inputFile)}
              className="flex-1"
            >
              {isCalculating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Calculating...
                </>
              ) : (
                <>
                  <Hash className="mr-2 h-4 w-4" />
                  Generate Hashes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {Object.keys(hashes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hash Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hashAlgorithms.map((algo) => (
              <div key={algo.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={algo.color}>{algo.name}</Badge>
                    <span className="text-sm text-muted-foreground">{algo.bits} bits</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hashes[algo.key], algo.name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code className="block p-3 bg-muted rounded-lg text-sm font-mono break-all">
                  {hashes[algo.key]}
                </code>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const allHashes = hashAlgorithms
                    .map((algo) => `${algo.name}: ${hashes[algo.key]}`)
                    .join('\n');
                  copyToClipboard(allHashes, 'All hashes');
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All Hashes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Supported Hash Algorithms
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hashAlgorithms.map((algo) => (
                <div key={algo.key} className="p-3 bg-muted rounded-lg text-center">
                  <div className="font-semibold">{algo.name}</div>
                  <div className="text-xs text-muted-foreground">{algo.bits} bits</div>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>MD5:</strong> 128-bit hash, widely used but cryptographically broken</p>
              <p><strong>SHA-1:</strong> 160-bit hash, deprecated for security use</p>
              <p><strong>SHA-256:</strong> 256-bit hash, part of SHA-2 family, secure</p>
              <p><strong>SHA-512:</strong> 512-bit hash, more secure variant of SHA-2</p>
              <p><strong>SHA-3:</strong> Latest NIST standard, Keccak algorithm</p>
              <p><strong>RIPEMD-160:</strong> 160-bit hash, used in Bitcoin</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HashGenerator;
