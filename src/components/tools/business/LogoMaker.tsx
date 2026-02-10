'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import {
    Download,
    RefreshCw,
    Upload,
    Sparkles,
    Shapes,
    Type,
    Palette,
    Settings,
    Copy,
    Zap,
    Star,
    Heart,
    Circle,
    Square,
    Triangle,
    Hexagon,
    Crown,
    Flame,
    Lightbulb,
    Rocket,
    Shield,
    Eye,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LogoConfig {
    text: string;
    tagline: string;
    fontSize: number;
    taglineSize: number;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    style: 'modern' | 'classic' | 'gradient' | 'outline' | 'badge' | 'minimal' | '3d' | 'retro' | 'geometric';
    fontFamily: string;
    icon: string | null;
    iconPosition: 'left' | 'right' | 'top' | 'center';
    shape: 'none' | 'circle' | 'square' | 'rounded' | 'hexagon' | 'shield';
    shadow: boolean;
    spacing: number;
    rotation: number;
    borderWidth: number;
    opacity: number;
}

const iconLibrary = [
    { name: 'Star', icon: '⭐', category: 'symbols' },
    { name: 'Heart', icon: '❤️', category: 'symbols' },
    { name: 'Lightning', icon: '⚡', category: 'symbols' },
    { name: 'Crown', icon: '👑', category: 'symbols' },
    { name: 'Fire', icon: '🔥', category: 'symbols' },
    { name: 'Rocket', icon: '🚀', category: 'tech' },
    { name: 'Bulb', icon: '💡', category: 'tech' },
    { name: 'Shield', icon: '🛡️', category: 'security' },
    { name: 'Diamond', icon: '💎', category: 'luxury' },
    { name: 'Trophy', icon: '🏆', category: 'success' },
    { name: 'Target', icon: '🎯', category: 'business' },
    { name: 'Check', icon: '✓', category: 'symbols' },
    { name: 'Plus', icon: '+', category: 'symbols' },
    { name: 'Infinity', icon: '∞', category: 'symbols' },
    { name: 'Circle', icon: '●', category: 'shapes' },
    { name: 'Square', icon: '■', category: 'shapes' },
    { name: 'Triangle', icon: '▲', category: 'shapes' },
];

const presetLogos = {
    tech: {
        text: 'TECH',
        tagline: 'Innovation First',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        style: 'gradient' as const,
        icon: '⚡',
        fontFamily: 'Arial Black',
    },
    luxury: {
        text: 'LUXE',
        tagline: 'Premium Quality',
        primaryColor: '#d4af37',
        secondaryColor: '#8b7355',
        style: 'classic' as const,
        icon: '💎',
        fontFamily: 'Georgia',
    },
    creative: {
        text: 'CREATE',
        tagline: 'Design Studio',
        primaryColor: '#ec4899',
        secondaryColor: '#db2777',
        style: '3d' as const,
        icon: '🎨',
        fontFamily: 'Arial',
    },
    minimal: {
        text: 'MIN',
        tagline: 'Less is More',
        primaryColor: '#000000',
        secondaryColor: '#666666',
        style: 'minimal' as const,
        icon: '●',
        fontFamily: 'Helvetica',
    },
    retro: {
        text: 'RETRO',
        tagline: 'Vintage Vibes',
        primaryColor: '#ff6b35',
        secondaryColor: '#f7931e',
        style: 'retro' as const,
        icon: '★',
        fontFamily: 'Georgia',
    }
};

const LogoMaker: React.FC = () => {
    const [config, setConfig] = useState<LogoConfig>({
        text: '',
        tagline: '',
        fontSize: 80,
        taglineSize: 24,
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        backgroundColor: '#ffffff',
        style: 'modern',
        fontFamily: 'Arial',
        icon: null,
        iconPosition: 'left',
        shape: 'none',
        shadow: false,
        spacing: 20,
        rotation: 0,
        borderWidth: 0,
        opacity: 100,
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [exportSize, setExportSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        drawLogo();
    }, [config]);

    const updateConfig = (updates: Partial<LogoConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const drawLogo = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = 1000;
        const height = 800;
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const logoText = config.text || 'LOGO';
        const centerX = width / 2;
        const centerY = height / 2;

        // Save context
        ctx.save();

        // Apply rotation
        if (config.rotation !== 0) {
            ctx.translate(centerX, centerY);
            ctx.rotate((config.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
        }

        // Apply shadow if enabled
        if (config.shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
        }

        // Draw shape background
        if (config.shape !== 'none') {
            const shapeSize = Math.max(300, config.fontSize * 3);
            ctx.fillStyle = config.primaryColor;
            ctx.globalAlpha = config.opacity / 100;

            switch (config.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, shapeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(centerX - shapeSize / 2, centerY - shapeSize / 2, shapeSize, shapeSize);
                    break;
                case 'rounded':
                    roundRect(ctx, centerX - shapeSize / 2, centerY - shapeSize / 2, shapeSize, shapeSize, 30);
                    ctx.fill();
                    break;
                case 'hexagon':
                    drawHexagon(ctx, centerX, centerY, shapeSize / 2);
                    ctx.fill();
                    break;
                case 'shield':
                    drawShield(ctx, centerX, centerY, shapeSize / 2);
                    ctx.fill();
                    break;
            }

            ctx.globalAlpha = 1;
            if (config.borderWidth > 0) {
                ctx.strokeStyle = config.secondaryColor;
                ctx.lineWidth = config.borderWidth;
                ctx.stroke();
            }
        }

        // Reset shadow for text
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Calculate icon and text positions
        const hasIcon = config.icon !== null;
        let textY = centerY - 20;
        let iconY = centerY - 20;
        let iconX = centerX;

        if (hasIcon && config.iconPosition === 'top') {
            iconY = centerY - config.fontSize / 2 - config.spacing;
            textY = centerY + config.spacing / 2;
        } else if (hasIcon && config.iconPosition === 'left') {
            const textWidth = ctx.measureText(logoText).width;
            iconX = centerX - textWidth / 2 - config.spacing - config.fontSize / 2;
        } else if (hasIcon && config.iconPosition === 'right') {
            const textWidth = ctx.measureText(logoText).width;
            iconX = centerX + textWidth / 2 + config.spacing + config.fontSize / 2;
        }

        // Draw based on style
        switch (config.style) {
            case 'modern':
                drawModernStyle(ctx, logoText, centerX, textY, config);
                break;
            case 'classic':
                drawClassicStyle(ctx, logoText, centerX, textY, config);
                break;
            case 'gradient':
                drawGradientStyle(ctx, logoText, centerX, textY, config);
                break;
            case 'outline':
                drawOutlineStyle(ctx, logoText, centerX, textY, config);
                break;
            case 'badge':
                drawBadgeStyle(ctx, logoText, centerX, centerY, config);
                break;
            case 'minimal':
                drawMinimalStyle(ctx, logoText, centerX, textY, config);
                break;
            case '3d':
                draw3DStyle(ctx, logoText, centerX, textY, config);
                break;
            case 'retro':
                drawRetroStyle(ctx, logoText, centerX, textY, config);
                break;
            case 'geometric':
                drawGeometricStyle(ctx, logoText, centerX, textY, config);
                break;
        }

        // Draw icon
        if (hasIcon && config.iconPosition !== 'center') {
            ctx.font = `${config.fontSize * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = config.shape !== 'none' ? '#ffffff' : config.secondaryColor;
            ctx.fillText(config.icon!, iconX, iconY);
        }

        // Restore context
        ctx.restore();
    };

    // Helper functions for drawing shapes
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    };

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
        const angle = (Math.PI * 2) / 6;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const px = x + radius * Math.cos(angle * i - Math.PI / 2);
            const py = y + radius * Math.sin(angle * i - Math.PI / 2);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    };

    const drawShield = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x + radius * 0.8, y - radius);
        ctx.lineTo(x + radius * 0.8, y);
        ctx.quadraticCurveTo(x + radius * 0.8, y + radius * 0.8, x, y + radius);
        ctx.quadraticCurveTo(x - radius * 0.8, y + radius * 0.8, x - radius * 0.8, y);
        ctx.lineTo(x - radius * 0.8, y - radius);
        ctx.closePath();
    };

    // Drawing style functions
    const drawModernStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        ctx.fillStyle = cfg.shape !== 'none' ? '#ffffff' : cfg.primaryColor;
        ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = cfg.shape !== 'none' ? 'rgba(255,255,255,0.5)' : cfg.secondaryColor;
        ctx.fillRect(x - textWidth / 2, y + cfg.fontSize / 3, textWidth, 6);

        if (cfg.tagline) {
            ctx.fillStyle = cfg.shape !== 'none' ? 'rgba(255,255,255,0.9)' : cfg.secondaryColor;
            ctx.font = `${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 30);
        }
    };

    const drawClassicStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        ctx.fillStyle = cfg.shape !== 'none' ? '#ffffff' : cfg.primaryColor;
        ctx.font = `bold ${cfg.fontSize}px Georgia`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

        const textWidth = ctx.measureText(text).width;
        ctx.strokeStyle = cfg.shape !== 'none' ? 'rgba(255,255,255,0.7)' : cfg.secondaryColor;
        ctx.lineWidth = 3;

        // Decorative lines
        ctx.beginPath();
        ctx.moveTo(x - textWidth / 2 - 40, y);
        ctx.lineTo(x - textWidth / 2 - 10, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + textWidth / 2 + 10, y);
        ctx.lineTo(x + textWidth / 2 + 40, y);
        ctx.stroke();

        if (cfg.tagline) {
            ctx.fillStyle = cfg.shape !== 'none' ? 'rgba(255,255,255,0.9)' : cfg.secondaryColor;
            ctx.font = `italic ${cfg.taglineSize}px Georgia`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 30);
        }
    };

    const drawGradientStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        const gradient = ctx.createLinearGradient(x - cfg.fontSize * 2, y, x + cfg.fontSize * 2, y);
        gradient.addColorStop(0, cfg.primaryColor);
        gradient.addColorStop(1, cfg.secondaryColor);

        ctx.fillStyle = gradient;
        ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

        if (cfg.tagline) {
            ctx.fillStyle = cfg.primaryColor;
            ctx.font = `${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 30);
        }
    };

    const drawOutlineStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        ctx.strokeStyle = cfg.primaryColor;
        ctx.lineWidth = 5;
        ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(text, x, y);

        ctx.fillStyle = cfg.backgroundColor === '#ffffff' ? '#f3f4f6' : '#ffffff';
        ctx.fillText(text, x, y);

        if (cfg.tagline) {
            ctx.fillStyle = cfg.primaryColor;
            ctx.font = `bold ${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 30);
        }
    };

    const drawBadgeStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${cfg.fontSize * 0.7}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y - 20);

        if (cfg.tagline) {
            ctx.font = `${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + 40);
        }
    };

    const drawMinimalStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        ctx.fillStyle = cfg.shape !== 'none' ? '#ffffff' : cfg.primaryColor;
        ctx.font = `300 ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = cfg.shape !== 'none' ? 'rgba(255,255,255,0.7)' : cfg.secondaryColor;
        ctx.beginPath();
        ctx.arc(x + textWidth / 2 + 20, y, 8, 0, Math.PI * 2);
        ctx.fill();

        if (cfg.tagline) {
            ctx.fillStyle = cfg.shape !== 'none' ? 'rgba(255,255,255,0.8)' : '#666666';
            ctx.font = `300 ${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 30);
        }
    };

    const draw3DStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        const layers = 5;
        ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw shadow layers
        for (let i = layers; i > 0; i--) {
            ctx.fillStyle = `rgba(0, 0, 0, ${0.1 * (layers - i + 1) / layers})`;
            ctx.fillText(text, x + i * 2, y + i * 2);
        }

        // Main text with gradient
        const gradient = ctx.createLinearGradient(x, y - cfg.fontSize / 2, x, y + cfg.fontSize / 2);
        gradient.addColorStop(0, cfg.primaryColor);
        gradient.addColorStop(1, cfg.secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.fillText(text, x, y - 2);

        if (cfg.tagline) {
            ctx.fillStyle = cfg.primaryColor;
            ctx.font = `${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 40);
        }
    };

    const drawRetroStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        // Retro stripes background
        const stripeHeight = 8;
        const numStripes = 6;
        const totalHeight = numStripes * stripeHeight;

        for (let i = 0; i < numStripes; i++) {
            const alpha = 0.3 - (i * 0.04);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, y - totalHeight / 2 + i * stripeHeight, 1000, stripeHeight);
        }

        // Main text
        ctx.fillStyle = cfg.primaryColor;
        ctx.font = `bold italic ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Outline for retro effect
        ctx.strokeStyle = cfg.secondaryColor;
        ctx.lineWidth = 6;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        if (cfg.tagline) {
            ctx.fillStyle = cfg.secondaryColor;
            ctx.font = `italic ${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 35);
        }
    };

    const drawGeometricStyle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cfg: LogoConfig) => {
        // Geometric patterns
        const size = 15;
        ctx.fillStyle = cfg.secondaryColor;
        ctx.globalAlpha = 0.1;

        for (let i = -5; i < 5; i++) {
            for (let j = -3; j < 3; j++) {
                ctx.fillRect(x + i * size * 3 - 200, y + j * size * 3 - 100, size, size);
            }
        }

        ctx.globalAlpha = 1;

        // Main text
        ctx.fillStyle = cfg.primaryColor;
        ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

        // Geometric accent
        ctx.fillStyle = cfg.secondaryColor;
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(x - textWidth / 2 - 10, y - cfg.fontSize / 2 - 10, 5, 5);
        ctx.fillRect(x + textWidth / 2 + 5, y + cfg.fontSize / 2 + 5, 5, 5);

        if (cfg.tagline) {
            ctx.fillStyle = cfg.secondaryColor;
            ctx.font = `${cfg.taglineSize}px ${cfg.fontFamily}`;
            ctx.fillText(cfg.tagline, x, y + cfg.fontSize / 2 + 35);
        }
    };

    const downloadLogo = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const sizes = {
            sm: { width: 512, height: 512 },
            md: { width: 1024, height: 1024 },
            lg: { width: 2048, height: 2048 },
            xl: { width: 4096, height: 4096 },
        };

        const size = sizes[exportSize];

        // Create temporary canvas for export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = size.width;
        exportCanvas.height = size.height;
        const exportCtx = exportCanvas.getContext('2d');

        if (exportCtx) {
            // Scale the current canvas to export size
            exportCtx.drawImage(canvas, 0, 0, size.width, size.height);

            exportCanvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `logo-${config.text.toLowerCase().replace(/\s+/g, '-') || 'design'}-${size.width}x${size.height}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(`Logo downloaded as ${size.width}x${size.height}px!`);
                }
            });
        }
    };

    const randomizeColors = () => {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
            '#14b8a6', '#f43f5e', '#a855f7', '#eab308', '#22c55e'
        ];
        const primary = colors[Math.floor(Math.random() * colors.length)];
        let secondary = colors[Math.floor(Math.random() * colors.length)];
        while (secondary === primary) {
            secondary = colors[Math.floor(Math.random() * colors.length)];
        }
        updateConfig({ primaryColor: primary, secondaryColor: secondary });
        toast.success('Colors randomized!');
    };

    const loadPreset = (preset: keyof typeof presetLogos) => {
        const presetConfig = presetLogos[preset];
        updateConfig(presetConfig as any);
        toast.success(`Loaded ${preset} preset!`);
    };

    const generateVariations = () => {
        const styles: LogoConfig['style'][] = ['modern', 'classic', 'gradient', 'outline', '3d', 'retro'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        updateConfig({ style: randomStyle });
        toast.success('Generated new variation!');
    };

    return (
        <AnimatedElement>
            <div className="max-w-7xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-6 w-6" />
                                    Professional Logo Maker
                                </CardTitle>
                                <CardDescription>
                                    Create stunning logos with advanced design tools and customization
                                </CardDescription>
                            </div>
                        </div>

                        {/* Preset Templates */}
                        <div className="flex gap-2 mt-4 flex-wrap">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Quick Start:
                            </span>
                            {Object.keys(presetLogos).map((preset) => (
                                <Button
                                    key={preset}
                                    onClick={() => loadPreset(preset as keyof typeof presetLogos)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                </Button>
                            ))}
                            <Button
                                onClick={generateVariations}
                                variant="outline"
                                size="sm"
                                className="ml-2"
                            >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Random Style
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Controls */}
                            <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2">
                                {/* Basic Text */}
                                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Type className="h-4 w-4" />
                                        Text & Content
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="text">Logo Text *</Label>
                                        <Input
                                            id="text"
                                            placeholder="Enter your brand name"
                                            value={config.text}
                                            onChange={(e) => updateConfig({ text: e.target.value.toUpperCase() })}
                                            className="text-lg font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tagline">Tagline (Optional)</Label>
                                        <Input
                                            id="tagline"
                                            placeholder="Your slogan or tagline"
                                            value={config.tagline}
                                            onChange={(e) => updateConfig({ tagline: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fontFamily">Font Family</Label>
                                        <select
                                            id="fontFamily"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={config.fontFamily}
                                            onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                                        >
                                            <option value="Arial">Arial</option>
                                            <option value="Arial Black">Arial Black</option>
                                            <option value="Helvetica">Helvetica</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Courier New">Courier New</option>
                                            <option value="Verdana">Verdana</option>
                                            <option value="Impact">Impact</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fontSize">Text Size: {config.fontSize}px</Label>
                                        <Slider
                                            id="fontSize"
                                            min={40}
                                            max={140}
                                            step={2}
                                            value={[config.fontSize]}
                                            onValueChange={(value) => updateConfig({ fontSize: value[0] })}
                                        />
                                    </div>

                                    {config.tagline && (
                                        <div className="space-y-2">
                                            <Label htmlFor="taglineSize">Tagline Size: {config.taglineSize}px</Label>
                                            <Slider
                                                id="taglineSize"
                                                min={12}
                                                max={48}
                                                step={1}
                                                value={[config.taglineSize]}
                                                onValueChange={(value) => updateConfig({ taglineSize: value[0] })}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Icons & Symbols */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Shapes className="h-4 w-4" />
                                            Icons & Symbols
                                        </h3>
                                        <Button
                                            onClick={() => setShowIcons(!showIcons)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {showIcons ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {showIcons && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-6 gap-2">
                                                <Button
                                                    variant={config.icon === null ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => updateConfig({ icon: null })}
                                                    className="aspect-square"
                                                >
                                                    None
                                                </Button>
                                                {iconLibrary.map((item) => (
                                                    <Button
                                                        key={item.name}
                                                        variant={config.icon === item.icon ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => updateConfig({ icon: item.icon })}
                                                        className="aspect-square text-xl"
                                                        title={item.name}
                                                    >
                                                        {item.icon}
                                                    </Button>
                                                ))}
                                            </div>

                                            {config.icon && (
                                                <div className="space-y-2">
                                                    <Label>Icon Position</Label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {(['left', 'right', 'top', 'center'] as const).map((pos) => (
                                                            <Button
                                                                key={pos}
                                                                variant={config.iconPosition === pos ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => updateConfig({ iconPosition: pos })}
                                                            >
                                                                {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Colors */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Palette className="h-4 w-4" />
                                            Colors
                                        </h3>
                                        <Button onClick={randomizeColors} size="sm" variant="outline">
                                            <RefreshCw className="h-4 w-4 mr-1" />
                                            Randomize
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="primaryColor">Primary Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="primaryColor"
                                                    type="color"
                                                    value={config.primaryColor}
                                                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                                    className="h-10 w-20"
                                                />
                                                <Input
                                                    value={config.primaryColor}
                                                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                                    placeholder="#3b82f6"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="secondaryColor">Secondary Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="secondaryColor"
                                                    type="color"
                                                    value={config.secondaryColor}
                                                    onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                                                    className="h-10 w-20"
                                                />
                                                <Input
                                                    value={config.secondaryColor}
                                                    onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                                                    placeholder="#1e40af"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="backgroundColor">Background Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="backgroundColor"
                                                    type="color"
                                                    value={config.backgroundColor}
                                                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                                    className="h-10 w-20"
                                                />
                                                <Input
                                                    value={config.backgroundColor}
                                                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Style Selection */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <h3 className="font-semibold">Design Style</h3>
                                    <Tabs value={config.style} onValueChange={(v) => updateConfig({ style: v as any })}>
                                        <TabsList className="grid grid-cols-3 w-full">
                                            <TabsTrigger value="modern">Modern</TabsTrigger>
                                            <TabsTrigger value="classic">Classic</TabsTrigger>
                                            <TabsTrigger value="gradient">Gradient</TabsTrigger>
                                        </TabsList>
                                        <TabsList className="grid grid-cols-3 w-full mt-2">
                                            <TabsTrigger value="outline">Outline</TabsTrigger>
                                            <TabsTrigger value="badge">Badge</TabsTrigger>
                                            <TabsTrigger value="minimal">Minimal</TabsTrigger>
                                        </TabsList>
                                        <TabsList className="grid grid-cols-3 w-full mt-2">
                                            <TabsTrigger value="3d">3D</TabsTrigger>
                                            <TabsTrigger value="retro">Retro</TabsTrigger>
                                            <TabsTrigger value="geometric">Geometric</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Advanced Options */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Advanced Options
                                        </h3>
                                        <Button
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {showAdvanced && (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label>Background Shape</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {(['none', 'circle', 'square', 'rounded', 'hexagon', 'shield'] as const).map((shape) => (
                                                        <Button
                                                            key={shape}
                                                            variant={config.shape === shape ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => updateConfig({ shape })}
                                                        >
                                                            {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="shadow"
                                                    checked={config.shadow}
                                                    onChange={(e) => updateConfig({ shadow: e.target.checked })}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor="shadow" className="cursor-pointer">Enable Shadow</Label>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Spacing: {config.spacing}px</Label>
                                                <Slider
                                                    min={0}
                                                    max={100}
                                                    step={5}
                                                    value={[config.spacing]}
                                                    onValueChange={(value) => updateConfig({ spacing: value[0] })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Rotation: {config.rotation}°</Label>
                                                <Slider
                                                    min={-45}
                                                    max={45}
                                                    step={1}
                                                    value={[config.rotation]}
                                                    onValueChange={(value) => updateConfig({ rotation: value[0] })}
                                                />
                                            </div>

                                            {config.shape !== 'none' && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label>Border Width: {config.borderWidth}px</Label>
                                                        <Slider
                                                            min={0}
                                                            max={20}
                                                            step={1}
                                                            value={[config.borderWidth]}
                                                            onValueChange={(value) => updateConfig({ borderWidth: value[0] })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Opacity: {config.opacity}%</Label>
                                                        <Slider
                                                            min={0}
                                                            max={100}
                                                            step={5}
                                                            value={[config.opacity]}
                                                            onValueChange={(value) => updateConfig({ opacity: value[0] })}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Live Preview
                                    </h3>
                                </div>

                                <div className="border rounded-lg p-6 bg-gray-100 flex items-center justify-center min-h-[500px]">
                                    <canvas
                                        ref={canvasRef}
                                        className="max-w-full h-auto shadow-2xl rounded"
                                        style={{ maxHeight: '500px' }}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label>Export Size</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                                                <Button
                                                    key={size}
                                                    variant={exportSize === size ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setExportSize(size)}
                                                >
                                                    {size === 'sm' && '512px'}
                                                    {size === 'md' && '1024px'}
                                                    {size === 'lg' && '2048px'}
                                                    {size === 'xl' && '4096px'}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={downloadLogo} className="w-full" size="lg">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Logo ({exportSize.toUpperCase()})
                                    </Button>
                                </div>

                                <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
                                    <p className="font-semibold">💡 Pro Tips:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Keep text short (2-8 characters) for impact</li>
                                        <li>Use contrasting colors for better visibility</li>
                                        <li>Test your logo on both light and dark backgrounds</li>
                                        <li>Export in XL size for print materials</li>
                                        <li>Try different styles to find your brand identity</li>
                                        <li>Add an icon for more visual interest</li>
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

export default LogoMaker;