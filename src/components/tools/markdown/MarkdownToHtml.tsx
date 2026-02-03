import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarkdownToHtml = () => {
  const [markdown, setMarkdown] = useState(`# Sample Markdown

This is a **markdown to HTML** converter.

## Features
- Convert markdown to clean HTML
- Copy or download results
- Safe HTML sanitization

\`\`\`javascript
console.log('Hello World');
\`\`\`

[Visit our website](https://snaptools.xyz)

> This is a blockquote
`);
  const [html, setHtml] = useState('');
  const { toast } = useToast();

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const convertToHtml = () => {
    try {
      const rawHtml = marked(markdown) as string;
      const sanitizedHtml = DOMPurify.sanitize(rawHtml);
      setHtml(sanitizedHtml);
      toast({
        title: 'Converted!',
        description: 'Markdown converted to HTML successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert markdown to HTML',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    toast({
      title: 'Copied!',
      description: 'HTML content copied to clipboard',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'HTML file downloaded successfully',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setMarkdown(content);
        toast({
          title: 'File Loaded!',
          description: 'Markdown file loaded successfully',
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Markdown to HTML Converter</h1>
        <p className="text-muted-foreground">
          Convert markdown content to clean, sanitized HTML
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Markdown Input</h2>
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">Upload .md</span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[400px] font-mono text-sm mb-4"
            placeholder="Enter your markdown here..."
          />
          <Button onClick={convertToHtml} className="w-full">
            <ArrowRight className="w-4 h-4 mr-2" />
            Convert to HTML
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">HTML Output</h2>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm" disabled={!html}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm" disabled={!html}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <Textarea
            value={html}
            readOnly
            className="min-h-[400px] font-mono text-sm mb-4"
            placeholder="HTML output will appear here..."
          />
          {html && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Preview</h3>
              <div
                className="border rounded-md p-4 bg-card prose prose-sm dark:prose-invert max-w-none [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary/80 [&_a:hover]:no-underline [&_strong]:font-bold [&_em]:italic [&_del]:line-through [&_hr]:border-border [&_hr]:my-4 [&_img]:rounded-md [&_img]:max-w-full [&_p]:mb-4 [&_p]:leading-7"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>GitHub Flavored Markdown:</strong> Full support for GFM syntax including tables, task lists, and more
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>HTML Sanitization:</strong> Output is sanitized using DOMPurify for security
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>Code Highlighting:</strong> Preserves code block formatting
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>Export Options:</strong> Copy to clipboard or download as .html file
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default MarkdownToHtml;
