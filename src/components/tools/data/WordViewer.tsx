import { useState, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Download,
    Upload,
    FileText,
    Loader2,
    Save,
    Printer,
    FileDown,
    FileType,
    Eye,
    Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './WordViewer.css';

const WordViewer = () => {
    const [content, setContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const quillRef = useRef<ReactQuill>(null);

    // Quill editor modules configuration
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false,
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    // Upload and convert Word document
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if it's a Word document
        if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
            toast.error('Please upload a Word document (.docx or .doc)');
            return;
        }

        setIsLoading(true);
        setFileName(file.name);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Convert Word document to HTML
            const result = await mammoth.convertToHtml({ arrayBuffer });

            if (result.messages.length > 0) {
                console.warn('Conversion warnings:', result.messages);
            }

            // Sanitize HTML to prevent XSS attacks
            const sanitizedContent = DOMPurify.sanitize(result.value);
            setContent(sanitizedContent);
            setHasContent(true);
            setIsEditMode(true);
            toast.success(`Loaded ${file.name} - Ready to edit!`);
        } catch (error) {
            console.error('Error reading Word document:', error);
            toast.error('Failed to read Word document. Please try another file.');
            setContent('');
            setHasContent(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Download as DOCX (HTML wrapped)
    const handleDownloadDOCX = () => {
        if (!content.trim()) {
            toast.error('Nothing to download');
            return;
        }

        const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>${fileName.replace('.docx', '').replace('.doc', '')}</title>
    <style>
        @page {
            size: 8.5in 11in;
            margin: 1in;
        }
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
        }
        h1 { font-size: 16pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 10pt; margin-bottom: 5pt; }
        h3 { font-size: 12pt; font-weight: bold; margin-top: 8pt; margin-bottom: 4pt; }
        p { margin: 0 0 10pt 0; }
        table { border-collapse: collapse; width: 100%; }
        table, th, td { border: 1px solid #000; }
        th, td { padding: 5pt; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'document.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Downloaded as Word document');
    };

    // Download as HTML
    const handleDownloadHTML = () => {
        if (!content.trim()) {
            toast.error('Nothing to download');
            return;
        }

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.docx', '').replace('.doc', '')}</title>
    <style>
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            max-width: 8.5in;
            margin: 40px auto;
            padding: 1in;
            color: #333;
            background: white;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
        }
        p {
            margin-bottom: 16px;
        }
        ul, ol {
            margin-bottom: 16px;
            padding-left: 30px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 16px;
            margin-left: 0;
            color: #666;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace('.docx', '.html').replace('.doc', '.html') || 'document.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Downloaded as HTML');
    };

    // Download as PDF (print to PDF)
    const handlePrint = () => {
        if (!content.trim()) {
            toast.error('Nothing to print');
            return;
        }
        window.print();
        toast.success('Opening print dialog...');
    };

    // Download as plain text
    const handleDownloadText = () => {
        if (!content.trim()) {
            toast.error('Nothing to download');
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        const blob = new Blob([plainText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace('.docx', '.txt').replace('.doc', '.txt') || 'document.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Downloaded as text');
    };

    // Create new document
    const handleNewDocument = () => {
        setContent('<p><br></p>');
        setFileName('Untitled Document.docx');
        setHasContent(true);
        setIsEditMode(true);
        toast.success('New document created');
    };

    return (
        <div className="container max-w-7xl py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold">Word Viewer & Editor</h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Professional Word document editor. Create, edit, and convert documents with a Microsoft Word-like experience.
                    </p>
                </div>

                <Card className="p-6 mb-6">
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        <Button
                            onClick={handleNewDocument}
                            variant="default"
                            className="gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            New Document
                        </Button>

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Open DOCX
                                </>
                            )}
                        </Button>

                        <div className="w-px h-8 bg-border"></div>

                        <Button
                            onClick={handleDownloadDOCX}
                            variant="outline"
                            className="gap-2"
                            disabled={!hasContent || isLoading}
                        >
                            <Save className="w-4 h-4" />
                            Save as DOCX
                        </Button>

                        <Button
                            onClick={handleDownloadHTML}
                            variant="outline"
                            className="gap-2"
                            disabled={!hasContent || isLoading}
                        >
                            <FileDown className="w-4 h-4" />
                            Save as HTML
                        </Button>

                        <Button
                            onClick={handleDownloadText}
                            variant="outline"
                            className="gap-2"
                            disabled={!hasContent || isLoading}
                        >
                            <FileType className="w-4 h-4" />
                            Save as TXT
                        </Button>

                        <div className="w-px h-8 bg-border"></div>

                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            className="gap-2"
                            disabled={!hasContent || isLoading}
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </Button>

                        <div className="ml-auto flex gap-2">
                            <Button
                                onClick={() => setIsEditMode(true)}
                                variant={isEditMode ? "default" : "outline"}
                                size="sm"
                                className="gap-2"
                                disabled={!hasContent}
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </Button>
                            <Button
                                onClick={() => setIsEditMode(false)}
                                variant={!isEditMode ? "default" : "outline"}
                                size="sm"
                                className="gap-2"
                                disabled={!hasContent}
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </Button>
                        </div>
                    </div>

                    {/* File Name */}
                    {fileName && (
                        <div className="mb-4">
                            <Label htmlFor="filename" className="mb-2 block">Document Name</Label>
                            <input
                                id="filename"
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className="w-full max-w-md px-3 py-2 border border-border rounded-md bg-background"
                                placeholder="Untitled Document.docx"
                            />
                        </div>
                    )}

                    {/* Editor / Viewer */}
                    {!hasContent && !isLoading && (
                        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Document Open</h3>
                            <p className="text-muted-foreground mb-4">
                                Create a new document or open an existing Word file to get started
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={handleNewDocument}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    New Document
                                </Button>
                                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Open DOCX
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="border border-border rounded-lg p-12 text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">Converting Word document...</p>
                        </div>
                    )}

                    {hasContent && !isLoading && (
                        <div className="word-editor-container">
                            {isEditMode ? (
                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Start typing your document..."
                                    className="word-editor"
                                />
                            ) : (
                                <div className="word-preview border border-border rounded-lg p-8 bg-white dark:bg-gray-900 min-h-[600px]">
                                    <div
                                        className="prose prose-slate dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                            <Edit3 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Rich Text Editing</h3>
                        <p className="text-sm text-muted-foreground">
                            Full-featured WYSIWYG editor with formatting, lists, tables, and more.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">DOCX Support</h3>
                        <p className="text-sm text-muted-foreground">
                            Open, edit, and save Microsoft Word .docx files directly in your browser.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                            <Download className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Multiple Formats</h3>
                        <p className="text-sm text-muted-foreground">
                            Export to DOCX, HTML, TXT, or print to PDF with one click.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                            <Eye className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Edit & Preview</h3>
                        <p className="text-sm text-muted-foreground">
                            Switch between edit and preview modes to see your document as readers will.
                        </p>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default WordViewer;
