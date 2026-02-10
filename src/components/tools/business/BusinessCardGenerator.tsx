'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import { Download, Palette, Type, Sparkles, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface CardData {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    website: string;
    address: string;
}

type TemplateType = 'modern' | 'elegant' | 'bold' | 'minimal' | 'retro' | 'neon' | 'vintage' | 'corporate' | 'creative' | 'gradient';

interface ColorPreset {
    name: string;
    primary: string;
    secondary: string;
    accent?: string;
}

const colorPresets: ColorPreset[] = [
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#0369a1' },
    { name: 'Sunset Orange', primary: '#f97316', secondary: '#ea580c' },
    { name: 'Forest Green', primary: '#22c55e', secondary: '#16a34a' },
    { name: 'Royal Purple', primary: '#a855f7', secondary: '#7e22ce' },
    { name: 'Rose Gold', primary: '#f43f5e', secondary: '#be123c' },
    { name: 'Midnight', primary: '#1e293b', secondary: '#0f172a' },
    { name: 'Retro Pink', primary: '#ec4899', secondary: '#db2777', accent: '#fbbf24' },
    { name: 'Neon Cyan', primary: '#06b6d4', secondary: '#0891b2', accent: '#f59e0b' },
    { name: 'Vintage Brown', primary: '#92400e', secondary: '#78350f', accent: '#d97706' },
];

const BusinessCardGenerator: React.FC = () => {
    const [cardData, setCardData] = useState<CardData>({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        address: '',
    });

    const [template, setTemplate] = useState<TemplateType>('modern');
    const [primaryColor, setPrimaryColor] = useState('#3b82f6');
    const [secondaryColor, setSecondaryColor] = useState('#1e40af');
    const [accentColor, setAccentColor] = useState('#fbbf24');
    const [fontSize, setFontSize] = useState(100);
    const [cornerRadius, setCornerRadius] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState<string>('');

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        drawBusinessCard();
    }, [cardData, template, primaryColor, secondaryColor, accentColor, fontSize, cornerRadius]);

    const updateField = (field: keyof CardData, value: string) => {
        setCardData(prev => ({ ...prev, [field]: value }));
    };

    const applyColorPreset = (preset: ColorPreset) => {
        setPrimaryColor(preset.primary);
        setSecondaryColor(preset.secondary);
        if (preset.accent) setAccentColor(preset.accent);
        setSelectedPreset(preset.name);
    };

    const randomizeColors = () => {
        const randomPreset = colorPresets[Math.floor(Math.random() * colorPresets.length)];
        applyColorPreset(randomPreset);
        toast.success(`Applied ${randomPreset.name} palette!`);
    };

    const drawBusinessCard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = 1050;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        const scale = fontSize / 100;

        ctx.clearRect(0, 0, width, height);

        // Apply corner radius if needed
        if (cornerRadius > 0) {
            ctx.save();
            roundRect(ctx, 0, 0, width, height, cornerRadius);
            ctx.clip();
        }

        switch (template) {
            case 'modern':
                drawModernCard(ctx, width, height, scale);
                break;
            case 'elegant':
                drawElegantCard(ctx, width, height, scale);
                break;
            case 'bold':
                drawBoldCard(ctx, width, height, scale);
                break;
            case 'minimal':
                drawMinimalCard(ctx, width, height, scale);
                break;
            case 'retro':
                drawRetroCard(ctx, width, height, scale);
                break;
            case 'neon':
                drawNeonCard(ctx, width, height, scale);
                break;
            case 'vintage':
                drawVintageCard(ctx, width, height, scale);
                break;
            case 'corporate':
                drawCorporateCard(ctx, width, height, scale);
                break;
            case 'creative':
                drawCreativeCard(ctx, width, height, scale);
                break;
            case 'gradient':
                drawGradientCard(ctx, width, height, scale);
                break;
        }

        if (cornerRadius > 0) {
            ctx.restore();
        }
    };

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

    const drawModernCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width * 0.4, 0, width * 0.6, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${48 * scale}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(cardData.company || 'COMPANY', 50, 100 * scale);

        ctx.fillStyle = '#1f2937';
        ctx.font = `bold ${56 * scale}px Arial`;
        ctx.fillText(cardData.name || 'Your Name', width * 0.4 + 50, 150 * scale);

        ctx.fillStyle = primaryColor;
        ctx.font = `${32 * scale}px Arial`;
        ctx.fillText(cardData.title || 'Job Title', width * 0.4 + 50, 200 * scale);

        ctx.fillStyle = '#4b5563';
        ctx.font = `${24 * scale}px Arial`;
        let yPos = 280 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, width * 0.4 + 50, yPos);
            yPos += 40 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, width * 0.4 + 50, yPos);
            yPos += 40 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, width * 0.4 + 50, yPos);
            yPos += 40 * scale;
        }
        if (cardData.address) {
            ctx.font = `${20 * scale}px Arial`;
            ctx.fillText(cardData.address, width * 0.4 + 50, yPos);
        }
    };

    const drawElegantCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, width - 40, height - 40);

        ctx.fillStyle = primaryColor;
        ctx.fillRect(40, height / 2 - 2, width - 80, 4);

        ctx.fillStyle = '#1f2937';
        ctx.font = `bold ${60 * scale}px Georgia`;
        ctx.textAlign = 'center';
        ctx.fillText(cardData.name || 'Your Name', width / 2, 150 * scale);

        ctx.fillStyle = primaryColor;
        ctx.font = `italic ${32 * scale}px Georgia`;
        ctx.fillText(cardData.title || 'Job Title', width / 2, 200 * scale);

        ctx.fillStyle = '#4b5563';
        ctx.font = `bold ${28 * scale}px Georgia`;
        ctx.fillText(cardData.company || 'Company', width / 2, 350 * scale);

        ctx.font = `${22 * scale}px Georgia`;
        let yPos = 400 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, width / 2, yPos);
            yPos += 35 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, width / 2, yPos);
            yPos += 35 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, width / 2, yPos);
        }
    };

    const drawBoldCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width * 0.3, 0);
        ctx.lineTo(width * 0.2, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${64 * scale}px Arial Black`;
        ctx.textAlign = 'left';
        ctx.fillText(cardData.name || 'YOUR NAME', 250, 150 * scale);

        ctx.font = `bold ${36 * scale}px Arial`;
        ctx.fillText(cardData.title || 'JOB TITLE', 250, 210 * scale);

        ctx.font = `${32 * scale}px Arial`;
        ctx.fillText(cardData.company || 'COMPANY', 250, 270 * scale);

        ctx.font = `${26 * scale}px Arial`;
        let yPos = 350 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, 250, yPos);
            yPos += 40 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, 250, yPos);
            yPos += 40 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, 250, yPos);
        }
    };

    const drawMinimalCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, 8, height);

        ctx.fillStyle = '#000000';
        ctx.font = `bold ${56 * scale}px Helvetica`;
        ctx.textAlign = 'left';
        ctx.fillText(cardData.name || 'Your Name', 80, 150 * scale);

        ctx.fillStyle = '#666666';
        ctx.font = `${28 * scale}px Helvetica`;
        ctx.fillText(cardData.title || 'Job Title', 80, 200 * scale);

        ctx.font = `${24 * scale}px Helvetica`;
        ctx.fillText(cardData.company || 'Company', 80, 240 * scale);

        ctx.fillStyle = '#333333';
        ctx.font = `${22 * scale}px Helvetica`;
        let yPos = 320 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, 80, yPos);
            yPos += 35 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, 80, yPos);
            yPos += 35 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, 80, yPos);
            yPos += 35 * scale;
        }
        if (cardData.address) {
            ctx.font = `${20 * scale}px Helvetica`;
            ctx.fillStyle = '#666666';
            ctx.fillText(cardData.address, 80, yPos);
        }
    };

    const drawRetroCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        // Retro sunburst background
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(1, primaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Retro stripes
        for (let i = 0; i < 12; i++) {
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate((i * Math.PI) / 6);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + (i % 2) * 0.1})`;
            ctx.fillRect(-10, -height, 20, height * 2);
            ctx.restore();
        }

        // Retro text box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(80, 80, width - 160, height - 160);

        // Border
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(80, 80, width - 160, height - 160);

        // Name with retro font style
        ctx.fillStyle = primaryColor;
        ctx.font = `bold ${64 * scale}px "Courier New"`;
        ctx.textAlign = 'center';
        ctx.fillText(cardData.name || 'YOUR NAME', width / 2, 200 * scale);

        // Decorative line
        ctx.fillStyle = accentColor;
        ctx.fillRect(150, 230 * scale, width - 300, 4);

        ctx.fillStyle = secondaryColor;
        ctx.font = `bold ${32 * scale}px "Courier New"`;
        ctx.fillText(cardData.title || 'Job Title', width / 2, 280 * scale);

        ctx.fillStyle = '#333333';
        ctx.font = `${28 * scale}px "Courier New"`;
        ctx.fillText(cardData.company || 'COMPANY', width / 2, 330 * scale);

        ctx.font = `${22 * scale}px "Courier New"`;
        let yPos = 390 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, width / 2, yPos);
            yPos += 35 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, width / 2, yPos);
            yPos += 35 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, width / 2, yPos);
        }
    };

    const drawNeonCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        // Dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Grid pattern
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        // Neon glow effect function
        const drawNeonText = (text: string, x: number, y: number, fontSize: number, color: string) => {
            ctx.font = `bold ${fontSize}px "Arial Black"`;
            ctx.textAlign = 'left';

            // Outer glow
            ctx.shadowBlur = 30;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);

            // Inner glow
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, y);

            ctx.shadowBlur = 0;
        };

        drawNeonText(cardData.name || 'YOUR NAME', 80, 150 * scale, 56 * scale, primaryColor);
        drawNeonText(cardData.title || 'JOB TITLE', 80, 220 * scale, 28 * scale, accentColor);
        drawNeonText(cardData.company || 'COMPANY', 80, 280 * scale, 32 * scale, secondaryColor);

        // Contact info without glow
        ctx.fillStyle = '#00ffff';
        ctx.font = `${22 * scale}px "Courier New"`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        let yPos = 360 * scale;
        if (cardData.email) {
            ctx.fillText(`> ${cardData.email}`, 80, yPos);
            yPos += 35 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(`> ${cardData.phone}`, 80, yPos);
            yPos += 35 * scale;
        }
        if (cardData.website) {
            ctx.fillText(`> ${cardData.website}`, 80, yPos);
        }
        ctx.shadowBlur = 0;
    };

    const drawVintageCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        // Vintage paper texture (cream background)
        ctx.fillStyle = '#f5f0e8';
        ctx.fillRect(0, 0, width, height);

        // Add vintage texture
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.05})`;
            ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
        }

        // Ornate border
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 6;
        ctx.strokeRect(40, 40, width - 80, height - 80);

        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, width - 100, height - 100);

        // Corner decorations
        const drawCornerDecoration = (x: number, y: number, rotation: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillStyle = secondaryColor;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(40, 10);
            ctx.lineTo(10, 40);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

        drawCornerDecoration(60, 60, 0);
        drawCornerDecoration(width - 60, 60, Math.PI / 2);
        drawCornerDecoration(width - 60, height - 60, Math.PI);
        drawCornerDecoration(60, height - 60, -Math.PI / 2);

        // Text with vintage serif font
        ctx.fillStyle = primaryColor;
        ctx.font = `${48 * scale}px Georgia`;
        ctx.textAlign = 'center';
        ctx.fillText(cardData.company || 'COMPANY NAME', width / 2, 150 * scale);

        // Decorative divider
        ctx.fillStyle = accentColor;
        ctx.fillRect(width / 2 - 100, 170 * scale, 200, 3);

        ctx.fillStyle = '#2d2d2d';
        ctx.font = `bold ${52 * scale}px Georgia`;
        ctx.fillText(cardData.name || 'Your Name', width / 2, 250 * scale);

        ctx.fillStyle = secondaryColor;
        ctx.font = `italic ${28 * scale}px Georgia`;
        ctx.fillText(cardData.title || 'Job Title', width / 2, 290 * scale);

        ctx.fillStyle = '#4a4a4a';
        ctx.font = `${22 * scale}px Georgia`;
        let yPos = 370 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, width / 2, yPos);
            yPos += 32 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, width / 2, yPos);
            yPos += 32 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, width / 2, yPos);
        }
    };

    const drawCorporateCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        // Clean white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Corporate color bar on left
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, 120, height);

        // Accent stripe
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(120, 0, 20, height);

        // Company logo placeholder
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${40 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(60, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(cardData.company || 'CORP', 0, 0);
        ctx.restore();

        // Main content
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `bold ${52 * scale}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(cardData.name || 'Your Name', 180, 150 * scale);

        ctx.fillStyle = primaryColor;
        ctx.font = `${30 * scale}px Arial`;
        ctx.fillText(cardData.title || 'Job Title', 180, 200 * scale);

        // Horizontal divider
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(180, 220 * scale, width - 220, 2);

        // Contact details
        ctx.fillStyle = '#4a4a4a';
        ctx.font = `${24 * scale}px Arial`;
        let yPos = 280 * scale;
        if (cardData.email) {
            ctx.fillText(`✉ ${cardData.email}`, 180, yPos);
            yPos += 40 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(`☎ ${cardData.phone}`, 180, yPos);
            yPos += 40 * scale;
        }
        if (cardData.website) {
            ctx.fillText(`🌐 ${cardData.website}`, 180, yPos);
            yPos += 40 * scale;
        }
        if (cardData.address) {
            ctx.font = `${20 * scale}px Arial`;
            ctx.fillStyle = '#6a6a6a';
            ctx.fillText(cardData.address, 180, yPos);
        }
    };

    const drawCreativeCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        // Colorful gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(0.5, accentColor);
        gradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Abstract shapes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(width * 0.2, height * 0.3, 150, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.7, 200, 0, Math.PI * 2);
        ctx.fill();

        // White content box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        roundRect(ctx, 100, 100, width - 200, height - 200, 20);
        ctx.fill();

        // Colorful accent bar
        const accentGradient = ctx.createLinearGradient(100, 100, width - 100, 100);
        accentGradient.addColorStop(0, primaryColor);
        accentGradient.addColorStop(0.5, accentColor);
        accentGradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = accentGradient;
        roundRect(ctx, 100, 100, width - 200, 20, 20);
        ctx.fill();

        // Content
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `bold ${56 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(cardData.name || 'Your Name', width / 2, 220 * scale);

        ctx.fillStyle = primaryColor;
        ctx.font = `${32 * scale}px Arial`;
        ctx.fillText(cardData.title || 'Creative Professional', width / 2, 270 * scale);

        ctx.fillStyle = secondaryColor;
        ctx.font = `bold ${28 * scale}px Arial`;
        ctx.fillText(cardData.company || 'Studio', width / 2, 320 * scale);

        ctx.fillStyle = '#4a4a4a';
        ctx.font = `${22 * scale}px Arial`;
        let yPos = 380 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, width / 2, yPos);
            yPos += 32 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, width / 2, yPos);
            yPos += 32 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, width / 2, yPos);
        }
    };

    const drawGradientCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
        // Multi-color gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(0.33, accentColor);
        gradient.addColorStop(0.66, secondaryColor);
        gradient.addColorStop(1, primaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Overlay pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < width; i += 60) {
            ctx.fillRect(i, 0, 30, height);
        }

        // Glass morphism effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        roundRect(ctx, 80, 120, width - 160, height - 240, 15);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Content with text shadow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${60 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(cardData.name || 'Your Name', width / 2, 220 * scale);

        ctx.font = `${30 * scale}px Arial`;
        ctx.fillText(cardData.title || 'Job Title', width / 2, 270 * scale);

        ctx.font = `bold ${28 * scale}px Arial`;
        ctx.fillText(cardData.company || 'Company', width / 2, 320 * scale);

        ctx.font = `${24 * scale}px Arial`;
        let yPos = 380 * scale;
        if (cardData.email) {
            ctx.fillText(cardData.email, width / 2, yPos);
            yPos += 35 * scale;
        }
        if (cardData.phone) {
            ctx.fillText(cardData.phone, width / 2, yPos);
            yPos += 35 * scale;
        }
        if (cardData.website) {
            ctx.fillText(cardData.website, width / 2, yPos);
        }
        ctx.shadowBlur = 0;
    };

    const downloadCard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `business-card-${template}.png`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Business card downloaded successfully!');
            }
        });
    };

    return (
        <AnimatedElement>
            <div className="max-w-7xl mx-auto">
                <Card className="shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                            <div>
                                <CardTitle className="text-3xl">Business Card Generator Pro</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    Design stunning professional business cards with advanced customization
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                            {/* Input Form - Takes 2 columns */}
                            <div className="xl:col-span-2 space-y-6">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <Type className="h-5 w-5" />
                                        Card Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                value={cardData.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="title">Job Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="Senior Developer"
                                                value={cardData.title}
                                                onChange={(e) => updateField('title', e.target.value)}
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company *</Label>
                                            <Input
                                                id="company"
                                                placeholder="Acme Inc."
                                                value={cardData.company}
                                                onChange={(e) => updateField('company', e.target.value)}
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={cardData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                placeholder="+1 (555) 123-4567"
                                                value={cardData.phone}
                                                onChange={(e) => updateField('phone', e.target.value)}
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                placeholder="www.example.com"
                                                value={cardData.website}
                                                onChange={(e) => updateField('website', e.target.value)}
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address (Optional)</Label>
                                            <Input
                                                id="address"
                                                placeholder="123 Main St, City"
                                                value={cardData.address}
                                                onChange={(e) => updateField('address', e.target.value)}
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <Palette className="h-5 w-5" />
                                        Color Customization
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Quick Presets</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {colorPresets.slice(0, 6).map((preset) => (
                                                    <Button
                                                        key={preset.name}
                                                        variant={selectedPreset === preset.name ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => applyColorPreset(preset)}
                                                        className="text-xs"
                                                    >
                                                        {preset.name}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={randomizeColors}
                                                className="w-full mt-2"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Random Colors
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="primaryColor">Primary Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="primaryColor"
                                                    type="color"
                                                    value={primaryColor}
                                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                                    className="h-10 w-16 cursor-pointer"
                                                />
                                                <Input
                                                    value={primaryColor}
                                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                                    placeholder="#3b82f6"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="secondaryColor">Secondary Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="secondaryColor"
                                                    type="color"
                                                    value={secondaryColor}
                                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                                    className="h-10 w-16 cursor-pointer"
                                                />
                                                <Input
                                                    value={secondaryColor}
                                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                                    placeholder="#1e40af"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="accentColor">Accent Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="accentColor"
                                                    type="color"
                                                    value={accentColor}
                                                    onChange={(e) => setAccentColor(e.target.value)}
                                                    className="h-10 w-16 cursor-pointer"
                                                />
                                                <Input
                                                    value={accentColor}
                                                    onChange={(e) => setAccentColor(e.target.value)}
                                                    placeholder="#fbbf24"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-4">Advanced Settings</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Font Size: {fontSize}%</Label>
                                            <Slider
                                                value={[fontSize]}
                                                onValueChange={(value) => setFontSize(value[0])}
                                                min={70}
                                                max={130}
                                                step={5}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Corner Radius: {cornerRadius}px</Label>
                                            <Slider
                                                value={[cornerRadius]}
                                                onValueChange={(value) => setCornerRadius(value[0])}
                                                min={0}
                                                max={40}
                                                step={5}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Section - Takes 3 columns */}
                            <div className="xl:col-span-3 space-y-4">
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-lg">Design Template</h3>
                                    </div>

                                    <Tabs value={template} onValueChange={(v) => setTemplate(v as TemplateType)} className="w-full">
                                        <TabsList className="grid grid-cols-5 w-full h-auto gap-2">
                                            <TabsTrigger value="modern" className="text-xs py-2">Modern</TabsTrigger>
                                            <TabsTrigger value="elegant" className="text-xs py-2">Elegant</TabsTrigger>
                                            <TabsTrigger value="bold" className="text-xs py-2">Bold</TabsTrigger>
                                            <TabsTrigger value="minimal" className="text-xs py-2">Minimal</TabsTrigger>
                                            <TabsTrigger value="retro" className="text-xs py-2">Retro</TabsTrigger>
                                        </TabsList>
                                        <TabsList className="grid grid-cols-5 w-full h-auto gap-2 mt-2">
                                            <TabsTrigger value="neon" className="text-xs py-2">Neon</TabsTrigger>
                                            <TabsTrigger value="vintage" className="text-xs py-2">Vintage</TabsTrigger>
                                            <TabsTrigger value="corporate" className="text-xs py-2">Corporate</TabsTrigger>
                                            <TabsTrigger value="creative" className="text-xs py-2">Creative</TabsTrigger>
                                            <TabsTrigger value="gradient" className="text-xs py-2">Gradient</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                <div className="border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center min-h-[500px]">
                                    <canvas
                                        ref={canvasRef}
                                        className="max-w-full h-auto shadow-2xl rounded-lg"
                                        style={{ maxHeight: '500px' }}
                                    />
                                </div>

                                <Button onClick={downloadCard} className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    <Download className="h-5 w-5 mr-2" />
                                    Download Business Card (PNG)
                                </Button>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">💡 Pro Tips:</p>
                                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                                        <li>Standard size: 3.5" × 2" (1050 × 600 pixels at 300 DPI)</li>
                                        <li>Print on 16pt cardstock for professional quality</li>
                                        <li>Use matte or glossy finish based on your design</li>
                                        <li>Keep important text 1/8" from edges (safe zone)</li>
                                        <li>Test print one card before ordering in bulk</li>
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

export default BusinessCardGenerator;