import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import {
    Upload,
    FileText,
    Sparkles,
    Languages,
    Eye,
    Search,
    Copy,
    Download,
    RefreshCw,
    Loader2,
    FileType,
    Settings,
    Shield,
    X,
    MessageSquare,
    Globe,
    Brain,
    AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import JSZip from 'jszip';

const INDIC_LANGUAGES = [
    { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
    { code: 'en-IN', name: 'English' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)' },
    { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
    { code: 'mr-IN', name: 'Marathi (मराठी)' },
    { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)' },
    { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'ur-IN', name: 'Urdu (اردو)' },
    { code: 'as-IN', name: 'Assamese (অসমীয়া)' },
    { code: 'bodo-IN', name: 'Bodo (बड़ो)' },
    { code: 'doi-IN', name: 'Dogri (डोगरी)' },
    { code: 'ks-IN', name: 'Kashmiri (کأشُر)' },
    { code: 'kok-IN', name: 'Konkani (कोंकणी)' },
    { code: 'mai-IN', name: 'Maithili (मैथिली)' },
    { code: 'mni-IN', name: 'Manipuri (মৈতৈলোন)' },
    { code: 'ne-IN', name: 'Nepali (नेपाली)' },
    { code: 'sa-IN', name: 'Sanskrit (संस्कृतम्)' },
    { code: 'sat-IN', name: 'Santali (संताली)' },
    { code: 'sd-IN', name: 'Sindhi (सिंधी)' },
];

// Helper: extract a readable string from any error shape returned by Sarvam AI
const extractErrorMessage = (errorData: any, httpStatus?: number): string => {
    if (!errorData) return `API Error (${httpStatus ?? 'unknown'})`;

    // errorData.error can be an object like { code: "...", message: "..." }
    if (errorData.error) {
        if (typeof errorData.error === 'string') return errorData.error;
        if (typeof errorData.error === 'object') {
            return (
                errorData.error.message ||
                errorData.error.msg ||
                errorData.error.detail ||
                errorData.error.code ||
                JSON.stringify(errorData.error)
            );
        }
    }

    // Top-level message / detail fields
    if (typeof errorData.message === 'string') return errorData.message;
    if (typeof errorData.detail === 'string') return errorData.detail;

    // Array of validation errors (FastAPI / Pydantic style)
    if (Array.isArray(errorData.detail)) {
        return errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
    }

    return `API Error (${httpStatus ?? 'unknown'}): ${JSON.stringify(errorData)}`;
};

const Vision: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [language, setLanguage] = useState('hi-IN');
    const [apiKey, setApiKey] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [result, setResult] = useState<{
        summarization?: string;
        ocr?: string;
        caption?: string;
    } | null>(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [showSettings, setShowSettings] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error('File size too large (max 10MB)');
                return;
            }
            setFile(selectedFile);
            setResult(null);
            setErrorMessage(null);

            if (selectedFile.type.startsWith('image/')) {
                const url = URL.createObjectURL(selectedFile);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
            toast.success('File uploaded successfully!');
        }
    };

    const runProcess = async (type: 'summary' | 'ocr' | 'caption') => {
        if (!file) {
            toast.error('Please upload a file first');
            return;
        }

        if (!apiKey || apiKey.trim() === '') {
            toast.error('Please enter your Sarvam AI API Key in settings');
            setShowSettings(true);
            return;
        }

        setIsProcessing(true);
        setResult(null);
        setErrorMessage(null);
        setProgress(10);
        setStatusText('Preparing upload request...');

        try {
            const fileName = file.name;

            setStatusText('Creating digitization job...');

            // Step 1: Create Digitization Job FIRST — the job_id is needed for all subsequent calls
            const jobResponse = await fetch('https://api.sarvam.ai/doc-digitization/job/v1', {
                method: 'POST',
                headers: {
                    'api-subscription-key': apiKey.trim(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_parameters: {
                        language_code: language,
                        output_format: 'md'
                    }
                })
            });

            if (!jobResponse.ok) {
                const errorData = await jobResponse.json().catch(() => ({}));
                console.error('Job Creation Error:', errorData);
                throw new Error(extractErrorMessage(errorData, jobResponse.status));
            }

            const jobData = await jobResponse.json();
            const job_id = jobData.job_id;

            if (!job_id) {
                throw new Error('No job_id returned from job creation. Response: ' + JSON.stringify(jobData));
            }

            setProgress(25);
            setStatusText('Requesting upload URL from Sarvam AI...');

            // Step 2: Get signed upload URLs — requires the job_id created above
            const uploadUrlsResponse = await fetch('https://api.sarvam.ai/doc-digitization/job/v1/upload-files', {
                method: 'POST',
                headers: {
                    'api-subscription-key': apiKey.trim(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_id: job_id,
                    files: [fileName]
                })
            });

            if (!uploadUrlsResponse.ok) {
                const errorData = await uploadUrlsResponse.json().catch(() => ({}));
                console.error('Upload URL Error:', errorData);
                throw new Error(extractErrorMessage(errorData, uploadUrlsResponse.status));
            }

            const uploadData = await uploadUrlsResponse.json();

            // upload_urls is a dict keyed by filename: { cv.pdf: { file_url: ..., ... } }
            const uploadUrlsDict = uploadData.upload_urls;
            if (!uploadUrlsDict || typeof uploadUrlsDict !== 'object') {
                throw new Error('No upload_urls in API response. Full response: ' + JSON.stringify(uploadData));
            }

            // The key is the filename — grab the first (and only) entry
            const fileEntry = uploadUrlsDict[fileName];
            if (!fileEntry) {
                throw new Error(
                    'No entry for file "' + fileName + '" in upload_urls. Keys: ' +
                    Object.keys(uploadUrlsDict).join(', ')
                );
            }

            // Signed URL is under file_url
            const signedUrl = fileEntry.file_url ?? fileEntry.url ?? fileEntry.upload_url;
            if (!signedUrl) {
                throw new Error('No signed URL found in file entry: ' + JSON.stringify(fileEntry));
            }

            setProgress(45);
            setStatusText('Uploading file to cloud storage...');

            // Step 3: Upload file via proxy to avoid CORS on Azure Blob Storage.
            // The Vite dev proxy (see vite.config.ts) rewrites /azure-upload/* -> Azure blob endpoint.
            // In production, route /azure-upload through your backend or a serverless function.
            const azureUrl = new URL(signedUrl);
            const proxyUrl = '/azure-upload' + azureUrl.pathname + azureUrl.search;

            const uploadToStore = await fetch(proxyUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': file.type || 'application/octet-stream'
                }
            });

            if (!uploadToStore.ok) {
                throw new Error(`File upload to storage failed (${uploadToStore.status}). Check the proxy config in vite.config.ts.`);
            }

            setProgress(55);
            setStatusText('Starting digitization job...');

            // Step 4: Start the job now that files are uploaded
            const startResponse = await fetch(`https://api.sarvam.ai/doc-digitization/job/v1/${job_id}/start`, {
                method: 'POST',
                headers: {
                    'api-subscription-key': apiKey.trim(),
                    'Content-Type': 'application/json'
                }
            });

            if (!startResponse.ok) {
                const errorData = await startResponse.json().catch(() => ({}));
                console.error('Job Start Error:', errorData);
                throw new Error(extractErrorMessage(errorData, startResponse.status));
            }

            setProgress(65);
            setStatusText('Processing document with OCR AI...');

            // Step 5: Poll for job completion.
            // The status endpoint uses a query param: GET /job/v1?job_id=...
            let jobState = 'Accepted';
            let retryCount = 0;
            const maxRetries = 40;
            let jobResult: any = null;
            const terminalStates = ['Completed', 'completed', 'Failed', 'failed', 'Error', 'error'];
            const processingStates = ['Accepted', 'Processing', 'pending', 'processing', 'InProgress', 'Queued'];

            while (!terminalStates.includes(jobState) && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 4000));

                // Candidate status URL paths — we try them in order and use the first 200
                const candidateUrls = [
                    `https://api.sarvam.ai/doc-digitization/job/v1/${job_id}/status`,
                    `https://api.sarvam.ai/doc-digitization/jobs/${job_id}`,
                    `https://api.sarvam.ai/doc-digitization/job/${job_id}`,
                    `https://api.sarvam.ai/document-intelligence/job/v1/${job_id}`,
                ];
                const statusUrl = candidateUrls[Math.min(retryCount, candidateUrls.length - 1)];

                const statusResponse = await fetch(statusUrl, {
                    headers: { 'api-subscription-key': apiKey.trim() }
                });

                console.log(`[Poll ${retryCount}] ${statusUrl} -> ${statusResponse.status}`);

                if (statusResponse.ok) {
                    jobResult = await statusResponse.json();
                    console.log('[Poll result]', JSON.stringify(jobResult, null, 2));
                    jobState = jobResult.job_state ?? jobResult.status ?? jobState;
                    setStatusText(`AI processing... (state: ${jobState})`);
                } else if (statusResponse.status !== 404 && statusResponse.status !== 405) {
                    const err = await statusResponse.json().catch(() => ({}));
                    throw new Error(extractErrorMessage(err, statusResponse.status));
                }

                retryCount++;
                setProgress(Math.min(66 + (retryCount * 0.6), 90));
            }

            const isCompleted = ['Completed', 'completed'].includes(jobState);
            if (!isCompleted) {
                throw new Error(
                    jobState.toLowerCase().includes('fail') || jobState.toLowerCase().includes('error')
                        ? `Job failed with state: ${jobState}`
                        : `Processing timed out after ${maxRetries} attempts (last state: ${jobState}). Try again or check your Sarvam dashboard.`
                );
            }

            // Results can be at jobResult.results[] or jobResult.output_files[] depending on version
            const resultFiles = jobResult.results ?? jobResult.output_files ?? [];
            if (resultFiles.length === 0) {
                throw new Error('Job completed but no result files found. Full response: ' + JSON.stringify(jobResult));
            }

            // Step 6: Handle ZIP output and extract content
            setStatusText('Downloading and extracting results...');
            const downloadUrl = resultFiles[0].content_url ?? resultFiles[0].url ?? resultFiles[0].download_url;

            const zipResponse = await fetch(downloadUrl);
            if (!zipResponse.ok) {
                throw new Error('Failed to download results');
            }

            const zipBlob = await zipResponse.blob();

            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(zipBlob);

            // Look for .md file in the zip
            let ocrText = '';
            const mdFile = Object.keys(loadedZip.files).find(name => name.endsWith('.md'));

            if (mdFile) {
                ocrText = await loadedZip.files[mdFile].async('text');
            } else {
                throw new Error('Markdown file not found in results. The document may not have been processed correctly.');
            }

            setProgress(90);
            setStatusText(`Generating ${type} with AI...`);

            // Step 7: Summarize or Caption using Chat API
            let finalResult = ocrText;

            if (type === 'summary' || type === 'caption') {
                const languageName = INDIC_LANGUAGES.find(l => l.code === language)?.name || 'Hindi';
                const prompt = type === 'summary'
                    ? `Summarize the following document content in ${languageName}. Focus on the key points and create a comprehensive yet concise summary.`
                    : `Generate a catchy, descriptive, and engaging caption for this document/image in ${languageName}. Make it compelling and informative.`;

                const chatResponse = await fetch('https://api.sarvam.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'api-subscription-key': apiKey.trim(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'sarvam-m-chat',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful assistant that processes document data and speaks multiple Indian languages fluently. Your responses should be well-formatted and clear.'
                            },
                            {
                                role: 'user',
                                content: `${prompt}\n\nDocument Content:\n${ocrText.slice(0, 8000)}`
                            }
                        ]
                    })
                });

                if (chatResponse.ok) {
                    const chatData = await chatResponse.json();
                    finalResult = chatData.choices[0].message.content;
                } else {
                    const chatError = await chatResponse.json().catch(() => ({}));
                    console.warn('Chat API failed:', chatError);
                    // Fall back to raw OCR text rather than crashing
                }
            }

            setResult({
                summarization: type === 'summary' ? finalResult : result?.summarization,
                ocr: ocrText,
                caption: type === 'caption' ? finalResult : result?.caption
            });

            setActiveTab(type);
            setProgress(100);
            setStatusText('Processing complete!');
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`);

        } catch (error: any) {
            console.error('Processing Error:', error);
            // Ensure we always show a string, never "[object Object]"
            const errorMsg =
                typeof error?.message === 'string'
                    ? error.message
                    : JSON.stringify(error) || 'An unexpected error occurred during processing';
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsProcessing(false);
            setTimeout(() => {
                setProgress(0);
                setStatusText('');
            }, 4000);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const downloadResult = (text: string, ext: string) => {
        const element = document.createElement('a');
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `sarvam-vision-result.${ext}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('File downloaded!');
    };

    return (
        <AnimatedElement>
            <div className="max-w-[1200px] mx-auto">
                <Card className="border-2 shadow-2xl overflow-hidden rounded-3xl">
                    <CardHeader className="bg-gradient-to-r from-muted/50 to-background dark:from-slate-900/80 dark:to-slate-950 border-b relative py-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 rounded-2xl shadow-inner border border-primary/20">
                                    <Sparkles className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Sarvam Vision AI
                                    </CardTitle>
                                    <CardDescription className="text-lg mt-2 font-medium flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-primary" />
                                        Advanced Multilingual Document Intelligence
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setShowSettings(!showSettings)}
                                className={showSettings ? "bg-primary/10 text-primary border-primary/50" : "rounded-xl border-2"}
                            >
                                <Settings className="h-5 w-5 mr-2" />
                                Settings
                            </Button>
                        </div>

                        {showSettings && (
                            <div className="absolute top-24 right-8 z-50 bg-background/95 backdrop-blur-xl border-2 p-6 rounded-3xl shadow-2xl w-96 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-4 border-b pb-3">
                                    <h4 className="font-bold flex items-center gap-2 text-primary">
                                        <Shield className="h-5 w-5" />
                                        API Authorization
                                    </h4>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowSettings(false)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-muted-foreground font-black tracking-widest">Sarvam AI API Key</Label>
                                        <div className="relative">
                                            <Input
                                                type="password"
                                                placeholder="Paste your API key here..."
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                className="h-12 border-2 rounded-xl pr-10 focus-visible:ring-primary"
                                            />
                                            <Shield className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed bg-muted/30 p-3 rounded-xl border">
                                            Your key is stored locally and never uploaded to our servers. Get your free API key at <a href="https://sarvam.ai" target="_blank" className="text-primary font-bold hover:underline">sarvam.ai</a>.
                                        </p>
                                    </div>
                                    <Button className="w-full h-12 rounded-xl text-sm font-bold shadow-lg" onClick={() => setShowSettings(false)}>
                                        Save & Continue
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="p-8">
                        {errorMessage && (
                            <Alert variant="destructive" className="mb-6 rounded-2xl border-2">
                                <AlertCircle className="h-5 w-5" />
                                <AlertDescription className="font-medium ml-2">
                                    {errorMessage}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Left Input Side */}
                            <div className="space-y-8 flex flex-col justify-between">
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xl font-black flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">1</div>
                                            Source Media
                                        </Label>
                                        {file && (
                                            <Badge variant="outline" className="text-xs py-1 px-3 border-2 rounded-full font-bold">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </Badge>
                                        )}
                                    </div>
                                    <div
                                        className="border-3 border-dashed border-muted-foreground/20 rounded-[2rem] p-4 bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[350px] shadow-inner relative group overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-h-[320px] rounded-2xl shadow-2xl object-contain group-hover:scale-[1.02] transition-transform duration-500"
                                            />
                                        ) : file ? (
                                            <div className="flex flex-col items-center text-center p-10">
                                                <div className="p-8 bg-blue-500/10 rounded-full mb-6">
                                                    <FileType className="h-20 w-20 text-blue-600" />
                                                </div>
                                                <p className="font-black text-2xl truncate max-w-xs">{file.name}</p>
                                                <p className="text-muted-foreground font-medium mt-1">Ready for analysis</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-8 bg-background rounded-[2rem] shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-2 border-primary/10">
                                                    <Upload className="h-12 w-12 text-primary" />
                                                </div>
                                                <h3 className="text-2xl font-black">Drop & Reveal</h3>
                                                <p className="text-muted-foreground font-medium mt-2 text-center max-w-xs px-4">
                                                    PDF documents, scanned reports, or any image file up to 10MB.
                                                </p>
                                            </>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*,.pdf"
                                        />
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <section className="space-y-4">
                                        <Label className="text-xl font-black flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">2</div>
                                            Language
                                        </Label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger className="h-14 text-lg border-2 rounded-2xl bg-card shadow-sm font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2">
                                                {INDIC_LANGUAGES.map((lang) => (
                                                    <SelectItem key={lang.code} value={lang.code} className="py-3 rounded-xl">
                                                        {lang.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </section>

                                    <section className="space-y-4">
                                        <Label className="text-xl font-black flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">3</div>
                                            Intelligence
                                        </Label>
                                        <div className="flex gap-3">
                                            <Button
                                                className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-tighter shadow-md hover:shadow-xl transition-all ${activeTab === 'summary' ? 'bg-primary' : 'bg-muted/50 text-muted-foreground border-2 hover:bg-muted'}`}
                                                onClick={() => runProcess('summary')}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing && activeTab === 'summary' ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <FileText className="h-4 w-4 mr-2" />
                                                )}
                                                Summarize
                                            </Button>
                                            <Button
                                                className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-tighter shadow-md hover:shadow-xl transition-all ${activeTab === 'ocr' ? 'bg-primary' : 'bg-muted/50 text-muted-foreground border-2 hover:bg-muted'}`}
                                                onClick={() => runProcess('ocr')}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing && activeTab === 'ocr' ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Eye className="h-4 w-4 mr-2" />
                                                )}
                                                OCR Scan
                                            </Button>
                                            <Button
                                                className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-tighter shadow-md hover:shadow-xl transition-all ${activeTab === 'caption' ? 'bg-primary' : 'bg-muted/50 text-muted-foreground border-2 hover:bg-muted'}`}
                                                onClick={() => runProcess('caption')}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing && activeTab === 'caption' ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                )}
                                                Caption
                                            </Button>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Right Output Side */}
                            <div className="space-y-6 flex flex-col h-full">
                                <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">AI Results</h3>
                                        {isProcessing && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full animate-pulse border border-primary/20">
                                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Generating</span>
                                            </div>
                                        )}
                                    </div>
                                    {result && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-xl border-2 font-bold px-4"
                                                onClick={() => copyToClipboard(result[activeTab as keyof typeof result] || '')}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-xl border-2 font-bold px-4"
                                                onClick={() => downloadResult(result[activeTab as keyof typeof result] || '', 'md')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Save
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow flex flex-col min-h-[550px]">
                                    {isProcessing ? (
                                        <Card className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/5 border-2 border-dashed rounded-[2.5rem] shadow-inner">
                                            <div className="relative mb-10 scale-125">
                                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                                                <Loader2 className="h-24 w-24 text-primary animate-spin relative z-10" />
                                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                                    <Brain className="h-8 w-8 text-primary animate-bounce" />
                                                </div>
                                            </div>
                                            <h4 className="text-3xl font-black mb-3">AI Processing</h4>
                                            <p className="text-muted-foreground font-medium mb-10 max-w-xs text-lg">{statusText}</p>
                                            <div className="w-full max-w-sm space-y-4">
                                                <Progress value={progress} className="h-4 rounded-full shadow-inner border border-muted" />
                                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-primary px-1">
                                                    <span>In Progress</span>
                                                    <span>{progress}%</span>
                                                </div>
                                            </div>
                                        </Card>
                                    ) : result ? (
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                                            <TabsList className="grid grid-cols-3 p-1.5 mb-6 h-16 rounded-2xl bg-muted/30 border-2">
                                                <TabsTrigger value="summary" disabled={!result.summarization} className="rounded-xl font-bold py-3 transition-all data-[state=active]:shadow-lg">
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    Summary
                                                </TabsTrigger>
                                                <TabsTrigger value="ocr" disabled={!result.ocr} className="rounded-xl font-bold py-3 transition-all data-[state=active]:shadow-lg">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Full OCR
                                                </TabsTrigger>
                                                <TabsTrigger value="caption" disabled={!result.caption} className="rounded-xl font-bold py-3 transition-all data-[state=active]:shadow-lg">
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Caption
                                                </TabsTrigger>
                                            </TabsList>
                                            <div className="flex-grow bg-muted/5 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border-3 p-10 shadow-2xl relative min-h-[450px] overflow-hidden group">
                                                <TabsContent value="summary" className="mt-0 h-full overflow-auto prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black">
                                                    <div className="whitespace-pre-wrap font-medium animate-in fade-in slide-in-from-bottom-2 duration-700">
                                                        {result.summarization}
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="ocr" className="mt-0 h-full overflow-auto">
                                                    <div className="bg-slate-950 text-emerald-400 p-6 rounded-2xl font-mono text-sm shadow-2xl border-l-4 border-emerald-500 overflow-x-auto h-full scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                                        <div className="flex gap-2 mb-4 opacity-50 border-b border-emerald-900 pb-2">
                                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        </div>
                                                        <pre className="whitespace-pre-wrap">
                                                            {result.ocr}
                                                        </pre>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="caption" className="mt-0 h-full flex flex-col items-center justify-center py-20 px-8 text-center bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-[2rem]">
                                                    <div className="relative">
                                                        <div className="absolute -top-12 -left-12 opacity-10">
                                                            <Sparkles className="h-24 w-24 text-primary" />
                                                        </div>
                                                        <blockquote className="text-3xl font-black italic text-foreground tracking-tight leading-snug">
                                                            "{result.caption}"
                                                        </blockquote>
                                                        <div className="mt-8 flex justify-center gap-2">
                                                            <Badge variant="secondary" className="px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">AI Generated</Badge>
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                {!result[activeTab as keyof typeof result] && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md z-30 p-10 text-center">
                                                        <div className="p-6 rounded-full bg-muted/50 mb-4">
                                                            <Brain className="h-10 w-10 text-muted-foreground opacity-50" />
                                                        </div>
                                                        <h4 className="font-black text-xl mb-2">Analysis Needed</h4>
                                                        <p className="text-muted-foreground max-w-xs text-sm">Click the action button to generate insights for this section.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Tabs>
                                    ) : (
                                        <Card className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/5 border-3 border-dashed rounded-[2.5rem] shadow-inner group hover:bg-muted/10 transition-colors">
                                            <div className="p-10 bg-background rounded-[2rem] shadow-2xl opacity-40 mb-8 border-2 border-primary/5 group-hover:scale-110 transition-transform duration-500">
                                                <Search className="h-20 w-20 text-muted-foreground" />
                                            </div>
                                            <h4 className="text-3xl font-black mb-3">Idle Analysis Engine</h4>
                                            <p className="text-muted-foreground max-w-xs text-lg leading-relaxed">
                                                Upload your document and choose an operation to wake up the Vision AI.
                                            </p>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Info Section */}
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-[2.5rem] p-10 border-2 border-primary/10 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                                    <Sparkles className="h-64 w-64" />
                                </div>
                                <h4 className="font-black text-2xl flex items-center gap-4 mb-6 text-primary">
                                    <Shield className="h-8 w-8" />
                                    Security & Privacy
                                </h4>
                                <ul className="space-y-4 text-muted-foreground font-medium">
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <p>Your API key is only stored locally in the browser's volatile memory.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <p>Documents are transmitted directly to Sarvam AI over encrypted HTTPS channels.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <p>Images and PDFs are removed from temporary storage immediately after processing.</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-muted/30 rounded-[2.5rem] p-10 border-2 relative overflow-hidden group">
                                <h4 className="font-black text-2xl flex items-center gap-4 mb-8">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                    Intelligence Features
                                </h4>
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="flex gap-6">
                                        <div className="p-4 bg-background rounded-2xl shadow-lg h-14 w-14 flex items-center justify-center text-primary border border-primary/10">
                                            <Languages className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg">Native Indic Support</p>
                                            <p className="text-sm text-muted-foreground font-medium">Understands 22 official Indian languages with script-specific accuracy.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="p-4 bg-background rounded-2xl shadow-lg h-14 w-14 flex items-center justify-center text-primary border border-primary/10">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg">Layout Preservation</p>
                                            <p className="text-sm text-muted-foreground font-medium">Maps tables, columns, and hierarchies from complex document structures.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default Vision;