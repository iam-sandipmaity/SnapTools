import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Eye, Loader2, Copy, ExternalLink, Image as ImageIcon, FileText, Info } from "lucide-react";

interface PreviewData {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
    favicon?: string;
}

const LinkPreview = () => {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [error, setError] = useState("");

    const fetchPreview = async () => {
        if (!url) {
            toast.error("Please enter a URL");
            return;
        }

        try {
            new URL(url); // Validate URL format
        } catch (_) {
            toast.error("Invalid URL format. Please include http:// or https://");
            return;
        }

        setIsLoading(true);
        setError("");
        setPreviewData(null);

        try {
            // Using a CORS proxy to fetch Open Graph data
            // In production, you'd want to use your own backend API
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error("Failed to fetch preview");
            }

            const html = data.contents;
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Extract Open Graph metadata
            const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
            const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
            const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
            const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');

            // Fallback to standard meta tags
            const title = ogTitle || doc.querySelector('title')?.textContent || '';
            const description = ogDescription || doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') || '';

            const preview: PreviewData = {
                title: title.trim(),
                description: description.trim(),
                image: ogImage || '',
                url: url,
                siteName: ogSiteName || new URL(url).hostname,
                favicon: favicon ? (favicon.startsWith('http') ? favicon : new URL(favicon, url).href) : ''
            };

            setPreviewData(preview);
            toast.success("Preview generated successfully!");

        } catch (error: any) {
            console.error(error);
            setError("Failed to generate preview. The website may not allow preview generation or may be unreachable.");
            toast.error("Failed to generate preview");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard!`);
        } catch (error) {
            console.error("Failed to copy:", error);
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <AnimatedElement>
            <div className="space-y-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Eye className="h-6 w-6 text-primary" />
                            Link Preview Generator
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Preview links online free. Generate link previews with Open Graph metadata.
                        </p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <Label htmlFor="preview-url-input" className="text-base font-medium">Enter URL</Label>
                                <Input
                                    id="preview-url-input"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchPreview()}
                                    className="h-12 text-lg"
                                />
                            </div>
                            <Button
                                onClick={fetchPreview}
                                disabled={isLoading || !url}
                                className="h-12 px-8 w-full sm:w-auto font-semibold text-base min-w-[140px]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
                                    </>
                                ) : (
                                    <>
                                        Generate <Eye className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <p>Using public CORS proxy (AllOrigins.win). Some websites may block preview generation. Response time may vary. For production use, implement a backend API.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {previewData && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                {/* Preview Card */}
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-4">
                                        <span className="bg-purple-100 dark:bg-purple-800 p-1.5 rounded-full text-sm">👁️</span> Link Preview
                                    </h3>

                                    <div className="bg-white dark:bg-background rounded-lg border-2 border-purple-200 dark:border-purple-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                        {previewData.image && (
                                            <div className="w-full h-48 bg-muted relative overflow-hidden">
                                                <img
                                                    src={previewData.image}
                                                    alt={previewData.title || 'Preview'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="p-4 space-y-2">
                                            {previewData.siteName && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {previewData.favicon && (
                                                        <img src={previewData.favicon} alt="" className="w-4 h-4" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                                    )}
                                                    <span className="font-medium">{previewData.siteName}</span>
                                                </div>
                                            )}
                                            {previewData.title && (
                                                <h4 className="font-bold text-lg text-foreground line-clamp-2">{previewData.title}</h4>
                                            )}
                                            {previewData.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{previewData.description}</p>
                                            )}
                                            {previewData.url && (
                                                <a
                                                    href={previewData.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline flex items-center gap-1 pt-1"
                                                >
                                                    {new URL(previewData.url).hostname}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata Details */}
                                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2 mb-4">
                                        <FileText className="h-5 w-5" /> Open Graph Metadata
                                    </h3>

                                    <div className="space-y-3">
                                        {previewData.title && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-semibold text-foreground">Title</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2"
                                                        onClick={() => copyToClipboard(previewData.title!, "Title")}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">{previewData.title}</p>
                                            </div>
                                        )}

                                        {previewData.description && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-semibold text-foreground">Description</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2"
                                                        onClick={() => copyToClipboard(previewData.description!, "Description")}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">{previewData.description}</p>
                                            </div>
                                        )}

                                        {previewData.image && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-semibold text-foreground">Image URL</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2"
                                                        onClick={() => copyToClipboard(previewData.image!, "Image URL")}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border break-all">{previewData.image}</p>
                                            </div>
                                        )}

                                        {previewData.siteName && (
                                            <div className="space-y-1">
                                                <Label className="text-sm font-semibold text-foreground">Site Name</Label>
                                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">{previewData.siteName}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <p>Open Graph metadata is used by social media platforms to display rich previews when sharing links.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default LinkPreview;
