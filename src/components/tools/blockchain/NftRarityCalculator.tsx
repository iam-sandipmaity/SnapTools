import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Trash2, Sparkles, Loader2, CheckCircle2, Image, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface NFTRarity {
  trait: string;
  value: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  percentage: number;
  score: number;
}

const NftRarityCalculator = () => {
  const [nftData, setNftData] = useState<string>('');
  const [collectionName, setCollectionName] = useState<string>('');
  const [rarityResults, setRarityResults] = useState<NFTRarity[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [overallScore, setOverallScore] = useState<number>(0);

  // Simulated NFT rarity calculation
  const calculateRarity = async () => {
    if (!nftData.trim()) {
      toast.error('Please enter NFT metadata or traits');
      return;
    }

    setIsCalculating(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Parse input (expecting trait:value format)
      const lines = nftData.split('\n').filter(l => l.trim());
      const results: NFTRarity[] = [];
      let totalScore = 0;

      // Simulate rarity calculation
      const rarityLevels: Array<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'> = 
        ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      const rarityWeights = { common: 1, uncommon: 2, rare: 5, epic: 10, legendary: 25 };

      lines.forEach((line, idx) => {
        const [trait, value] = line.split(':').map(s => s.trim());
        if (!trait || !value) return;

        // Simulate rarity based on "rarity" keyword or random
        const isRare = value.toLowerCase().includes('rare') || 
                        value.toLowerCase().includes('legendary') ||
                        Math.random() > 0.7;
        
        const rarity = isRare ? 
          (Math.random() > 0.7 ? 'legendary' : Math.random() > 0.5 ? 'epic' : 'rare') :
          (Math.random() > 0.5 ? 'uncommon' : 'common');
        
        const percentage = rarity === 'common' ? 40 + Math.random() * 30 :
                         rarity === 'uncommon' ? 20 + Math.random() * 20 :
                         rarity === 'rare' ? 5 + Math.random() * 15 :
                         rarity === 'epic' ? 1 + Math.random() * 4 :
                         0.1 + Math.random() * 0.9;
        
        const score = rarityWeights[rarity] * (100 / (percentage || 1));
        totalScore += score;

        results.push({
          trait: trait || `Trait ${idx + 1}`,
          value: value || 'Unknown',
          rarity,
          percentage: Math.round(percentage * 100) / 100,
          score: Math.round(score * 100) / 100,
        });
      });

      setRarityResults(results);
      setOverallScore(Math.round(totalScore * 100) / 100);
      toast.success('Rarity calculated successfully!');
    } catch (error) {
      toast.error('Error calculating rarity');
    } finally {
      setIsCalculating(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = () => {
    const text = rarityResults.map(r => 
      `${r.trait}: ${r.value} - ${r.rarity} (${r.percentage}%, Score: ${r.score})`
    ).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Rarity data copied!');
  };

  const clearAll = () => {
    setNftData('');
    setCollectionName('');
    setRarityResults([]);
    setOverallScore(0);
  };

  const loadExample = () => {
    setCollectionName('Cool Cats Collection');
    setNftData(`Background: Blue
Fur: Rare Orange
Eyes: Laser
Hat: Crown
Accessory: Gold Chain
Mouth: Cigar
Clothes: Tuxedo`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            NFT Rarity Calculator - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Collection Name (Optional)</Label>
            <Input
              id="collection"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g., Bored Ape Yacht Club"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="nft-data">NFT Traits (trait: value format)</Label>
              <Button variant="ghost" size="sm" onClick={loadExample}>
                Load Example
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Enter each trait on a new line as "trait: value"
            </div>
            <textarea
              id="nft-data"
              value={nftData}
              onChange={(e) => setNftData(e.target.value)}
              placeholder="Background: Blue&#10;Fur: Rare Orange&#10;Eyes: Laser&#10;Hat: Crown"
              className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
          </div>

          <Button
            onClick={calculateRarity}
            disabled={isCalculating || !nftData.trim()}
            className="w-full"
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Rarity...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Calculate Rarity
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {rarityResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Rarity Analysis
              </span>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-lg">
                  Score: {overallScore}
                </Badge>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {collectionName && (
                <h3 className="font-medium">{collectionName}</h3>
              )}
              
              <Tabs defaultValue="list">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">Trait List</TabsTrigger>
                  <TabsTrigger value="visual">Visual View</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-3 mt-4">
                  {rarityResults.map((result, idx) => (
                    <div key={idx} className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(result.rarity)}>
                            {result.rarity}
                          </Badge>
                          <span className="font-medium">{result.trait}</span>
                        </div>
                        <Badge variant="outline">Score: {result.score}</Badge>
                      </div>
                      <div className="text-sm pl-2">
                        <strong>Value:</strong> {result.value}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-background rounded-full h-2">
                          <div 
                            className={`h-full rounded-full ${
                              result.rarity === 'common' ? 'bg-gray-500' :
                              result.rarity === 'uncommon' ? 'bg-green-500' :
                              result.rarity === 'rare' ? 'bg-blue-500' :
                              result.rarity === 'epic' ? 'bg-purple-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, result.percentage * 5)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {result.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="visual" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map(rarity => {
                        const count = rarityResults.filter(r => r.rarity === rarity).length;
                        return (
                          <div key={rarity} className="p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{count}</div>
                            <Badge className={getRarityColor(rarity)}>{rarity}</Badge>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Rarity Distribution</div>
                      <div className="space-y-2">
                        {rarityResults.map((r, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-24 text-xs truncate">{r.trait}:</div>
                            <div className="flex-1 bg-background rounded-full h-3">
                              <div 
                                className={`h-full rounded-full ${
                                  r.rarity === 'common' ? 'bg-gray-500' :
                                  r.rarity === 'uncommon' ? 'bg-green-500' :
                                  r.rarity === 'rare' ? 'bg-blue-500' :
                                  r.rarity === 'epic' ? 'bg-purple-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.min(100, r.score / 2)}%` }}
                              />
                            </div>
                            <div className="w-12 text-xs text-right">{r.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Image className="h-4 w-4" />
              About NFT Rarity Calculator
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> Enter your NFT's traits in "trait: value" format, 
                and our algorithm calculates the rarity score for each trait and overall.
              </p>
              <p>
                <strong>Features:</strong> Multiple rarity tiers, visual distribution charts, 
                overall score calculation, and copy-to-clipboard functionality.
              </p>
              <p>
                <strong>Note:</strong> This demo uses simulated rarity. In production, 
                this would connect to real NFT APIs (OpenSea, LooksRare) and calculate 
                actual rarity based on collection data.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Rarity Tiers:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { tier: 'Common', color: 'bg-gray-100 text-gray-800', desc: '40-70%' },
                  { tier: 'Uncommon', color: 'bg-green-100 text-green-800', desc: '20-40%' },
                  { tier: 'Rare', color: 'bg-blue-100 text-blue-800', desc: '5-20%' },
                  { tier: 'Epic', color: 'bg-purple-100 text-purple-800', desc: '1-5%' },
                  { tier: 'Legendary', color: 'bg-yellow-100 text-yellow-800', desc: '<1%' },
                ].map(t => (
                  <Badge key={t.tier} className={t.color}>
                    {t.tier} ({t.desc})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NftRarityCalculator;
