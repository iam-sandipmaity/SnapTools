import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Download, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownTableGenerator = () => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [alignment, setAlignment] = useState<('left' | 'center' | 'right')[]>(['left', 'left', 'left']);
  const [tableData, setTableData] = useState<string[][]>([
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
  ]);
  const [markdown, setMarkdown] = useState('');
  const { toast } = useToast();

  const generateMarkdown = () => {
    let md = '| ';
    
    // Headers
    for (let j = 0; j < cols; j++) {
      md += `${tableData[0][j] || `Header ${j + 1}`} | `;
    }
    md += '\n| ';
    
    // Alignment row
    for (let j = 0; j < cols; j++) {
      const align = alignment[j] || 'left';
      if (align === 'left') {
        md += ':--- | ';
      } else if (align === 'center') {
        md += ':---: | ';
      } else {
        md += '---: | ';
      }
    }
    md += '\n';
    
    // Data rows
    for (let i = 1; i < rows; i++) {
      md += '| ';
      for (let j = 0; j < cols; j++) {
        md += `${tableData[i]?.[j] || ''} | `;
      }
      md += '\n';
    }
    
    setMarkdown(md);
    return md;
  };

  const updateCell = (row: number, col: number, value: string) => {
    const newData = [...tableData];
    if (!newData[row]) {
      newData[row] = [];
    }
    newData[row][col] = value;
    setTableData(newData);
  };

  const addRow = () => {
    const newRows = rows + 1;
    setRows(newRows);
    const newData = [...tableData];
    newData.push(Array(cols).fill(''));
    setTableData(newData);
  };

  const removeRow = () => {
    if (rows > 2) {
      const newRows = rows - 1;
      setRows(newRows);
      const newData = tableData.slice(0, -1);
      setTableData(newData);
    }
  };

  const addColumn = () => {
    const newCols = cols + 1;
    setCols(newCols);
    const newData = tableData.map(row => [...row, '']);
    setTableData(newData);
    setAlignment([...alignment, 'left']);
  };

  const removeColumn = () => {
    if (cols > 2) {
      const newCols = cols - 1;
      setCols(newCols);
      const newData = tableData.map(row => row.slice(0, -1));
      setTableData(newData);
      setAlignment(alignment.slice(0, -1));
    }
  };

  const updateAlignment = (col: number, value: 'left' | 'center' | 'right') => {
    const newAlignment = [...alignment];
    newAlignment[col] = value;
    setAlignment(newAlignment);
  };

  const handleCopy = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    toast({
      title: 'Copied!',
      description: 'Markdown table copied to clipboard',
    });
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Markdown table downloaded successfully',
    });
  };

  const handleGenerate = () => {
    generateMarkdown();
    toast({
      title: 'Generated!',
      description: 'Markdown table generated successfully',
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Markdown Table Generator</h1>
        <p className="text-muted-foreground">
          Create formatted markdown tables with custom rows, columns, and alignment
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Table Builder</h2>
          
          <div className="flex gap-4 mb-4">
            <div>
              <Label>Rows: {rows}</Label>
              <div className="flex gap-2 mt-2">
                <Button onClick={removeRow} variant="outline" size="sm" disabled={rows <= 2}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button onClick={addRow} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Columns: {cols}</Label>
              <div className="flex gap-2 mt-2">
                <Button onClick={removeColumn} variant="outline" size="sm" disabled={cols <= 2}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button onClick={addColumn} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <th key={colIndex} className="border border-border p-2 bg-muted/30">
                      <Input
                        value={tableData[0]?.[colIndex] || ''}
                        onChange={(e) => updateCell(0, colIndex, e.target.value)}
                        placeholder={`Header ${colIndex + 1}`}
                        className="text-center font-semibold"
                      />
                      <Select
                        value={alignment[colIndex] || 'left'}
                        onValueChange={(value: 'left' | 'center' | 'right') =>
                          updateAlignment(colIndex, value)
                        }
                      >
                        <SelectTrigger className="mt-2 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rows - 1 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/20 transition-colors">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                      <td key={colIndex} className="border border-border p-2">
                        <Input
                          value={tableData[rowIndex + 1]?.[colIndex] || ''}
                          onChange={(e) => updateCell(rowIndex + 1, colIndex, e.target.value)}
                          placeholder={`Row ${rowIndex + 1} Col ${colIndex + 1}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button onClick={handleGenerate} className="w-full mt-4">
            Generate Markdown
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Markdown</h2>
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
            className="min-h-[200px] font-mono text-sm mb-4"
            placeholder="Generated markdown will appear here..."
          />

          {markdown && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Preview</h3>
              <div className="border rounded-md p-4 bg-card prose prose-sm dark:prose-invert max-w-none overflow-x-auto [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary/80 [&_a:hover]:no-underline [&_strong]:font-bold [&_em]:italic [&_del]:line-through [&_hr]:border-border [&_hr]:my-4 [&_img]:rounded-md [&_img]:max-w-full [&_p]:mb-4 [&_p]:leading-7">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Tips</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <div>
              <strong>Add/Remove Rows/Columns:</strong> Use the plus and minus buttons to adjust table size
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <div>
              <strong>Text Alignment:</strong> Choose left, center, or right alignment for each column
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <div>
              <strong>Preview:</strong> See real-time preview of your markdown table
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <div>
              <strong>Export:</strong> Copy to clipboard or download as a .md file
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default MarkdownTableGenerator;
