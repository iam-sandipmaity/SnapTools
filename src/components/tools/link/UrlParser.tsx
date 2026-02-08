import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Link2, Copy, Info, Code, RefreshCw } from "lucide-react";

interface ParsedURL {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
    href: string;
    queryParams: Record<string, string>;
}

const UrlParser = () => {
    const [inputUrl, setInputUrl] = useState("");
    const [parsedUrl, setParsedUrl] = useState<ParsedURL | null>(null);

    // Builder states
    const [protocol, setProtocol] = useState("https");
    const [hostname, setHostname] = useState("");
    const [port, setPort] = useState("");
    const [pathname, setPathname] = useState("");
    const [queryString, setQueryString] = useState("");
    const [hash, setHash] = useState("");
    const [builtUrl, setBuiltUrl] = useState("");

    const parseUrl = () => {
        if (!inputUrl) {
            toast.error("Please enter a URL");
            return;
        }

        try {
            const url = new URL(inputUrl);
            const params: Record<string, string> = {};

            url.searchParams.forEach((value, key) => {
                params[key] = value;
            });

            const parsed: ParsedURL = {
                protocol: url.protocol.replace(':', ''),
                hostname: url.hostname,
                port: url.port,
                pathname: url.pathname,
                search: url.search,
                hash: url.hash,
                origin: url.origin,
                href: url.href,
                queryParams: params
            };

            setParsedUrl(parsed);
            toast.success("URL parsed successfully!");
        } catch (error) {
            toast.error("Invalid URL format. Please include http:// or https://");
        }
    };

    const buildUrl = () => {
        if (!hostname) {
            toast.error("Please enter a hostname");
            return;
        }

        try {
            let url = `${protocol}://${hostname}`;

            if (port) {
                url += `:${port}`;
            }

            if (pathname) {
                url += pathname.startsWith('/') ? pathname : `/${pathname}`;
            }

            if (queryString) {
                url += queryString.startsWith('?') ? queryString : `?${queryString}`;
            }

            if (hash) {
                url += hash.startsWith('#') ? hash : `#${hash}`;
            }

            // Validate the built URL
            new URL(url);
            setBuiltUrl(url);
            toast.success("URL built successfully!");
        } catch (error) {
            toast.error("Failed to build URL. Please check your inputs.");
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

    const resetParser = () => {
        setInputUrl("");
        setParsedUrl(null);
    };

    const resetBuilder = () => {
        setProtocol("https");
        setHostname("");
        setPort("");
        setPathname("");
        setQueryString("");
        setHash("");
        setBuiltUrl("");
    };

    return (
        <AnimatedElement>
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* URL Parser Section */}
                <Card>
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Link2 className="h-6 w-6 text-primary" />
                            URL Parser
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Parse URLs online free. Extract URL components, query parameters, and fragments.
                        </p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <Label htmlFor="parse-url-input" className="text-base font-medium">Enter URL to Parse</Label>
                                <Input
                                    id="parse-url-input"
                                    placeholder="https://example.com/path?key=value#section"
                                    value={inputUrl}
                                    onChange={(e) => setInputUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && parseUrl()}
                                    className="h-12 text-lg font-mono"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={parseUrl}
                                    disabled={!inputUrl}
                                    className="h-12 px-8 flex-1 sm:flex-none font-semibold text-base min-w-[120px]"
                                >
                                    Parse <Code className="ml-2 h-5 w-5" />
                                </Button>
                                {parsedUrl && (
                                    <Button
                                        onClick={resetParser}
                                        variant="outline"
                                        className="h-12 px-4"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {parsedUrl && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center gap-2 mb-4">
                                    <span className="bg-green-100 dark:bg-green-800 p-1.5 rounded-full text-sm">🔍</span> Parsed Components
                                </h3>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-foreground">Protocol</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => copyToClipboard(parsedUrl.protocol, "Protocol")}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-white dark:bg-background p-2 rounded border font-mono">{parsedUrl.protocol}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-foreground">Hostname</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => copyToClipboard(parsedUrl.hostname, "Hostname")}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-white dark:bg-background p-2 rounded border font-mono">{parsedUrl.hostname}</p>
                                        </div>

                                        {parsedUrl.port && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-semibold text-foreground">Port</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2"
                                                        onClick={() => copyToClipboard(parsedUrl.port, "Port")}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground bg-white dark:bg-background p-2 rounded border font-mono">{parsedUrl.port}</p>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-foreground">Pathname</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => copyToClipboard(parsedUrl.pathname, "Pathname")}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-white dark:bg-background p-2 rounded border font-mono">{parsedUrl.pathname || '/'}</p>
                                        </div>
                                    </div>

                                    {parsedUrl.search && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-foreground">Query String</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => copyToClipboard(parsedUrl.search, "Query String")}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-white dark:bg-background p-2 rounded border font-mono break-all">{parsedUrl.search}</p>
                                        </div>
                                    )}

                                    {Object.keys(parsedUrl.queryParams).length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-foreground">Query Parameters</Label>
                                            <div className="bg-white dark:bg-background p-3 rounded border space-y-2">
                                                {Object.entries(parsedUrl.queryParams).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between text-sm font-mono bg-muted/50 p-2 rounded">
                                                        <span className="text-foreground font-semibold">{key}:</span>
                                                        <span className="text-muted-foreground ml-2 break-all">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {parsedUrl.hash && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-foreground">Hash Fragment</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => copyToClipboard(parsedUrl.hash, "Hash")}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-white dark:bg-background p-2 rounded border font-mono">{parsedUrl.hash}</p>
                                        </div>
                                    )}

                                    <div className="space-y-1 pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold text-foreground">Full URL</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2"
                                                onClick={() => copyToClipboard(parsedUrl.href, "Full URL")}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground bg-white dark:bg-background p-2 rounded border font-mono break-all">{parsedUrl.href}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* URL Builder Section */}
                <Card>
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Link2 className="h-6 w-6 text-primary" />
                            URL Builder
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Build URLs from components. Construct URLs with custom parameters and fragments.
                        </p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="protocol" className="text-base font-medium">Protocol</Label>
                                <select
                                    id="protocol"
                                    value={protocol}
                                    onChange={(e) => setProtocol(e.target.value)}
                                    className="w-full h-12 px-3 rounded-md border border-input bg-background text-lg"
                                >
                                    <option value="https">https</option>
                                    <option value="http">http</option>
                                    <option value="ftp">ftp</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hostname" className="text-base font-medium">Hostname *</Label>
                                <Input
                                    id="hostname"
                                    placeholder="example.com"
                                    value={hostname}
                                    onChange={(e) => setHostname(e.target.value)}
                                    className="h-12 text-lg font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="port" className="text-base font-medium">Port (Optional)</Label>
                                <Input
                                    id="port"
                                    placeholder="8080"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                    className="h-12 text-lg font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pathname" className="text-base font-medium">Pathname (Optional)</Label>
                                <Input
                                    id="pathname"
                                    placeholder="/path/to/page"
                                    value={pathname}
                                    onChange={(e) => setPathname(e.target.value)}
                                    className="h-12 text-lg font-mono"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="query" className="text-base font-medium">Query String (Optional)</Label>
                                <Input
                                    id="query"
                                    placeholder="key1=value1&key2=value2"
                                    value={queryString}
                                    onChange={(e) => setQueryString(e.target.value)}
                                    className="h-12 text-lg font-mono"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="hash" className="text-base font-medium">Hash Fragment (Optional)</Label>
                                <Input
                                    id="hash"
                                    placeholder="section"
                                    value={hash}
                                    onChange={(e) => setHash(e.target.value)}
                                    className="h-12 text-lg font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={buildUrl}
                                disabled={!hostname}
                                className="h-12 px-8 font-semibold text-base flex-1"
                            >
                                Build URL <Link2 className="ml-2 h-5 w-5" />
                            </Button>
                            {builtUrl && (
                                <Button
                                    onClick={resetBuilder}
                                    variant="outline"
                                    className="h-12 px-4"
                                >
                                    <RefreshCw className="h-5 w-5" />
                                </Button>
                            )}
                        </div>

                        {builtUrl && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-4">
                                    <span className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full text-sm">✨</span> Built URL
                                </h3>

                                <div className="relative flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={builtUrl}
                                        className="h-12 text-lg font-mono bg-white dark:bg-background border-blue-300 dark:border-blue-700 focus-visible:ring-blue-500 pr-24"
                                    />
                                    <Button
                                        size="sm"
                                        className="absolute right-1 h-10 px-4"
                                        onClick={() => copyToClipboard(builtUrl, "URL")}
                                    >
                                        <Copy className="h-4 w-4 mr-2" /> Copy
                                    </Button>
                                </div>

                                <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>URL components are automatically validated and formatted according to web standards.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default UrlParser;
