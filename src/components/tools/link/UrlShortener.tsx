import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Link as LinkIcon, Copy, Trash2, ArrowRight, Loader2, Info, QrCode, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const UrlShortener = () => {
    const [longUrl, setLongUrl] = useState("");
    const [alias, setAlias] = useState("");

    const [shortUrl, setShortUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<{ original: string, short: string, date: string }[]>([]);

    // QR Code Generator states
    const [qrUrl, setQrUrl] = useState("");
    const [qrSize, setQrSize] = useState(256);
    const [qrGenerated, setQrGenerated] = useState(false);

    useEffect(() => {
        const savedHistory = localStorage.getItem("url-shortener-history");
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const saveToHistory = (original: string, short: string) => {
        const newItem = { original, short, date: new Date().toISOString() };
        const updatedHistory = [newItem, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem("url-shortener-history", JSON.stringify(updatedHistory));
    };

    const handleShorten = async () => {
        if (!longUrl) {
            toast.error("Please enter a URL");
            return;
        }

        try {
            new URL(longUrl); // Validate URL format
        } catch (_) {
            toast.error("Invalid URL format. Please include http:// or https://");
            return;
        }

        setIsLoading(true);
        setShortUrl("");

        try {
            const formData = new URLSearchParams();
            formData.append('url', longUrl);
            if (alias) {
                formData.append('alias', alias);
            }

            const response = await fetch("https://spoo.me/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
                body: formData
            });

            // Spoo.me might return 400 for alias taken, so we need to parse JSON even if !response.ok
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                // Handle rate limit specifically
                if (response.status === 429) {
                    throw new Error("Rate limit exceeded. Spoo.me allows 5 requests/min, 50/hour, 500/day. Please try again later.");
                }
                if (data && data.error) {
                    throw new Error(data.error); // Use API error message if available
                }
                throw new Error("Failed to shorten URL");
            }

            if (data && data.short_url) {
                const newShortUrl = data.short_url;
                setShortUrl(newShortUrl);
                saveToHistory(longUrl, newShortUrl);
                toast.success("URL successfully shortened!");
            } else {
                throw new Error("Invalid response from service");
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to shorten URL. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy:", error);
            toast.error("Failed to copy to clipboard");
        }
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("url-shortener-history");
        toast.success("History cleared");
    };

    const generateQRCode = () => {
        if (!qrUrl) {
            toast.error("Please enter a URL");
            return;
        }

        try {
            new URL(qrUrl); // Validate URL format
            setQrGenerated(true);
            toast.success("QR Code generated successfully!");
        } catch (_) {
            toast.error("Invalid URL format. Please include http:// or https://");
        }
    };

    const downloadQRCode = () => {
        const svg = document.getElementById("qr-code-svg") as unknown as SVGSVGElement;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        canvas.width = qrSize;
        canvas.height = qrSize;

        img.onload = () => {
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `qr-code-${Date.now()}.png`;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast.success("QR Code downloaded!");
                }
            });
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const copyQRUrl = async () => {
        await copyToClipboard(qrUrl);
    };

    return (
        <AnimatedElement>
            <div className="space-y-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <LinkIcon className="h-6 w-6 text-primary" />
                            Link Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs defaultValue="shortener" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                                <TabsTrigger
                                    value="shortener"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4 font-semibold"
                                >
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    URL Shortener
                                </TabsTrigger>
                                <TabsTrigger
                                    value="qrcode"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4 font-semibold"
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    URL to QR Code
                                </TabsTrigger>
                            </TabsList>

                            {/* URL Shortener Tab */}
                            <TabsContent value="shortener" className="p-8 space-y-8 mt-0">
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label htmlFor="url-input" className="text-base font-medium">Enter Long URL</Label>
                                        <Input
                                            id="url-input"
                                            placeholder="https://example.com/very-long-url..."
                                            value={longUrl}
                                            onChange={(e) => setLongUrl(e.target.value)}
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div className="w-full md:w-48 space-y-2">
                                        <Label htmlFor="alias-input" className="text-base font-medium">Custom Alias (Opt)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">spoo.me/</span>
                                            <Input
                                                id="alias-input"
                                                placeholder="link"
                                                value={alias}
                                                onChange={(e) => setAlias(e.target.value)}
                                                className="h-12 pl-20"
                                                maxLength={15}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleShorten}
                                        disabled={isLoading || !longUrl}
                                        className="h-12 px-8 w-full md:w-auto font-semibold text-base min-w-[140px]"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Shortening...
                                            </>
                                        ) : (
                                            <>
                                                Shorten <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                    <p>API Limits: 5 requests/min, 50/hour, 500/day. Powered by Spoo.me free tier.</p>
                                </div>

                                {shortUrl && (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                            <div className="flex-1 w-full space-y-4">
                                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                                                    <span className="bg-green-100 dark:bg-green-800 p-1.5 rounded-full text-sm">🎉</span> Success! Here is your short link:
                                                </h3>
                                                <div className="relative flex items-center gap-2">
                                                    <Input
                                                        readOnly
                                                        value={shortUrl}
                                                        className="h-12 text-lg font-mono bg-white dark:bg-background border-green-300 dark:border-green-700 focus-visible:ring-green-500 pr-24"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="absolute right-1 h-10 px-4"
                                                        onClick={() => copyToClipboard(shortUrl)}
                                                    >
                                                        <Copy className="h-4 w-4 mr-2" /> Copy
                                                    </Button>
                                                </div>
                                                <div className="text-sm text-muted-foreground break-all">
                                                    Original: <a href={longUrl} target="_blank" rel="noreferrer" className="underline hover:text-foreground">{longUrl}</a>
                                                </div>
                                                <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <div className="space-y-1">
                                                        <p className="font-semibold">Important Information:</p>
                                                        <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                                                            <li>Links created via the free API are <strong>permanent by default</strong> (no automatic expiration)</li>
                                                            <li>Optional expiration can be set when using an API key (by date or click count)</li>
                                                            <li>Links <strong>cannot be deleted</strong> via the free API - contact support@spoo.me for deletion requests</li>
                                                            <li>Links may be removed if they violate Spoo.me's policies or if the service is discontinued</li>
                                                        </ul>
                                                        <p className="text-xs mt-2">For critical long-term usage or deletion capability, consider using an authenticated API key or self-hosted URL shortener.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-background rounded-lg shadow-sm border">
                                                <QRCodeSVG value={shortUrl} size={120} />
                                                <span className="text-xs text-muted-foreground mt-2 font-medium">Scan QR Code</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* URL to QR Code Tab */}
                            <TabsContent value="qrcode" className="p-8 space-y-8 mt-0">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="qr-url-input" className="text-base font-medium">Enter URL</Label>
                                            <Input
                                                id="qr-url-input"
                                                placeholder="https://example.com"
                                                value={qrUrl}
                                                onChange={(e) => setQrUrl(e.target.value)}
                                                className="h-12 text-lg"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor="qr-size" className="text-base font-medium">
                                                    QR Code Size: {qrSize}px
                                                </Label>
                                                <Input
                                                    id="qr-size"
                                                    type="range"
                                                    min="128"
                                                    max="512"
                                                    step="64"
                                                    value={qrSize}
                                                    onChange={(e) => setQrSize(Number(e.target.value))}
                                                    className="h-12"
                                                />
                                            </div>
                                            <Button
                                                onClick={generateQRCode}
                                                disabled={!qrUrl}
                                                className="h-12 px-8 w-full sm:w-auto font-semibold text-base min-w-[140px]"
                                            >
                                                Generate <QrCode className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {qrGenerated && qrUrl && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="flex flex-col lg:flex-row gap-8 items-center">
                                                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-background rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-800">
                                                    <QRCodeSVG
                                                        id="qr-code-svg"
                                                        value={qrUrl}
                                                        size={qrSize}
                                                        level="H"
                                                        includeMargin={true}
                                                    />
                                                </div>

                                                <div className="flex-1 w-full space-y-4">
                                                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                                        <span className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full text-sm">✨</span> QR Code Generated!
                                                    </h3>

                                                    <div className="space-y-3">
                                                        <div className="text-sm space-y-1">
                                                            <p className="font-medium text-foreground">URL:</p>
                                                            <p className="text-muted-foreground break-all bg-muted/50 p-2 rounded border">{qrUrl}</p>
                                                        </div>

                                                        <div className="text-sm space-y-1">
                                                            <p className="font-medium text-foreground">Size:</p>
                                                            <p className="text-muted-foreground">{qrSize}x{qrSize} pixels</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                        <Button
                                                            onClick={downloadQRCode}
                                                            className="flex-1 h-11 font-semibold"
                                                        >
                                                            <Download className="h-4 w-4 mr-2" /> Download PNG
                                                        </Button>
                                                        <Button
                                                            onClick={copyQRUrl}
                                                            variant="outline"
                                                            className="flex-1 h-11 font-semibold"
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" /> Copy URL
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                        <p>Scan this QR code with any smartphone camera to instantly open the URL. High error correction level ensures reliable scanning.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {history.length > 0 && (
                    <Card>
                        <CardHeader className="p-6 flex flex-row items-center justify-between border-b bg-muted/20">
                            <CardTitle className="text-lg">Recent Shortened Links</CardTitle>
                            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8">
                                <Trash2 className="h-4 w-4 mr-2" /> Clear History
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {history.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-4">
                                        <div className="overflow-hidden min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <a href={item.short} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline truncate text-base block">
                                                    {item.short}
                                                </a>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-muted rounded-full whitespace-nowrap">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate max-w-[500px]" title={item.original}>
                                                {item.original}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                                            <Button variant="outline" size="sm" className="h-8 flex-1 sm:flex-none" onClick={() => copyToClipboard(item.short)}>
                                                <Copy className="h-3.5 w-3.5 mr-2" /> Copy
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimatedElement>
    );
};

export default UrlShortener;
