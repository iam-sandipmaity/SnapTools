import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { QrCode, Download, Copy, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const UrlToQrCode = () => {
    const [qrUrl, setQrUrl] = useState("");
    const [qrSize, setQrSize] = useState(256);
    const [qrGenerated, setQrGenerated] = useState(false);

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

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("URL copied to clipboard!");
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
                            <QrCode className="h-6 w-6 text-primary" />
                            URL to QR Code
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Convert URL to QR code online free. Generate scannable QR codes from links.
                        </p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="qr-url-input" className="text-base font-medium">Enter URL</Label>
                                    <Input
                                        id="qr-url-input"
                                        placeholder="https://example.com"
                                        value={qrUrl}
                                        onChange={(e) => setQrUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && generateQRCode()}
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
                                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                                            <span>128px</span>
                                            <span>256px</span>
                                            <span>384px</span>
                                            <span>512px</span>
                                        </div>
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
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
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
                                                    <p className="text-muted-foreground break-all bg-white dark:bg-background p-3 rounded border">{qrUrl}</p>
                                                </div>

                                                <div className="text-sm space-y-1">
                                                    <p className="font-medium text-foreground">Size:</p>
                                                    <p className="text-muted-foreground">{qrSize}x{qrSize} pixels</p>
                                                </div>

                                                <div className="text-sm space-y-1">
                                                    <p className="font-medium text-foreground">Error Correction:</p>
                                                    <p className="text-muted-foreground">High (Level H - 30% recovery)</p>
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
                                                    onClick={() => copyToClipboard(qrUrl)}
                                                    variant="outline"
                                                    className="flex-1 h-11 font-semibold"
                                                >
                                                    <Copy className="h-4 w-4 mr-2" /> Copy URL
                                                </Button>
                                            </div>

                                            <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold mb-1">How to use:</p>
                                                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                                                        <li>Scan with any smartphone camera to open the URL</li>
                                                        <li>High error correction ensures reliable scanning even if damaged</li>
                                                        <li>Download as PNG for printing or sharing</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default UrlToQrCode;
