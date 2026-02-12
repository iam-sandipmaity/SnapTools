'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const MemeGenerator: React.FC = () => {
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(48);
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Popular meme templates
    const templates = [
        { name: 'Drake Hotline Bling', url: 'https://i.imgflip.com/30b1gx.jpg' },
        { name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
        { name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
        { name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
        { name: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
    ];

    useEffect(() => {
        if (image) {
            drawMeme();
        }
    }, [topText, bottomText, image, fontSize, textColor, strokeColor]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const loadTemplate = (url: string) => {
        setImage(url);
        toast.success('Template loaded!');
    };

    const drawMeme = () => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Set text properties
            ctx.fillStyle = textColor;
            ctx.strokeStyle = strokeColor;
            ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.lineWidth = fontSize / 20;

            // Draw top text
            if (topText) {
                const lines = wrapText(ctx, topText.toUpperCase(), canvas.width - 40);
                lines.forEach((line, index) => {
                    const y = 20 + (index * fontSize * 1.1);
                    ctx.strokeText(line, canvas.width / 2, y);
                    ctx.fillText(line, canvas.width / 2, y);
                });
            }

            // Draw bottom text
            if (bottomText) {
                const lines = wrapText(ctx, bottomText.toUpperCase(), canvas.width - 40);
                ctx.textBaseline = 'bottom';
                lines.reverse().forEach((line, index) => {
                    const y = canvas.height - 20 - (index * fontSize * 1.1);
                    ctx.strokeText(line, canvas.width / 2, y);
                    ctx.fillText(line, canvas.width / 2, y);
                });
            }
        };
        img.src = image;
    };

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    const downloadMeme = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'meme.png';
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Meme downloaded!');
            }
        });
    };

    const resetMeme = () => {
        setTopText('');
        setBottomText('');
        setImage(null);
        setFontSize(48);
        setTextColor('#FFFFFF');
        setStrokeColor('#000000');
    };

    return (
        <AnimatedElement>
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader className="bg-muted/50 dark:bg-slate-900/80 border-b">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Meme Generator Pro
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            Create funny memes with custom text and images
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Controls */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Upload Image</h3>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Your Image
                                    </Button>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Or Choose a Template</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {templates.map((template) => (
                                            <Button
                                                key={template.name}
                                                onClick={() => loadTemplate(template.url)}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-auto py-2"
                                            >
                                                {template.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="topText">Top Text</Label>
                                    <Input
                                        id="topText"
                                        placeholder="Enter top text"
                                        value={topText}
                                        onChange={(e) => setTopText(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bottomText">Bottom Text</Label>
                                    <Input
                                        id="bottomText"
                                        placeholder="Enter bottom text"
                                        value={bottomText}
                                        onChange={(e) => setBottomText(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
                                    <Slider
                                        id="fontSize"
                                        min={20}
                                        max={100}
                                        step={2}
                                        value={[fontSize]}
                                        onValueChange={(value) => setFontSize(value[0])}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="textColor">Text Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="textColor"
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="h-10 w-20"
                                            />
                                            <Input
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                placeholder="#FFFFFF"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="strokeColor">Outline Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="strokeColor"
                                                type="color"
                                                value={strokeColor}
                                                onChange={(e) => setStrokeColor(e.target.value)}
                                                className="h-10 w-20"
                                            />
                                            <Input
                                                value={strokeColor}
                                                onChange={(e) => setStrokeColor(e.target.value)}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={downloadMeme}
                                        disabled={!image}
                                        className="flex-1"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Meme
                                    </Button>
                                    <Button
                                        onClick={resetMeme}
                                        variant="outline"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-primary">Preview</h3>

                                <div className="border border-dashed border-muted rounded-xl p-4 bg-muted/50 dark:bg-slate-950 min-h-[500px] flex items-center justify-center shadow-inner">
                                    {image ? (
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full h-auto rounded shadow-lg"
                                        />
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                            <p>Upload an image or select a template to get started</p>
                                        </div>
                                    )}
                                </div>

                                <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
                                    <p className="font-semibold">Tips:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Text is automatically converted to uppercase</li>
                                        <li>Long text will wrap to multiple lines</li>
                                        <li>Adjust font size for better readability</li>
                                        <li>Use high contrast colors for text visibility</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default MemeGenerator;
