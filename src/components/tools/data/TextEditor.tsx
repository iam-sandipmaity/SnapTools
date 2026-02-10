import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Upload, Copy, Trash2, FileText, Type, AlignLeft, Bold, Italic, Underline } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const TextEditor = () => {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('document.txt');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [lineCount, setLineCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update statistics when text changes
    const handleTextChange = (value: string) => {
        setText(value);

        // Count words (non-empty words)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);

        // Count characters
        setCharCount(value.length);

        // Count lines
        const lines = value.split('\n').length;
        setLineCount(lines);
    };

    // Upload text file
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if it's a text file
        if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
            toast.error('Please upload a text file (.txt)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            handleTextChange(content);
            setFileName(file.name);
            toast.success(`Loaded ${file.name}`);
        };
        reader.onerror = () => {
            toast.error('Failed to read file');
        };
        reader.readAsText(file);
    };

    // Download text file
    const handleDownload = () => {
        if (!text.trim()) {
            toast.error('Nothing to download');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('File downloaded successfully');
    };

    // Copy to clipboard
    const handleCopy = async () => {
        if (!text.trim()) {
            toast.error('Nothing to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    // Clear text
    const handleClear = () => {
        setText('');
        setWordCount(0);
        setCharCount(0);
        setLineCount(0);
        setFileName('document.txt');
        toast.success('Text cleared');
    };

    // Text formatting functions
    const insertFormatting = (before: string, after: string = '') => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);
        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);

        handleTextChange(newText);

        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    return (
        <div className="container max-w-6xl py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold">Text Editor & Viewer</h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Edit and view text files online. Upload, edit, format, and download text documents with live statistics.
                    </p>
                </div>

                <Card className="p-6">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,text/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Text File
                        </Button>

                        <Button
                            onClick={handleDownload}
                            variant="outline"
                            className="gap-2"
                            disabled={!text.trim()}
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </Button>

                        <Button
                            onClick={handleCopy}
                            variant="outline"
                            className="gap-2"
                            disabled={!text.trim()}
                        >
                            <Copy className="w-4 h-4" />
                            Copy
                        </Button>

                        <Button
                            onClick={handleClear}
                            variant="outline"
                            className="gap-2"
                            disabled={!text.trim()}
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </Button>
                    </div>

                    {/* Formatting Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                        <Button
                            onClick={() => insertFormatting('**', '**')}
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            title="Bold (Markdown)"
                        >
                            <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => insertFormatting('*', '*')}
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            title="Italic (Markdown)"
                        >
                            <Italic className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => insertFormatting('__', '__')}
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            title="Underline (Markdown)"
                        >
                            <Underline className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-6 bg-border my-auto mx-1"></div>
                        <Button
                            onClick={() => insertFormatting('# ', '')}
                            variant="ghost"
                            size="sm"
                            title="Heading"
                        >
                            H1
                        </Button>
                        <Button
                            onClick={() => insertFormatting('## ', '')}
                            variant="ghost"
                            size="sm"
                            title="Heading 2"
                        >
                            H2
                        </Button>
                        <Button
                            onClick={() => insertFormatting('### ', '')}
                            variant="ghost"
                            size="sm"
                            title="Heading 3"
                        >
                            H3
                        </Button>
                        <div className="w-px h-6 bg-border my-auto mx-1"></div>
                        <Button
                            onClick={() => insertFormatting('- ', '')}
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            title="Bullet List"
                        >
                            <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => insertFormatting('> ', '')}
                            variant="ghost"
                            size="sm"
                            title="Quote"
                        >
                            <Type className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* File Name Input */}
                    <div className="mb-4">
                        <Label htmlFor="filename" className="mb-2 block">File Name</Label>
                        <input
                            id="filename"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                            placeholder="document.txt"
                        />
                    </div>

                    {/* Text Editor */}
                    <div className="mb-4">
                        <Label htmlFor="text-editor" className="mb-2 block">Text Content</Label>
                        <Textarea
                            id="text-editor"
                            value={text}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder="Start typing or upload a text file..."
                            className="min-h-[400px] font-mono text-sm"
                        />
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{wordCount}</div>
                            <div className="text-sm text-muted-foreground">Words</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{charCount}</div>
                            <div className="text-sm text-muted-foreground">Characters</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{lineCount}</div>
                            <div className="text-sm text-muted-foreground">Lines</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                                {text.trim() ? Math.ceil(wordCount / 200) : 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Min Read</div>
                        </div>
                    </div>
                </Card>

                {/* Features */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">File Support</h3>
                        <p className="text-sm text-muted-foreground">
                            Upload and download .txt files. Works with any plain text format.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                            <Type className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Live Statistics</h3>
                        <p className="text-sm text-muted-foreground">
                            Real-time word count, character count, line count, and reading time.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                            <AlignLeft className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Markdown Support</h3>
                        <p className="text-sm text-muted-foreground">
                            Quick formatting toolbar with Markdown syntax support.
                        </p>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default TextEditor;
