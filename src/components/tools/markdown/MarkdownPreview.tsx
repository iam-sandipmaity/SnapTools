import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState(`# Markdown Preview Tool

Paste your markdown content below to see the rendered preview.

## Example Features
- **Bold text**
- *Italic text*
- \`inline code\`

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Links
[Visit SnapTools](https://snaptools.xyz)

### Lists
1. First item
2. Second item
3. Third item

- Bullet point 1
- Bullet point 2

> Blockquote example

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
`);
  const { toast } = useToast();

  const handleCopy = () => {
    const preview = document.querySelector('.markdown-preview');
    if (preview) {
      navigator.clipboard.writeText(preview.textContent || '');
      toast({
        title: 'Copied!',
        description: 'Preview content copied to clipboard',
      });
    }
  };

  const handleExportHtml = () => {
    const preview = document.querySelector('.markdown-preview');
    if (preview) {
      const html = preview.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'preview.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Exported!',
        description: 'HTML file exported successfully',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Markdown Preview</h1>
        <p className="text-muted-foreground">
          Paste markdown content and see the rendered output
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Input</h2>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Paste your markdown here..."
          />
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleExportHtml} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
            </div>
          </div>
          <div className="markdown-preview border rounded-md p-6 min-h-[500px] overflow-auto bg-card prose prose-sm dark:prose-invert max-w-none [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary/80 [&_a:hover]:no-underline [&_strong]:font-bold [&_em]:italic [&_del]:line-through [&_hr]:border-border [&_hr]:my-4 [&_img]:rounded-md [&_img]:max-w-full [&_p]:mb-4 [&_p]:leading-7">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Markdown Syntax Guide</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Headers</h3>
            <code className="block bg-muted p-2 rounded mb-4">
              # H1<br />
              ## H2<br />
              ### H3
            </code>

            <h3 className="font-semibold mb-2">Emphasis</h3>
            <code className="block bg-muted p-2 rounded mb-4">
              *italic* or _italic_<br />
              **bold** or __bold__<br />
              ***bold italic***
            </code>

            <h3 className="font-semibold mb-2">Lists</h3>
            <code className="block bg-muted p-2 rounded">
              - Unordered item<br />
              - Another item<br />
              <br />
              1. Ordered item<br />
              2. Another item
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Links & Images</h3>
            <code className="block bg-muted p-2 rounded mb-4">
              [Link text](url)<br />
              ![Alt text](image-url)
            </code>

            <h3 className="font-semibold mb-2">Code</h3>
            <code className="block bg-muted p-2 rounded mb-4">
              `inline code`<br />
              <br />
              ```language<br />
              code block<br />
              ```
            </code>

            <h3 className="font-semibold mb-2">Tables</h3>
            <code className="block bg-muted p-2 rounded">
              | Col1 | Col2 |<br />
              |------|------|<br />
              | Val1 | Val2 |
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarkdownPreview;
