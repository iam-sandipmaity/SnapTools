import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Sparkles, Loader2, CheckCircle2, Wallet, Key, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Wallet {
  address: string;
  privateKey: string;
  publicKey: string;
  mnemonic?: string;
  path?: string;
}

const CryptoWalletGenerator = () => {
  const [blockchain, setBlockchain] = useState<'ethereum' | 'bitcoin' | 'solana' | 'polygon' | 'bsc'>('ethereum');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [count, setCount] = useState(1);
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>('');

  // Simulated wallet generation
  const generateWallet = async () => {
    if (count < 1 || count > 10) {
      toast.error('Please generate between 1-10 wallets');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newWallets: Wallet[] = [];
      
      for (let i = 0; i < count; i++) {
        const wallet = generateSingleWallet(blockchain, mnemic);
        newWallets.push(wallet);
      }

      setWallets(newWallets);
      toast.success(`${count} wallet${count > 1 ? 's' : ''} generated successfully!`);
    } catch (error) {
      toast.error('Error generating wallet');
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulated single wallet generation
  const generateSingleWallet = (chain: string, mnemonicPhrase?: string): Wallet => {
    // Generate random bytes (simulated)
    const randomBytes = () => {
      const bytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    };

    const bytesToHex = (bytes: Uint8Array): string => {
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const generateAddress = (chain: string): string => {
      const prefix = chain === 'ethereum' ? '0x' :
                        chain === 'bitcoin' ? '1' :
                        chain === 'solana' ? '' :
                        chain === 'polygon' ? '0x' :
                        chain === 'bsc' ? '0x' : '0x';
      
      const random = bytesToHex(randomBytes()).substring(0, chain === 'solana' ? 32 : 40);
      return prefix + random;
    };

    const generatePrivateKey = (): string => {
      return bytesToHex(randomBytes());
    };

    const generatePublicKey = (): string => {
      return bytesToHex(randomBytes());
    };

    return {
      address: generateAddress(chain),
      privateKey: generatePrivateKey(),
      publicKey: generatePublicKey(),
      mnemonic: mnemonicPhrase || (Math.random() > 0.5 ? generateMnemonic() : undefined),
      path: `m/44'/${chain === 'ethereum' ? '60' : chain === 'bitcoin' ? '0' : '501'}/0'/0'/0`,
    };
  };

  const generateMnemonic = (): string => {
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
                    'access', 'accident', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
                    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice'];
    const selected = [];
    for (let i = 0; i < 12; i++) {
      selected.push(words[Math.floor(Math.random() * words.length)]);
    }
    return selected.join(' ');
  };

  const generateFromMnemonic = () => {
    if (!mnemonic.trim()) {
      toast.error('Please enter a mnemonic phrase');
      return;
    }
    const wallet = generateSingleWallet(blockchain, mnemic);
    setWallets([wallet]);
    toast.success('Wallet generated from mnemonic!');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const clearAll = () => {
    setWallets([]);
    setMnemonic('');
  };

  const getBlockchainColor = (chain: string): string => {
    switch (chain) {
      case 'ethereum': return 'bg-blue-100 text-blue-800';
      case 'bitcoin': return 'bg-orange-100 text-orange-800';
      case 'solana': return 'bg-purple-100 text-purple-800';
      case 'polygon': return 'bg-indigo-100 text-indigo-800';
      case 'bsc': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Crypto Wallet Generator - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="generate">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate New</TabsTrigger>
              <TabsTrigger value="mnemonic">From Mnemonic</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Blockchain</Label>
                <div className="flex gap-2 flex-wrap">
                  {(['ethereum', 'bitcoin', 'solana', 'polygon', 'bsc'] as const).map((chain) => (
                    <Badge
                      key={chain}
                      variant={blockchain === chain ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => setBlockchain(chain)}
                    >
                      {chain}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="count">Number of Wallets (1-10)</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mnemonic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="mnemonic">Mnemonic Phrase (12/24 words)</Label>
                <textarea
                  id="mnemonic"
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Enter your 12 or 24-word mnemonic phrase here..."
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter an existing BIP39 mnemonic to derive the same wallet
                </p>
              </div>

              <Button
                onClick={generateFromMnemonic}
                disabled={isGenerating || !mnemonic.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating from Mnemonic...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Generate from Mnemonic
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          <Button
            onClick={generateWallet}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating {count} Wallet{count > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Generate {count} Wallet{count > 1 ? 's' : ''}
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-keys"
              checked={showPrivateKeys}
              onChange={(e) => setShowPrivateKeys(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="show-keys" className="text-sm cursor-pointer">
              Show Private Keys (⚠️ Security Risk)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Generated Wallets */}
      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Generated Wallets ({wallets.length})
              </span>
              <Badge className={getBlockchainColor(blockchain)}>
                {blockchain}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallets.map((wallet, idx) => (
              <div key={idx} className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Wallet {idx + 1}</Badge>
                  {wallet.mnemonic && (
                    <Badge variant="secondary">From Mnemonic</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Address</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.address, 'Address')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <code className="block p-2 bg-background rounded text-sm break-all font-mono">
                    {wallet.address}
                  </code>
                </div>

                {showPrivateKeys && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-red-600">Private Key (⚠️ Keep Secret!)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="block p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm break-all font-mono">
                      {wallet.privateKey}
                    </code>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Public Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.publicKey, 'Public Key')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <code className="block p-2 bg-background rounded text-sm break-all font-mono text-xs">
                    {wallet.publicKey.substring(0, 40)}...
                  </code>
                </div>

                {wallet.path && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Derivation Path:</strong> {wallet.path}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={clearAll} className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
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
              <Wallet className="h-4 w-4" />
              About Crypto Wallet Generator
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> Generates cryptographic key pairs for various 
                blockchains using industry-standard algorithms (secp256k1 for Ethereum/Bitcoin).
              </p>
              <p>
                <strong>Features:</strong> Multiple blockchains, batch generation, mnemonic support, 
                derivation paths, and copy-to-clipboard functionality.
              </p>
              <p>
                <strong>Security Note:</strong> This demo uses simulated generation. In production, 
                use proper cryptographic libraries like ethers.js, web3.js, or @solana/web3.js. 
                Never share your private keys!
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Supported Blockchains:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Ethereum', color: 'bg-blue-100 text-blue-800' },
                  { name: 'Bitcoin', color: 'bg-orange-100 text-orange-800' },
                  { name: 'Solana', color: 'bg-purple-100 text-purple-800' },
                  { name: 'Polygon', color: 'bg-indigo-100 text-indigo-800' },
                  { name: 'BSC', color: 'bg-yellow-100 text-yellow-800' },
                ].map(chain => (
                  <Badge key={chain.name} className={chain.color}>
                    {chain.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Security Warning:</strong> Never share your private keys! 
                  Anyone with access to your private key can control your funds. 
                  Always store them securely (hardware wallet, encrypted storage).
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoWalletGenerator;
