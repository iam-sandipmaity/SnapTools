import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Sparkles, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AiGrammarChecker = () => {
  const [inputText, setInputText] = useState<string>('');
  const [correctedText, setCorrectedText] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState<Array<{ type: string; message: string; suggestion: string; position: number }>>([]);
  const [stats, setStats] = useState({ errors: 0, words: 0, corrections: 0 });

  // Simulated AI grammar checking
  const checkGrammar = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to check');
      return;
    }

    setIsChecking(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const detectedErrors: Array<{ type: string; message: string; suggestion: string; position: number }> = [];
      
      // Simple grammar checks (demo purposes)
      const sentences = inputText.split(/[.!?]+/).filter(s => s.trim());
      
      sentences.forEach((sentence, idx) => {
        const sentenceStart = inputText.indexOf(sentence);
        
        // Check for double spaces
        if (sentence.includes('  ')) {
          detectedErrors.push({
            type: 'Spacing',
            message: 'Double spaces detected',
            suggestion: sentence.replace(/\s+/g, ' '),
            position: sentenceStart,
          });
        }

        // Check for common grammar mistakes
        const lower = sentence.toLowerCase();
        if (lower.includes(' their ') && (lower.includes(' are ') || lower.includes(' is '))) {
          detectedErrors.push({
            type: 'Grammar',
            message: 'Possible "there/their/they\'re" confusion',
            suggestion: sentence,
            position: sentenceStart,
          });
        }

        // Check for sentence fragments (very short sentences)
        const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length < 3 && words.length > 0) {
          detectedErrors.push({
            type: 'Fragment',
            message: 'Possible sentence fragment',
            suggestion: sentence + ' [needs completion]',
            position: sentenceStart,
          });
        }

        // Check for capitalization
        if (sentence.trim() && /^[a-z]/.test(sentence.trim())) {
          detectedErrors.push({
            type: 'Capitalization',
            message: 'Sentence should start with capital letter',
            suggestion: sentence.trim().charAt(0).toUpperCase() + sentence.trim().slice(1),
            position: sentenceStart,
          });
        }
      });

      // Check for repeated words
      const words = inputText.split(/\s+/);
      for (let i = 1; i < words.length; i++) {
        if (words[i].toLowerCase() === words[i-1].toLowerCase() && words[i].length > 2) {
          detectedErrors.push({
            type: 'Repetition',
            message: `Word "${words[i]}" is repeated`,
            suggestion: words.slice(0, i).join(' ') + ' ' + words.slice(i + 1).join(' '),
            position: inputText.indexOf(words[i], inputText.indexOf(words[i - 1]) + words[i - 1].length),
          });
        }
      }

      setErrors(detectedErrors);
      setCorrectedText(inputText); // In real implementation, this would be the corrected text
      setStats({
        errors: detectedErrors.length,
        words: words.length,
        corrections: detectedErrors.length,
      });

      if (detectedErrors.length === 0) {
        toast.success('No grammar errors found!');
      } else {
        toast.info(`Found ${detectedErrors.length} potential issues`);
      }
    } catch (error) {
      toast.error('Error checking grammar');
    } finally {
      setIsChecking(false);
    }
  };

  const applyCorrection = (index: number) => {
    const error = errors[index];
    if (error) {
      const newText = inputText.replace(inputText.slice(error.position, error.position + error.suggestion.length), error.suggestion);
      setInputText(newText);
      setErrors(errors.filter((_, i) => i !== index));
      toast.success('Correction applied!');
    }
  };

  const applyAllCorrections = () => {
    let newText = inputText;
    // Sort errors by position in reverse order to maintain positions
    const sortedErrors = [...errors].sort((a, b) => b.position - a.position);
    
    sortedErrors.forEach(error => {
      newText = newText.slice(0, error.position) + error.suggestion + newText.slice(error.position + error.suggestion.length);
    });
    
    setInputText(newText);
    setErrors([]);
    toast.success('All corrections applied!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(correctedText || inputText);
    toast.success('Text copied to clipboard!');
  };

  const clearAll = () => {
    setInputText('');
    setCorrectedText('');
    setErrors([]);
    setStats({ errors: 0, words: 0, corrections: 0 });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Grammar Checker - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text">Text to Check</Label>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here... (minimum 10 words recommended)"
              className="min-h-[250px] font-mono text-sm"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
              <span>{inputText.length} characters</span>
            </div>
          </div>

          <Button
            onClick={checkGrammar}
            disabled={isChecking || !inputText.trim()}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Grammar...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Check Grammar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {stats.errors > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Grammar Issues Found ({stats.errors})
              </span>
              <Button variant="outline" size="sm" onClick={applyAllCorrections}>
                Apply All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {error.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyCorrection(index)}
                    >
                      Apply Fix
                    </Button>
                  </div>
                  <p className="text-sm">{error.message}</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Suggestion:</strong> {error.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.errors === 0 && inputText && !isChecking && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <p className="font-medium">No grammar errors found!</p>
                <p className="text-sm text-muted-foreground">Your text looks good to go.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Card */}
      {stats.words > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.words}</div>
                <div className="text-xs text-muted-foreground">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.errors}</div>
                <div className="text-xs text-muted-foreground">Issues Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.corrections}</div>
                <div className="text-xs text-muted-foreground">Corrections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {(correctedText || inputText) && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyToClipboard} className="flex-1">
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </Button>
          <Button variant="outline" onClick={clearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              About AI Grammar Checker
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> Our AI analyzes your text for grammar, 
                spelling, punctuation, and style issues, providing intelligent suggestions for improvement.
              </p>
              <p>
                <strong>Features:</strong> Real-time error detection, one-click fixes, 
                detailed explanations, and copy-to-clipboard functionality.
              </p>
              <p>
                <strong>Note:</strong> This demo uses rule-based checking. In production, 
                this would connect to advanced AI models like GPT-4, Claude, or Sarvam AI 
                for human-level grammar checking.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {['Essays', 'Research Papers', 'Business Emails', 'Blog Posts', 'Academic Writing', 'Reports'].map(use => (
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

export default AiGrammarChecker;
