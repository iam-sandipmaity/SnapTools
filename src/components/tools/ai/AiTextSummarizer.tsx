import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AiTextSummarizer = () => {
  const [inputText, setInputText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [summaryFormat, setSummaryFormat] = useState<'paragraph' | 'bullets' | 'key-points'>('paragraph');
  const [wordCount, setWordCount] = useState({ original: 0, summary: 0 });

  // Simulated AI summarization (in production, this would call an AI API)
  const summarizeText = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to summarize');
      return;
    }

    setIsSummarizing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simple extractive summarization (demo purposes)
      const sentences = inputText.match(/[^\.!?]+[.!?]+/g) || [];
      const words = inputText.split(/\s+/).filter(w => w.length > 0);
      
      let summaryText = '';
      
      if (summaryLength === 'short') {
        // Take first 1-2 sentences
        summaryText = sentences.slice(0, Math.min(2, sentences.length)).join(' ');
      } else if (summaryLength === 'medium') {
        // Take key sentences from beginning, middle, end
        const selected = [
          sentences[0],
          sentences[Math.floor(sentences.length / 2)],
          sentences[sentences.length - 1],
        ].filter(Boolean);
        summaryText = selected.join(' ');
      } else {
        // Take more sentences
        summaryText = sentences.slice(0, Math.min(5, sentences.length)).join(' ');
      }

      // Format output
      if (summaryFormat === 'bullets') {
        const points = summaryText.split('. ').filter(s => s.trim());
        summaryText = points.map(p => `• ${p.trim()}.`).join('\n');
      } else if (summaryFormat === 'key-points') {
        const points = summaryText.split('. ').filter(s => s.trim()).slice(0, 3);
        summaryText = points.map((p, i) => `${i + 1}. ${p.trim()}`).join('\n');
      }

      setSummary(summaryText);
      setWordCount({
        original: words.length,
        summary: summaryText.split(/\s+/).filter(w => w.length > 0).length,
      });

      toast.success('Text summarized successfully!');
    } catch (error) {
      toast.error('Error summarizing text');
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard!');
  };

  const clearAll = () => {
    setInputText('');
    setSummary('');
    setWordCount({ original: 0, summary: 0 });
  };

  const calculateCompression = () => {
    if (wordCount.original === 0) return 0;
    return Math.round((1 - wordCount.summary / wordCount.original) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Text Summarizer - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="input">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input Text</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="input-text">Text to Summarize</Label>
                <Textarea
                  id="input-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type the text you want to summarize... (minimum 100 words recommended)"
                  className="min-h-[250px] font-mono text-sm"
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
                  <Label>Summary Length</Label>
                  <div className="flex gap-2">
                    {(['short', 'medium', 'long'] as const).map((len) => (
                      <Badge
                        key={len}
                        variant={summaryLength === len ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => setSummaryLength(len)}
                      >
                        {len}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summaryLength === 'short' && '1-2 sentences (very concise)'}
                    {summaryLength === 'medium' && '3-4 sentences (balanced)'}
                    {summaryLength === 'long' && '5+ sentences (detailed)'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <div className="flex gap-2">
                    {(['paragraph', 'bullets', 'key-points'] as const).map((fmt) => (
                      <Badge
                        key={fmt}
                        variant={summaryFormat === fmt ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => setSummaryFormat(fmt)}
                      >
                        {fmt.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={summarizeText}
            disabled={isSummarizing || !inputText.trim()}
            className="w-full"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize Text
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Summary
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
                {summary}
              </pre>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{wordCount.original}</div>
                <div className="text-xs text-muted-foreground">Original Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{wordCount.summary}</div>
                <div className="text-xs text-muted-foreground">Summary Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{calculateCompression()}%</div>
                <div className="text-xs text-muted-foreground">Compression</div>
              </div>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>✓ Compression Rate:</strong> Reduced from {wordCount.original} to {wordCount.summary} words 
                ({calculateCompression()}% reduction)
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
              About AI Text Summarizer
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> Our AI analyzes your text and extracts the most important 
                information to create a concise summary while preserving key points.
              </p>
              <p>
                <strong>Features:</strong> Multiple summary lengths, various output formats, 
                real-time compression stats, and copy-to-clipboard functionality.
              </p>
              <p>
                <strong>Note:</strong> This demo uses extractive summarization. In production, 
                this would connect to advanced AI models like GPT-4, Claude, or Sarvam AI for 
                abstractive summarization.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {['Research Papers', 'News Articles', 'Meeting Notes', 'Legal Documents', 'Blog Posts', 'Reports'].map((use) => (
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

export default AiTextSummarizer;
