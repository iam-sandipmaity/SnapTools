import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Editor

## Features
- Live preview
- GitHub Flavored Markdown
- Export to file
- Copy to clipboard

### Example Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Example Table
| Feature | Supported |
|---------|-----------|
| Tables  | ✓         |
| Lists   | ✓         |
| Code    | ✓         |

**Bold text** and *italic text*

> This is a blockquote

- List item 1
- List item 2
  - Nested item

1. Numbered list
2. Second item
`);
  const { toast } = useToast();

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
    a.download = 'document.md';
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
        <h1 className="text-3xl font-bold mb-2">Markdown Editor</h1>
        <p className="text-muted-foreground">
          Write and preview markdown with live rendering
        </p>
      </div>

      <Card className="p-6">
        <div className="flex gap-2 mb-4">
          <Button onClick={handleCopy} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </span>
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

        <Tabs defaultValue="split" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="split">Split View</TabsTrigger>
            <TabsTrigger value="editor">Editor Only</TabsTrigger>
            <TabsTrigger value="preview">Preview Only</TabsTrigger>
          </TabsList>

          <TabsContent value="split" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Markdown Input</h3>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Enter your markdown here..."
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Live Preview</h3>
                <div className="border rounded-md p-4 min-h-[600px] overflow-auto bg-card prose prose-sm dark:prose-invert max-w-none [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary/80 [&_a:hover]:no-underline [&_strong]:font-bold [&_em]:italic [&_del]:line-through [&_hr]:border-border [&_hr]:my-4 [&_img]:rounded-md [&_img]:max-w-full [&_p]:mb-4 [&_p]:leading-7">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="mt-4">
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
              placeholder="Enter your markdown here..."
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-md p-6 min-h-[600px] overflow-auto bg-card prose prose-sm dark:prose-invert max-w-none [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary/80 [&_a:hover]:no-underline [&_strong]:font-bold [&_em]:italic [&_del]:line-through [&_hr]:border-border [&_hr]:my-4 [&_img]:rounded-md [&_img]:max-w-full [&_p]:mb-4 [&_p]:leading-7">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MarkdownEditor;
