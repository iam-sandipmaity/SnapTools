import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  Upload: () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  Download: () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  Undo: () => <Icon d="M3 7v6h6M3.51 15a9 9 0 1 0 .49-4.5" />,
  Redo: () => <Icon d="M21 7v6h-6M20.49 15a9 9 0 1 1-.49-4.5" />,
  Reset: () => <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />,
  RotateCW: () => <Icon d="M23 4v6h-6M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />,
  RotateCCW: () => <Icon d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />,
  FlipH: () => <Icon d="M3 7l5 5-5 5V7zM21 7l-5 5 5 5V7zM12 3v18" />,
  FlipV: () => <Icon d="M21 3H3l9 9 9-9zM21 21H3l9-9-9 9" fill="currentColor" stroke="none" />,
  Crop: () => <Icon d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14" />,
  Sun: () => <Icon d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />,
  Contrast: () => <Icon d="M12 1a11 11 0 1 0 0 22A11 11 0 0 0 12 1zM12 3v18a9 9 0 0 1 0-18z" fill="currentColor" stroke="none" />,
  Droplet: () => <Icon d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
  Blur: () => <Icon d="M3 3h18v18H3zM8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />,
  Zap: () => <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  Layers: () => <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  Sliders: () => <Icon d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
  Palette: () => <Icon d="M12 22C6.49 22 2 17.52 2 12c0-5.52 4.49-10 10-10 5.52 0 10 4.49 10 10 0 2.21-1.79 4-4 4h-3a2 2 0 0 0-2 2 2 2 0 0 1-2 2H9a1 1 0 0 1-1-1" />,
  Wand: () => <Icon d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19.2 10.4M10.2 4.2L11.6 5.6M17.8 6.2L19.2 7.6M10.2 13.8L11.6 12.4M13 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM3 21l9-9" />,
  Clock: () => <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" />,
  Eye: () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
  EyeOff: () => <Icon d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />,
  X: () => <Icon d="M18 6L6 18M6 6l12 12" />,
  Check: () => <Icon d="M20 6L9 17l-5-5" />,
  Text: () => <Icon d="M4 7V4h16v3M9 20h6M12 4v16" />,
  Sticker: () => <Icon d="M12 2a10 10 0 0 1 10 10c0 5-4 8-8 8h-4a8 8 0 0 1-8-8 10 10 0 0 1 10-10z" />,
  ChevronRight: () => <Icon d="M9 18l6-6-6-6" />,
  ChevronLeft: () => <Icon d="M15 18l-6-6 6-6" />,
  Image: () => <Icon d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21" />,
  Maximize: () => <Icon d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  Minimize: () => <Icon d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />,
  Trash: () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />,
  Plus: () => <Icon d="M12 5v14M5 12h14" />,
  Minus: () => <Icon d="M5 12h14" />,
  ZoomIn: () => <Icon d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M11 8v6M8 11h6" />,
  ZoomOut: () => <Icon d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M8 11h6" />,
  Grid: () => <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  Crop2: () => <Icon d="M6.13 1L6 16a2 2 0 0 0 2 2h15M1 6.13L16 6a2 2 0 0 1 2 2v15" />,
};

// ─── Slider Component ─────────────────────────────────────────────────────────
const Slider = ({ label, value, min, max, step = 1, unit = "", onChange, color = "#a78bfa" }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value}{unit}</span>
      </div>
      <div className="slider-track-wrapper">
        <div className="slider-track" style={{ background: `linear-gradient(to right, ${color} ${pct}%, #2a2a3a ${pct}%)` }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  { name: "Chrome", brightness: 110, contrast: 115, saturation: 120, sepia: 0, hueRotate: 0, temperature: 10, blur: 0, grayscale: 0, vibrance: 15, sharpness: 0, highlights: 0, shadows: 0, fade: 0 },
  { name: "Fade", brightness: 110, contrast: 90, saturation: 80, sepia: 10, hueRotate: 0, temperature: 5, blur: 0, grayscale: 0, vibrance: 0, sharpness: 0, highlights: 10, shadows: 20, fade: 25 },
  { name: "Noir", brightness: 95, contrast: 130, saturation: 0, sepia: 0, hueRotate: 0, temperature: 0, blur: 0, grayscale: 100, vibrance: 0, sharpness: 0, highlights: 0, shadows: 0, fade: 0 },
  { name: "Warm", brightness: 105, contrast: 105, saturation: 110, sepia: 20, hueRotate: 0, temperature: 30, blur: 0, grayscale: 0, vibrance: 10, sharpness: 0, highlights: 0, shadows: 0, fade: 0 },
  { name: "Cool", brightness: 105, contrast: 105, saturation: 105, sepia: 0, hueRotate: 180, temperature: -30, blur: 0, grayscale: 0, vibrance: 5, sharpness: 0, highlights: 0, shadows: 0, fade: 0 },
  { name: "Vivid", brightness: 105, contrast: 120, saturation: 160, sepia: 0, hueRotate: 0, temperature: 0, blur: 0, grayscale: 0, vibrance: 30, sharpness: 0, highlights: 0, shadows: 0, fade: 0 },
  { name: "Matte", brightness: 108, contrast: 95, saturation: 85, sepia: 5, hueRotate: 0, temperature: 8, blur: 0, grayscale: 0, vibrance: 0, sharpness: 0, highlights: 15, shadows: 25, fade: 15 },
  { name: "Lomo", brightness: 100, contrast: 140, saturation: 130, sepia: 5, hueRotate: 5, temperature: -10, blur: 0, grayscale: 0, vibrance: 20, sharpness: 0, highlights: 0, shadows: 0, fade: 0 },
  { name: "Pastel", brightness: 115, contrast: 85, saturation: 70, sepia: 8, hueRotate: 0, temperature: 12, blur: 0, grayscale: 0, vibrance: 0, sharpness: 0, highlights: 20, shadows: 30, fade: 20 },
  { name: "Dramatic", brightness: 90, contrast: 150, saturation: 110, sepia: 0, hueRotate: 0, temperature: -5, blur: 0, grayscale: 0, vibrance: 5, sharpness: 0, highlights: -10, shadows: 0, fade: 0 },
];

const DEFAULT_FILTERS = {
  brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0,
  temperature: 0, vibrance: 0, sepia: 0, hueRotate: 0, invert: 0, opacity: 100,
  sharpness: 0, highlights: 0, shadows: 0, fade: 0
};

const TABS = [
  { id: "adjust", label: "Adjust", icon: "Sliders" },
  { id: "tone", label: "Tone", icon: "Sun" },
  { id: "effects", label: "Effects", icon: "Wand" },
  { id: "presets", label: "Presets", icon: "Layers" },
  { id: "transform", label: "Transform", icon: "RotateCW" },
  { id: "history", label: "History", icon: "Clock" },
];

const SPECIAL_EFFECTS = [
  { value: "none", label: "None" },
  { value: "vignette", label: "Vignette" },
  { value: "vignette_soft", label: "Soft Vignette" },
  { value: "noise", label: "Film Grain" },
  { value: "noise_heavy", label: "Heavy Grain" },
  { value: "pixelate", label: "Pixelate" },
  { value: "mosaic", label: "Mosaic" },
  { value: "vintage", label: "Vintage Film" },
  { value: "duotone_blue_orange", label: "Duotone: Blue/Orange" },
  { value: "duotone_purple_gold", label: "Duotone: Purple/Gold" },
  { value: "duotone_red_cyan", label: "Duotone: Red/Cyan" },
  { value: "glitch", label: "Glitch" },
  { value: "cross_process", label: "Cross Process" },
  { value: "halftone", label: "Halftone" },
  { value: "emboss", label: "Emboss" },
  { value: "edge_detect", label: "Edge Detect" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ImageEditor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("adjust");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentEffect, setCurrentEffect] = useState("none");
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showCropOverlay, setShowCropOverlay] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [imageName, setImageName] = useState("image");

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const dropZoneRef = useRef(null);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  const addToHistory = useCallback((imageData) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, imageData].slice(-30);
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const name = file.name.replace(/\.[^/.]+$/, "");
    setImageName(name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      setOriginalImage(dataUrl);
      setPreviewImage(dataUrl);
      setFilters(DEFAULT_FILTERS);
      setCurrentEffect("none");
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      setHistory([dataUrl]);
      setHistoryIndex(0);
      setActivePreset(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const applyFilters = useCallback(() => {
    if (!originalImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipX) ctx.scale(-1, 1);
      if (flipY) ctx.scale(1, -1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      const { brightness, contrast, saturation, blur, grayscale, sepia, hueRotate, temperature, vibrance, invert, opacity } = filters;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation + vibrance}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%) hue-rotate(${hueRotate + temperature}deg) invert(${invert}%) opacity(${opacity}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Post-process effects on pixel data
      applySpecialEffect(ctx, canvas, currentEffect, filters);

      const result = canvas.toDataURL("image/png");
      setPreviewImage(result);
      addToHistory(result);
      setIsProcessing(false);
    };
    img.src = originalImage;
  }, [originalImage, filters, currentEffect, rotation, flipX, flipY, addToHistory]);

  const applySpecialEffect = (ctx, canvas, effect, filters) => {
    if (effect === "none") {
      applyToneAdjustments(ctx, canvas, filters);
      return;
    }
    applyToneAdjustments(ctx, canvas, filters);

    const w = canvas.width, h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    switch (effect) {
      case "vignette": {
        ctx.putImageData(imageData, 0, 0);
        const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
        ctx.globalCompositeOperation = "source-over";
        break;
      }
      case "vignette_soft": {
        ctx.putImageData(imageData, 0, 0);
        const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.9);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.7, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.5)");
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
        ctx.globalCompositeOperation = "source-over";
        break;
      }
      case "noise":
        for (let i = 0; i < data.length; i+=4) {
          const n = (Math.random()-0.5)*25;
          data[i]=Math.min(255,Math.max(0,data[i]+n));
          data[i+1]=Math.min(255,Math.max(0,data[i+1]+n));
          data[i+2]=Math.min(255,Math.max(0,data[i+2]+n));
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case "noise_heavy":
        for (let i = 0; i < data.length; i+=4) {
          const n = (Math.random()-0.5)*60;
          data[i]=Math.min(255,Math.max(0,data[i]+n));
          data[i+1]=Math.min(255,Math.max(0,data[i+1]+n));
          data[i+2]=Math.min(255,Math.max(0,data[i+2]+n));
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case "pixelate": {
        const size = Math.max(6, Math.ceil(Math.min(w,h)/40));
        ctx.putImageData(imageData, 0, 0);
        for (let y=0;y<h;y+=size) for (let x=0;x<w;x+=size) {
          const px=Math.min(x+size/2,w-1), py=Math.min(y+size/2,h-1);
          const idx=(Math.floor(py)*w+Math.floor(px))*4;
          ctx.fillStyle=`rgb(${data[idx]},${data[idx+1]},${data[idx+2]})`;
          ctx.fillRect(x,y,size,size);
        }
        break;
      }
      case "mosaic": {
        const size = Math.max(16, Math.ceil(Math.min(w,h)/20));
        ctx.putImageData(imageData, 0, 0);
        for (let y=0;y<h;y+=size) for (let x=0;x<w;x+=size) {
          const px=Math.min(x+size/2,w-1), py=Math.min(y+size/2,h-1);
          const idx=(Math.floor(py)*w+Math.floor(px))*4;
          ctx.fillStyle=`rgb(${data[idx]},${data[idx+1]},${data[idx+2]})`;
          ctx.fillRect(x,y,size,size);
          ctx.strokeStyle="rgba(0,0,0,0.1)";
          ctx.strokeRect(x,y,size,size);
        }
        break;
      }
      case "vintage":
        for (let i=0;i<data.length;i+=4) {
          data[i]=Math.min(255,data[i]*1.1);
          data[i+1]=Math.min(255,data[i+1]*1.05);
          data[i+2]=Math.min(255,data[i+2]*0.85);
          const grain=(Math.random()-0.5)*15;
          data[i]=Math.min(255,Math.max(0,data[i]+grain));
          data[i+1]=Math.min(255,Math.max(0,data[i+1]+grain));
          data[i+2]=Math.min(255,Math.max(0,data[i+2]+grain));
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case "duotone_blue_orange":
        for (let i=0;i<data.length;i+=4) {
          const avg=(data[i]+data[i+1]+data[i+2])/3;
          if(avg<128){data[i]=avg*0.1;data[i+1]=avg*0.4;data[i+2]=avg*0.9;}
          else{data[i]=avg*1.0;data[i+1]=avg*0.6;data[i+2]=avg*0.1;}
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case "duotone_purple_gold":
        for (let i=0;i<data.length;i+=4) {
          const avg=(data[i]+data[i+1]+data[i+2])/3;
          if(avg<128){data[i]=avg*0.5;data[i+1]=avg*0.1;data[i+2]=avg*0.9;}
          else{data[i]=avg*1.0;data[i+1]=avg*0.8;data[i+2]=avg*0.0;}
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case "duotone_red_cyan":
        for (let i=0;i<data.length;i+=4) {
          const avg=(data[i]+data[i+1]+data[i+2])/3;
          if(avg<128){data[i]=avg*0.0;data[i+1]=avg*0.9;data[i+2]=avg*0.9;}
          else{data[i]=avg*1.0;data[i+1]=avg*0.1;data[i+2]=avg*0.1;}
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case "glitch": {
        ctx.putImageData(imageData, 0, 0);
        const slices = 8;
        for (let s=0;s<slices;s++) {
          const y=Math.random()*h, sh=Math.random()*(h/slices), offset=(Math.random()-0.5)*30;
          ctx.globalCompositeOperation = s%2===0 ? "screen" : "multiply";
          ctx.drawImage(canvas, 0, y, w, sh, offset, y, w, sh);
        }
        ctx.globalCompositeOperation = "source-over";
        break;
      }
      case "cross_process":
        for (let i=0;i<data.length;i+=4) {
          data[i]=Math.min(255,data[i]*1.2);
          data[i+1]=Math.min(255,Math.pow(data[i+1]/255,0.9)*255);
          data[i+2]=Math.min(255,data[i+2]*0.7+40);
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case "halftone": {
        const step = 6;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0,0,w,h);
        for (let y=0;y<h;y+=step) for (let x=0;x<w;x+=step) {
          const idx=(y*w+x)*4;
          const brightness=(data[idx]+data[idx+1]+data[idx+2])/3;
          const r = (1 - brightness/255) * step * 0.7;
          ctx.beginPath();
          ctx.arc(x+step/2,y+step/2,r,0,Math.PI*2);
          ctx.fillStyle=`rgba(${data[idx]},${data[idx+1]},${data[idx+2]},1)`;
          ctx.fill();
        }
        break;
      }
      case "emboss": {
        const copy = new Uint8ClampedArray(data);
        for (let y=1;y<h-1;y++) for (let x=1;x<w-1;x++) {
          const i=(y*w+x)*4;
          const tl=((y-1)*w+(x-1))*4;
          for (let c=0;c<3;c++) {
            let v = copy[tl+c]*-2 + copy[i+c]*0 + copy[i+4+c]*2 + 128;
            data[i+c]=Math.min(255,Math.max(0,v));
          }
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      }
      case "edge_detect": {
        const copy2 = new Uint8ClampedArray(data);
        for (let y=1;y<h-1;y++) for (let x=1;x<w-1;x++) {
          const i=(y*w+x)*4;
          const top=((y-1)*w+x)*4, bot=((y+1)*w+x)*4;
          const lft=(y*w+(x-1))*4, rgt=(y*w+(x+1))*4;
          for (let c=0;c<3;c++) {
            const gx = -copy2[lft+c]+copy2[rgt+c];
            const gy = -copy2[top+c]+copy2[bot+c];
            data[i+c]=Math.min(255,Math.sqrt(gx*gx+gy*gy));
          }
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      }
      default:
        ctx.putImageData(imageData, 0, 0);
    }
  };

  const applyToneAdjustments = (ctx, canvas, filters) => {
    const { highlights, shadows, fade } = filters;
    if (!highlights && !shadows && !fade) return;
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i]+data[i+1]+data[i+2])/3;
      for (let c = 0; c < 3; c++) {
        let v = data[i+c];
        if (highlights > 0 && v > 128) v = Math.min(255, v + highlights * ((v-128)/127));
        if (highlights < 0 && v > 128) v = Math.max(0, v + highlights * ((v-128)/127));
        if (shadows > 0 && v < 128) v = Math.min(255, v + shadows * ((128-v)/128));
        if (shadows < 0 && v < 128) v = Math.max(0, v + shadows * ((128-v)/128));
        if (fade > 0) v = v + (fade * 0.5);
        data[i+c] = Math.min(255, Math.max(0, v));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setPreviewImage(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setPreviewImage(history[newIdx]);
    }
  };

  const handleReset = () => {
    if (originalImage) {
      setPreviewImage(originalImage);
      setFilters(DEFAULT_FILTERS);
      setCurrentEffect("none");
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      setHistory([originalImage]);
      setHistoryIndex(0);
      setActivePreset(null);
    }
  };

  const applyPreset = (preset) => {
    const { name, ...f } = preset;
    setFilters(prev => ({ ...prev, ...f }));
    setActivePreset(name);
  };

  const handleDownload = (format = "png") => {
    if (!previewImage && !originalImage) return;
    const src = previewImage || originalImage;
    if (format === "png") {
      const a = document.createElement("a");
      a.href = src;
      a.download = `${imageName}-edited.png`;
      a.click();
    } else {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const a = document.createElement("a");
        a.href = canvas.toDataURL(`image/${format}`, 0.92);
        a.download = `${imageName}-edited.${format}`;
        a.click();
      };
      img.src = src;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .app {
          font-family: 'DM Sans', sans-serif;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Topbar ── */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          height: 48px;
          min-height: 48px;
          background: hsl(var(--sidebar-background));
          border-bottom: 1px solid hsl(var(--primary) / 0.15);
          flex-shrink: 0;
          gap: 8px;
        }
        .topbar-brand {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          color: hsl(var(--primary));
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-ghost {
          background: transparent;
          color: hsl(var(--foreground) / 0.7);
          border: 1px solid hsl(var(--foreground) / 0.08);
        }
        .btn-ghost:hover:not(:disabled) { background: hsl(var(--foreground) / 0.06); color: hsl(var(--foreground)); }
        .btn-primary {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          color: #fff;
          border: 1px solid hsl(var(--primary) / 0.3);
        }
        .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))); transform: translateY(-1px); }
        .btn-icon {
          background: transparent;
          color: hsl(var(--foreground) / 0.7);
          border: 1px solid hsl(var(--foreground) / 0.08);
          padding: 7px;
          border-radius: 7px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .btn-icon:hover:not(:disabled) { background: hsl(var(--foreground) / 0.06); color: hsl(var(--foreground)); }
        .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-apply {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          color: #fff;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 16px;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-apply:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 20px hsl(var(--primary) / 0.4); }
        .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Layout: Desktop side-by-side, Mobile stacked ── */
        .workspace {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* Desktop sidebar */
        .sidebar {
          width: ${sidebarCollapsed ? '0' : '300px'};
          min-width: ${sidebarCollapsed ? '0' : '300px'};
          background: hsl(var(--card));
          border-right: 1px solid hsl(var(--foreground) / 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.25s ease, min-width 0.25s ease;
          flex-shrink: 0;
        }
        .sidebar-inner {
          width: 300px;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* ── Tabs ── */
        .tabs-nav {
          display: flex;
          overflow-x: auto;
          border-bottom: 1px solid hsl(var(--primary) / 0.12);
          padding: 0 8px;
          flex-shrink: 0;
          scrollbar-width: none;
        }
        .tabs-nav::-webkit-scrollbar { display: none; }
        .tab-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 10px 10px 8px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: hsl(var(--foreground) / 0.55);
          cursor: pointer;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .tab-btn:hover { color: hsl(var(--foreground) / 0.7); }
        .tab-btn.active { color: hsl(var(--primary)); border-bottom-color: hsl(var(--primary)); }

        /* ── Panel ── */
        .panel {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--foreground) / 0.15) transparent;
          -webkit-overflow-scrolling: touch;
        }
        .panel::-webkit-scrollbar { width: 4px; }
        .panel::-webkit-scrollbar-track { background: transparent; }
        .panel::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }

        /* ── Slider ── */
        .slider-row { margin-bottom: 14px; }
        .slider-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .slider-label { font-size: 12px; color: #aaa; font-weight: 500; }
        .slider-value { font-size: 12px; color: #7c6fcd; font-family: 'Space Mono', monospace; }
        .slider-track-wrapper { position: relative; height: 4px; }
        .slider-track { width: 100%; height: 4px; border-radius: 2px; position: relative; }
        .slider-input {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 28px;
          transform: translateY(-50%);
          opacity: 0;
          cursor: pointer;
          margin: 0;
        }
        .slider-track-wrapper::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        /* ── Preview area ── */
        .preview-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: hsl(var(--background));
          min-width: 0;
          min-height: 0;
        }
        .preview-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-bottom: 1px solid hsl(var(--foreground) / 0.05);
          flex-shrink: 0;
          background: hsl(var(--card));
          flex-wrap: nowrap;
          overflow: hidden;
        }
        .preview-toolbar-filename {
          font-size: 11px;
          color: #555;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          flex: 1;
        }
        .preview-toolbar-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .canvas-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: 16px;
          min-height: 0;
        }
        .drop-zone {
          border: 2px dashed hsl(var(--primary) / 0.3);
          border-radius: 16px;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 160px;
        }
        .drop-zone:hover, .drop-zone.drag-over {
          border-color: hsl(var(--primary));
          background: hsl(var(--primary) / 0.05);
        }
        .drop-zone-icon { color: hsl(var(--primary) / 0.4); }
        .drop-zone h3 { font-size: 16px; font-weight: 600; color: hsl(var(--foreground) / 0.55); text-align: center; }
        .drop-zone p { font-size: 12px; color: hsl(var(--foreground) / 0.45); text-align: center; }
        .drop-zone .formats { font-size: 10px; color: hsl(var(--foreground) / 0.35); font-family: 'Space Mono', monospace; }
        .preview-img {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6);
          transition: transform 0.2s;
          display: block;
          object-fit: contain;
          transform: scale(${zoom/100});
          transform-origin: center;
        }
        .zoom-label {
          font-size: 11px;
          color: #666;
          font-family: 'Space Mono', monospace;
          min-width: 36px;
          text-align: center;
        }

        /* ── History ── */
        .history-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .history-item {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.15s;
          position: relative;
        }
        .history-item.active { border-color: hsl(var(--primary)); }
        .history-item:hover { border-color: hsl(var(--primary) / 0.5); }
        .history-item img { width: 100%; height: 100%; object-fit: cover; }
        .history-item .hist-num {
          position: absolute;
          bottom: 3px;
          right: 5px;
          font-size: 10px;
          color: rgba(255,255,255,0.6);
          font-family: 'Space Mono', monospace;
        }

        /* ── Presets ── */
        .presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .preset-card {
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          border: 1px solid hsl(var(--foreground) / 0.06);
          background: hsl(var(--foreground) / 0.02);
          transition: all 0.15s;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: hsl(var(--foreground) / 0.6);
        }
        .preset-card:hover { border-color: hsl(var(--primary) / 0.4); background: hsl(var(--primary) / 0.05); color: hsl(var(--foreground)); }
        .preset-card.active { border-color: hsl(var(--primary)); background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); }

        /* ── Effects ── */
        .effects-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
        .effect-btn {
          padding: 10px 8px;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid hsl(var(--foreground) / 0.06);
          background: hsl(var(--foreground) / 0.02);
          font-size: 12px;
          font-weight: 500;
          color: hsl(var(--foreground) / 0.6);
          transition: all 0.15s;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }
        .effect-btn:hover { border-color: hsl(var(--primary) / 0.4); color: hsl(var(--foreground)); }
        .effect-btn.active { border-color: hsl(var(--primary)); background: hsl(var(--primary) / 0.15); color: hsl(var(--accent) / 0.9); }

        /* ── Transform ── */
        .transform-group { margin-bottom: 20px; }
        .transform-group-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: hsl(var(--foreground) / 0.6);
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .transform-btns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* ── Section label ── */
        .section-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: hsl(var(--foreground) / 0.6);
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
          margin-top: 6px;
        }

        /* ── Divider ── */
        .divider { height: 1px; background: hsl(var(--foreground) / 0.05); margin: 14px 0; }

        /* ── Info bar ── */
        .info-bar {
          padding: 4px 12px;
          background: hsl(var(--card));
          border-top: 1px solid hsl(var(--foreground) / 0.04);
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 10px;
          color: hsl(var(--foreground) / 0.45);
          font-family: 'Space Mono', monospace;
          flex-shrink: 0;
        }
        .info-bar span { color: hsl(var(--foreground) / 0.6); }

        /* ── Processing overlay ── */
        .processing-badge {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: hsl(var(--primary) / 0.9);
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          z-index: 10;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Comparison toggle ── */
        .compare-btn.active {
          color: hsl(var(--primary));
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--primary) / 0.1);
        }

        /* ── Sidebar toggle (desktop only) ── */
        .sidebar-toggle {
          position: absolute;
          left: ${sidebarCollapsed ? '0' : '300px'};
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 18px;
          height: 44px;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--foreground) / 0.12);
          border-left: none;
          border-radius: 0 8px 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: hsl(var(--foreground) / 0.6);
          transition: all 0.25s;
        }
        .sidebar-toggle:hover { color: hsl(var(--primary)); }

        /* ── Download menu ── */
        .download-menu {
          position: relative;
          display: inline-block;
        }
        .download-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--foreground) / 0.15);
          border-radius: 10px;
          overflow: hidden;
          z-index: 100;
          min-width: 130px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        .download-item {
          padding: 10px 16px;
          font-size: 13px;
          color: hsl(var(--foreground) / 0.6);
          cursor: pointer;
          transition: background 0.1s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .download-item:hover { background: hsl(var(--primary) / 0.08); color: hsl(var(--foreground)); }

        /* ── Flip buttons ── */
        .flip-active { color: hsl(var(--primary)) !important; border-color: hsl(var(--primary) / 0.5) !important; }

        /* ══════════════════════════════════════
           MOBILE LAYOUT (≤ 640px)
           Stack: preview on top, controls below
           ══════════════════════════════════════ */
        @media (max-width: 640px) {
          .topbar { padding: 0 10px; height: 44px; min-height: 44px; }
          .topbar-brand { font-size: 12px; }

          /* Workspace becomes vertical column */
          .workspace { flex-direction: column; }

          /* Sidebar becomes a bottom panel — always visible, fixed height */
          .sidebar {
            width: 100% !important;
            min-width: 100% !important;
            border-right: none;
            border-top: 1px solid rgba(167,139,250,0.15);
            height: 44vh;
            min-height: 220px;
            max-height: 50vh;
            flex-shrink: 0;
            order: 2;
            transition: none;
          }
          .sidebar-inner { width: 100%; }

          /* Preview takes remaining top space */
          .preview-area { flex: 1; order: 1; min-height: 0; }

          /* Hide the desktop sidebar toggle handle */
          .sidebar-toggle { display: none !important; }

          /* Shrink canvas padding on mobile */
          .canvas-container { padding: 8px; }

          /* Drop zone adjustments */
          .drop-zone { min-height: 120px; gap: 8px; }
          .drop-zone h3 { font-size: 14px; }
          .drop-zone p { font-size: 11px; }

          /* Make tabs scrollable across full width */
          .tabs-nav { padding: 0 4px; }
          .tab-btn { padding: 8px 8px 6px; font-size: 9px; }

          /* Info bar — hide on mobile to save space */
          .info-bar { display: none; }

          /* Preview toolbar compact */
          .preview-toolbar { padding: 5px 10px; }
          .zoom-label { min-width: 30px; font-size: 10px; }

          /* Hide text labels in topbar buttons on very small screens */
          .btn-text { display: none; }
        }

        /* Medium screens: narrower sidebar */
        @media (min-width: 641px) and (max-width: 900px) {
          .sidebar {
            width: ${sidebarCollapsed ? '0' : '260px'} !important;
            min-width: ${sidebarCollapsed ? '0' : '260px'} !important;
          }
          .sidebar-inner { width: 260px; }
        }
      `}</style>

      <div className="app">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-brand">▸ PIXEDIT</div>
          <div className="topbar-actions">
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
              <Icons.Upload /> <span className="btn-text">Open</span>
            </button>

            <button className="btn-icon" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo">
              <Icons.Undo />
            </button>
            <button className="btn-icon" onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo">
              <Icons.Redo />
            </button>
            <button className="btn-icon" onClick={handleReset} disabled={!originalImage} title="Reset all">
              <Icons.Reset />
            </button>

            <DownloadButton onDownload={handleDownload} disabled={!previewImage} />
          </div>
        </div>

        <div className="workspace" style={{ position: "relative" }}>
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-inner">
              <div className="tabs-nav">
                {TABS.map(t => (
                  <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                    <span style={{ opacity: 0.8 }}>{React.createElement(Icons[t.icon as keyof typeof Icons])}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="panel">
                {activeTab === "adjust" && (
                  <>
                    <div className="section-label">Exposure</div>
                    <Slider label="Brightness" value={filters.brightness} min={0} max={200} onChange={v => setFilter("brightness", v)} color="#f59e0b" unit="%" />
                    <Slider label="Contrast" value={filters.contrast} min={0} max={200} onChange={v => setFilter("contrast", v)} color="#6366f1" unit="%" />
                    <Slider label="Highlights" value={filters.highlights} min={-100} max={100} onChange={v => setFilter("highlights", v)} color="#fcd34d" unit="" />
                    <Slider label="Shadows" value={filters.shadows} min={-100} max={100} onChange={v => setFilter("shadows", v)} color="#818cf8" unit="" />
                    <div className="divider" />
                    <div className="section-label">Color</div>
                    <Slider label="Saturation" value={filters.saturation} min={0} max={200} onChange={v => setFilter("saturation", v)} color="#f472b6" unit="%" />
                    <Slider label="Vibrance" value={filters.vibrance} min={-100} max={100} onChange={v => setFilter("vibrance", v)} color="#c084fc" unit="" />
                    <Slider label="Temperature" value={filters.temperature} min={-100} max={100} onChange={v => setFilter("temperature", v)} color="#fb923c" unit="°" />
                    <div className="divider" />
                    <div className="section-label">Detail</div>
                    <Slider label="Blur" value={filters.blur} min={0} max={15} step={0.1} onChange={v => setFilter("blur", v)} color="#94a3b8" unit="px" />
                    <Slider label="Grayscale" value={filters.grayscale} min={0} max={100} onChange={v => setFilter("grayscale", v)} color="#9ca3af" unit="%" />
                  </>
                )}

                {activeTab === "tone" && (
                  <>
                    <div className="section-label">Film</div>
                    <Slider label="Sepia" value={filters.sepia} min={0} max={100} onChange={v => setFilter("sepia", v)} color="#d97706" unit="%" />
                    <Slider label="Fade" value={filters.fade} min={0} max={60} onChange={v => setFilter("fade", v)} color="#a3a3a3" unit="" />
                    <div className="divider" />
                    <div className="section-label">Color Grading</div>
                    <Slider label="Hue Rotate" value={filters.hueRotate} min={0} max={360} onChange={v => setFilter("hueRotate", v)} color="#22d3ee" unit="°" />
                    <Slider label="Invert" value={filters.invert} min={0} max={100} onChange={v => setFilter("invert", v)} color="#e879f9" unit="%" />
                    <Slider label="Opacity" value={filters.opacity} min={0} max={100} onChange={v => setFilter("opacity", v)} color="#64748b" unit="%" />
                  </>
                )}

                {activeTab === "effects" && (
                  <>
                    <div className="section-label">Special Effects</div>
                    <div className="effects-grid">
                      {SPECIAL_EFFECTS.map(e => (
                        <button key={e.value} className={`effect-btn ${currentEffect === e.value ? "active" : ""}`} onClick={() => setCurrentEffect(e.value)}>
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "presets" && (
                  <>
                    <div className="section-label">Presets</div>
                    <div className="presets-grid">
                      {PRESETS.map(p => (
                        <div key={p.name} className={`preset-card ${activePreset === p.name ? "active" : ""}`} onClick={() => applyPreset(p)}>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "transform" && (
                  <>
                    <div className="transform-group">
                      <div className="transform-group-label">Rotate</div>
                      <div className="transform-btns">
                        <button className="btn-icon" onClick={() => setRotation(r => r - 90)} title="Rotate 90° CCW"><Icons.RotateCCW /></button>
                        <button className="btn-icon" onClick={() => setRotation(r => r + 90)} title="Rotate 90° CW"><Icons.RotateCW /></button>
                        <button className="btn-icon" onClick={() => setRotation(r => r - 1)} title="Rotate -1°"><Icons.Minus /></button>
                        <button className="btn-icon" onClick={() => setRotation(r => r + 1)} title="Rotate +1°"><Icons.Plus /></button>
                        <span style={{ fontSize: 12, color: "#7c6fcd", fontFamily: "Space Mono, monospace", alignSelf: "center" }}>{rotation}°</span>
                      </div>
                    </div>
                    <div className="transform-group">
                      <div className="transform-group-label">Flip</div>
                      <div className="transform-btns">
                        <button className={`btn-icon ${flipX ? "flip-active" : ""}`} onClick={() => setFlipX(v => !v)} title="Flip horizontal"><Icons.FlipH /></button>
                        <button className={`btn-icon ${flipY ? "flip-active" : ""}`} onClick={() => setFlipY(v => !v)} title="Flip vertical"><Icons.FlipV /></button>
                      </div>
                    </div>
                    <div className="transform-group">
                      <div className="transform-group-label">Zoom Preview</div>
                      <div className="transform-btns">
                        <button className="btn-icon" onClick={() => setZoom(z => Math.max(25, z - 25))} title="Zoom out"><Icons.ZoomOut /></button>
                        <span style={{ fontSize: 12, color: "#7c6fcd", fontFamily: "Space Mono, monospace", alignSelf: "center" }}>{zoom}%</span>
                        <button className="btn-icon" onClick={() => setZoom(z => Math.min(300, z + 25))} title="Zoom in"><Icons.ZoomIn /></button>
                        <button className="btn-icon" onClick={() => setZoom(100)} title="Reset zoom"><Icons.Maximize /></button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "history" && (
                  <>
                    <div className="section-label">Edit History ({history.length})</div>
                    {history.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#444", fontSize: 13 }}>
                        No history yet. Upload an image and apply some changes.
                      </div>
                    ) : (
                      <div className="history-grid">
                        {[...history].reverse().map((img, revIdx) => {
                          const idx = history.length - 1 - revIdx;
                          return (
                            <div key={idx} className={`history-item ${idx === historyIndex ? "active" : ""}`}
                              onClick={() => { setHistoryIndex(idx); setPreviewImage(history[idx]); }}>
                              <img src={img} alt={`v${idx + 1}`} />
                              <span className="hist-num">v{idx + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {originalImage && (
                  <button className="btn-apply" onClick={applyFilters} disabled={isProcessing}>
                    {isProcessing ? "⟳ Processing..." : "✦ Apply Changes"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="preview-area">
            <div className="preview-toolbar">
              <span className="preview-toolbar-filename">{imageName || "No file"}</span>
              <div className="preview-toolbar-right">
                <button
                  className={`btn-icon compare-btn ${showOriginal ? "active" : ""}`}
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  disabled={!originalImage}
                  title="Hold to compare with original"
                >
                  <Icons.Eye />
                </button>
                <button className="btn-icon" onClick={() => setZoom(z => Math.max(25, z - 25))} title="Zoom out" disabled={!originalImage}><Icons.ZoomOut /></button>
                <span className="zoom-label">{zoom}%</span>
                <button className="btn-icon" onClick={() => setZoom(z => Math.min(300, z + 25))} title="Zoom in" disabled={!originalImage}><Icons.ZoomIn /></button>
                <button className="btn-icon" onClick={() => setZoom(100)} disabled={!originalImage} title="Fit"><Icons.Maximize /></button>
              </div>
            </div>

            <div className="canvas-container"
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={!originalImage ? () => fileInputRef.current?.click() : undefined}
            >
              {isProcessing && (
                <div className="processing-badge">
                  <span className="spin" style={{ display: "inline-block" }}><Icons.RotateCW /></span>
                  Processing...
                </div>
              )}
              {previewImage ? (
                <img
                  src={showOriginal ? originalImage : previewImage}
                  alt="Preview"
                  className="preview-img"
                />
              ) : (
                <div className={`drop-zone ${isDragging ? "drag-over" : ""}`} ref={dropZoneRef}>
                  <div className="drop-zone-icon"><Icons.Image /></div>
                  <h3>Drop your image here</h3>
                  <p>or click to browse files</p>
                  <div className="formats">PNG · JPG · WEBP · GIF · BMP · SVG</div>
                </div>
              )}
            </div>

            {originalImage && (
              <div className="info-bar">
                <span>Hold <b style={{ color: "#7c6fcd" }}>👁 Compare</b> to see original</span>
                <span style={{ marginLeft: "auto" }}>History: {historyIndex + 1}/{history.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={e => handleFileChange(e.target.files?.[0])}
        style={{ display: "none" }}
      />
    </>
  );
}

// ─── Download Button with Dropdown ───────────────────────────────────────────
function DownloadButton({ onDownload, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="download-menu" ref={ref}>
      <button className="btn btn-primary" onClick={() => !disabled && setOpen(o => !o)} disabled={disabled}>
        <Icons.Download /> Export
      </button>
      {open && (
        <div className="download-dropdown">
          {["png", "jpeg", "webp"].map(fmt => (
            <button key={fmt} className="download-item" onClick={() => { onDownload(fmt); setOpen(false); }}>
              Export as .{fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}