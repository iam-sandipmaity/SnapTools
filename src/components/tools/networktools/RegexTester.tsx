import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Copy, Trash2, BookOpen, Zap } from 'lucide-react';
import { toast } from 'sonner';

const RegexTester = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('tester');

  // Common regex patterns for quick access
  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'g' },
    { name: 'IP Address', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', flags: 'g' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
    { name: 'Hex Color', pattern: '#?([a-f0-9]{6}|[a-f0-9]{3})', flags: 'gi' },
    { name: 'HTML Tag', pattern: '<[^>]+>', flags: 'g' },
    { name: 'Credit Card', pattern: '\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}', flags: 'g' },
  ];

  // Test regex on string
  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      setError('');
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setIsValid(true);
      setError('');

      if (!testString) {
        setMatches([]);
        return;
      }

      const allMatches: RegExpMatchArray[] = [];
      let match: RegExpMatchArray | null;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          allMatches.push({ ...match });
          if (!flags.includes('g')) break;
        }
      } else {
        match = regex.exec(testString);
        if (match) allMatches.push(match);
      }

      setMatches(allMatches);
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      setMatches([]);
    }
  };

  // Run test when pattern, flags, or test string changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      testRegex();
    }, 300);

    return () => clearTimeout(debounce);
  }, [pattern, flags, testString]);

  // Highlight matches in test string
  const highlightedText = useMemo(() => {
    if (!testString || matches.length === 0) return testString;

    let result = [];
    let lastIndex = 0;

    const sortedMatches = [...matches].sort((a, b) => (a.index || 0) - (b.index || 0));

    sortedMatches.forEach((match, i) => {
      const index = match.index || 0;
      const matchEnd = index + match[0].length;

      // Add text before match
      if (index > lastIndex) {
        result.push(testString.slice(lastIndex, index));
      }

      // Add highlighted match
      result.push(
        `<mark class="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">${match[0]}</mark>`
      );

      lastIndex = matchEnd;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      result.push(testString.slice(lastIndex));
    }

    return result.join('');
  }, [testString, matches]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const loadPattern = (p: string, f: string) => {
    setPattern(p);
    setFlags(f);
  };

  const clearAll = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Regex Tester - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pattern Input */}
          <div className="space-y-2">
            <Label htmlFor="regex-pattern">Regular Expression Pattern</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
                <Input
                  id="regex-pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter regex pattern..."
                  className={`pl-6 font-mono ${!isValid ? 'border-red-500' : ''}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/{flags}</span>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Flags Selection */}
          <div className="space-y-2">
            <Label>Flags</Label>
            <div className="flex gap-2 flex-wrap">
              {['g', 'i', 'm', 's', 'u', 'y'].map((flag) => (
                <Badge
                  key={flag}
                  variant={flags.includes(flag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (flags.includes(flag)) {
                      setFlags(flags.replace(flag, ''));
                    } else {
                      setFlags(flags + flag);
                    }
                  }}
                >
                  {flag} - {
                    flag === 'g' ? 'Global' :
                    flag === 'i' ? 'Case Insensitive' :
                    flag === 'm' ? 'Multiline' :
                    flag === 's' ? 'Dotall' :
                    flag === 'u' ? 'Unicode' :
                    flag === 'y' ? 'Sticky' : ''
                  }
                </Badge>
              ))}
            </div>
          </div>

          {/* Test String */}
          <div className="space-y-2">
            <Label htmlFor="test-string">Test String</Label>
            <Textarea
              id="test-string"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              className="min-h-[150px] font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={testRegex} className="flex-1">
              <Zap className="mr-2 h-4 w-4" />
              Test Regex
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tester">Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="highlight">Highlighted Text</TabsTrigger>
          <TabsTrigger value="cheatsheet">Cheat Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="tester" className="space-y-4 mt-4">
          {matches.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="default">Match {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(match[0])}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <code className="block text-sm font-mono bg-background p-2 rounded">
                        {match[0]}
                      </code>
                      {match.groups && Object.keys(match.groups).length > 0 && (
                        <div className="text-sm">
                          <strong>Groups:</strong>
                          <pre className="mt-1 text-xs bg-background p-2 rounded">
                            {JSON.stringify(match.groups, null, 2)}
                          </pre>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Index: {match.index} | Length: {match[0].length}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>
                {pattern ? 'No matches found.' : 'Enter a regex pattern to see matches.'}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="highlight" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div
                className="min-h-[150px] p-4 bg-muted rounded-lg font-mono whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightedText || 'Enter test string to see highlighted matches...'
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cheatsheet" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Common Patterns (Click to use)
                </h3>
                <div className="grid gap-3">
                  {commonPatterns.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => loadPattern(item.pattern, item.flags)}
                    >
                      <div className="font-semibold text-sm">{item.name}</div>
                      <code className="text-xs text-muted-foreground break-all">
                        /{item.pattern}/{item.flags}
                      </code>
                    </div>
                     ))}
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegexTester;
