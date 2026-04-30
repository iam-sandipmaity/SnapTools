import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AiParaphraser = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'standard' | 'fluent' | 'creative' | 'formal' | 'simple'>('standard');
  const [strength, setStrength] = useState<'light' | 'moderate' | 'heavy'>('moderate');

  // Paraphrase modes with descriptions
  const modes = [
    { value: 'standard', label: 'Standard', description: 'Balanced changes preserving meaning' },
    { value: 'fluent', label: 'Fluent', description: 'Natural, conversational tone' },
    { value: 'creative', label: 'Creative', description: 'Unique wording and expressions' },
    { value: 'formal', label: 'Formal', description: 'Academic, professional tone' },
    { value: 'simple', label: 'Simple', description: 'Easy-to-read, clear language' },
  ];

  // Simulated AI paraphrasis (in production, this would call an AI API)
  const paraphraseText = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to paraphrase');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      let result = inputText;

      // Simple word replacement based on mode (demo purposes)
      const synonyms: Record<string, string[]> = {
        'good': ['great', 'excellent', 'fantastic', 'superb'],
        'bad': ['poor', 'terrible', 'unfortunate', 'unsatisfactory'],
        'big': ['large', 'huge', 'massive', 'substantial'],
        'small': ['tiny', 'little', 'compact', 'miniature'],
        'important': ['crucial', 'vital', 'significant', 'essential'],
        'use': ['utilize', 'employ', 'leverage', 'implement'],
        'show': ['demonstrate', 'display', 'illustrate', 'exhibit'],
        'think': ['believe', 'consider', 'ponder', 'reflect'],
        'get': ['obtain', 'acquire', 'secure', 'attain'],
      };

      // Apply paraphrasing based on strength
      const words = result.split(/\s+/);
      const replacements = strength === 'light' ? 0.2 : strength === 'moderate' ? 0.4 : 0.6;

      const processedWords = words.map(word => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        if (synonyms[cleanWord] && Math.random() < replacements) {
          const synonymList = synonyms[cleanWord];
          const replacement = synonymList[Math.floor(Math.random() * synonymList.length)];
          // Preserve original capitalization
          if (word[0] === word[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
          return replacement;
        }
        return word;
      });

      result = processedWords.join(' ');

      // Mode-specific adjustments
      if (mode === 'formal') {
        result = result.replace(/\bcan't\b/gi, 'cannot');
        result = result.replace(/\bwon't\b/gi, 'will not');
        result = result.replace(/\bdon't\b/gi, 'do not');
        result = result.replace(/\bit's\b/gi, 'it is');
      } else if (mode === 'simple') {
        result = result.replace(/\butilize\b/gi, 'use');
        result = result.replace(/\bleverage\b/gi, 'use');
        result = result.replace(/\bimplement\b/gi, 'start using');
      }

      setOutputText(result);
      toast.success('Text paraphrased successfully!');
    } catch (error) {
      toast.error('Error paraphrasing text');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast.success('Paraphrased text copied!');
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  const calculateChanges = () => {
    if (!inputText || !outputText) return { words: 0, percentage: 0 };
    
    const originalWords = inputText.split(/\s+/).filter(w => w.length > 0);
    const newWords = outputText.split(/\s+/).filter(w => w.length > 0);
    const changed = originalWords.filter((word, idx) => word.toLowerCase() !== (newWords[idx] || '').toLowerCase()).length;
    
    return {
      words: changed,
      percentage: Math.round((changed / originalWords.length) * 100),
    };
  };

  const changes = calculateChanges();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Paraphraser - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="input">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="input-text">Text to Paraphrase</Label>
                <Textarea
                  id="input-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to paraphrase... (minimum 50 words recommended)"
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                  <span>{inputText.length} characters</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Paraphrase Mode</Label>
                  <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modes.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          <div>
                            <div className="font-medium">{m.label}</div>
                            <div className="text-xs text-muted-foreground">{m.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Paraphrasing Strength</Label>
                  <div className="flex gap-2">
                    {(['light', 'moderate', 'heavy'] as const).map(s => (
                      <Badge
                        key={s}
                        variant={strength === s ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => setStrength(s)}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {strength === 'light' && 'Minimal changes, preserve most of original text'}
                    {strength === 'moderate' && 'Balanced changes, good readability'}
                    {strength === 'heavy' && 'Maximum changes, completely reworded'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={paraphraseText}
            disabled={isProcessing || !inputText.trim()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Paraphrasing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Paraphrase Text
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      {outputText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Paraphrased Text
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {outputText}
              </pre>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{inputText.split(/\s+/).filter(w => w.length > 0).length}</div>
                <div className="text-xs text-muted-foreground">Original Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{outputText.split(/\s+/).filter(w => w.length > 0).length}</div>
                <div className="text-xs text-muted-foreground">New Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{changes.percentage}%</div>
                <div className="text-xs text-muted-foreground">Words Changed</div>
              </div>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>✓ Changes Applied:</strong> {changes.words} words were rephrased 
                using {mode} mode with {strength} strength.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              About AI Paraphraser
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> Our AI analyzes your text and rewrites it while 
                preserving the original meaning. Perfect for avoiding plagiarism, improving clarity, 
                or adjusting tone.
              </p>
              <p>
                <strong>Features:</strong> Multiple paraphrase modes, adjustable strength, 
                real-time statistics, and copy-to-clipboard functionality.
              </p>
              <p>
                <strong>Note:</strong> This demo uses rule-based paraphrasing. In production, 
                this would connect to advanced AI models like GPT-4, Claude, or Sarvam AI 
                for human-like paraphrasing.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {['Academic Writing', 'Blog Posts', 'Research Papers', 'Business Documents', 'Emails', 'Essays'].map(use => (
                  <Badge key={use} variant="outline">{use}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiParaphraser;
