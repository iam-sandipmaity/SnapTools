import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TurndownService from 'turndown';

const HtmlToMarkdown = () => {
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <title>Sample HTML</title>
</head>
<body>
  <h1>HTML to Markdown Converter</h1>
  <p>This tool converts <strong>HTML</strong> to <em>Markdown</em>.</p>
  
  <h2>Features</h2>
  <ul>
    <li>Convert HTML to markdown</li>
    <li>Preserve formatting</li>
    <li>Clean output</li>
  </ul>
  
  <blockquote>
    <p>This is a blockquote example</p>
  </blockquote>
  
  <pre><code>console.log('Hello World');</code></pre>
  
  <a href="https://snaptools.xyz">Visit SnapTools</a>
</body>
</html>`);
  const [markdown, setMarkdown] = useState('');
  const { toast } = useToast();

  const convertToMarkdown = () => {
    try {
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-',
      });

      // Add custom rules for better conversion
      turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: (content) => '~~' + content + '~~'
      });

      const result = turndownService.turndown(html);
      setMarkdown(result);
      toast({
        title: 'Converted!',
        description: 'HTML converted to Markdown successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert HTML to Markdown',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    toast({
      title: 'Copied!',
      description: 'Markdown content copied to clipboard',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Markdown file downloaded successfully',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setHtml(content);
        toast({
          title: 'File Loaded!',
          description: 'HTML file loaded successfully',
        });
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setHtml('');
    setMarkdown('');
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">HTML to Markdown Converter</h1>
        <p className="text-muted-foreground">
          Convert HTML content to clean Markdown format
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">HTML Input</h2>
            <div className="flex gap-2">
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">Upload .html</span>
                </Button>
              </label>
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="min-h-[400px] font-mono text-sm mb-4"
            placeholder="Paste your HTML here..."
          />
          <Button onClick={convertToMarkdown} className="w-full">
            <ArrowRight className="w-4 h-4 mr-2" />
            Convert to Markdown
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Markdown Output</h2>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm" disabled={!markdown}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm" disabled={!markdown}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <Textarea
            value={markdown}
            readOnly
            className="min-h-[400px] font-mono text-sm"
            placeholder="Markdown output will appear here..."
          />
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Conversion Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Supported HTML Elements</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Headings (h1-h6)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Paragraphs and line breaks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Bold, italic, and strikethrough
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Links and images
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Lists (ordered and unordered)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Code blocks and inline code
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Blockquotes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Tables
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Output Options</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                ATX-style headings (# ## ###)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Fenced code blocks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Dash bullet lists
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Clean, readable output
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Preserves semantic structure
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Copy or download results
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HtmlToMarkdown;
