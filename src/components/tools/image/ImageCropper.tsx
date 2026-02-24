import { useState, useRef, useEffect, useCallback } from "react";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ic = ({ d, size = 16, fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  Upload:   () => <Ic d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  Download: () => <Ic d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  Crop:     () => <Ic d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14" />,
  Reset:    () => <Ic d="M1 4v6h6M3.51 15a9 9 0 1 0 .49-4.5" />,
  Flip:     () => <Ic d="M3 7l5 5-5 5V7zM21 7l-5 5 5 5V7zM12 3v18" />,
  RotateCW: () => <Ic d="M23 4v6h-6M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />,
  RotateCCW:() => <Ic d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />,
  Lock:     () => <Ic d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />,
  Unlock:   () => <Ic d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 9.9-1" />,
  Grid:     () => <Ic d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  Image:    () => <Ic d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21" />,
  Check:    () => <Ic d="M20 6L9 17l-5-5" />,
  X:        () => <Ic d="M18 6L6 18M6 6l12 12" />,
  Eye:      () => <Ic d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
  Expand:   () => <Ic d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  Scissors: () => <Ic d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />,
  ZoomIn:   () => <Ic d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M11 8v6M8 11h6" />,
  ZoomOut:  () => <Ic d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M8 11h6" />,
  Square:   () => <Ic d="M3 3h18v18H3z" />,
  Circle:   () => <Ic d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />,
  Maximize: () => <Ic d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />,
  Layers:   () => <Ic d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  Sliders:  () => <Ic d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
};

// ─── Aspect Ratio Presets ─────────────────────────────────────────────────────
const ASPECT_PRESETS = [
  { label: "Free",    value: null },
  { label: "1:1",     value: 1 },
  { label: "4:3",     value: 4/3 },
  { label: "3:4",     value: 3/4 },
  { label: "16:9",    value: 16/9 },
  { label: "9:16",    value: 9/16 },
  { label: "3:2",     value: 3/2 },
  { label: "2:3",     value: 2/3 },
  { label: "A4",      value: 210/297 },
  { label: "Story",   value: 9/16 },
];

const GRID_MODES = ["none", "thirds", "grid", "diagonal", "golden"];
const HANDLE_SIZE = 10;
const MIN_CROP = 20;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ImageCropper() {
  const [image, setImage]               = useState(null);
  const [imgSize, setImgSize]           = useState({ w: 0, h: 0 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [rotation, setRotation]         = useState(0);
  const [flipH, setFlipH]               = useState(false);
  const [flipV, setFlipV]               = useState(false);
  const [zoom, setZoom]                 = useState(1);
  const [aspectLocked, setAspectLocked] = useState(null);
  const [gridMode, setGridMode]         = useState("thirds");
  const [circularCrop, setCircularCrop] = useState(false);
  const [showPreview, setShowPreview]   = useState(false);
  const [fileName, setFileName]         = useState("image");
  const [tab, setTab]                   = useState("crop"); // crop | adjust
  
  // Manual dimension inputs
  const [manualX, setManualX]           = useState(0);
  const [manualY, setManualY]           = useState(0);
  const [manualW, setManualW]           = useState(100);
  const [manualH, setManualH]           = useState(100);
  
  // The crop box in canvas-display coordinates
  const [crop, setCrop] = useState({ x: 40, y: 40, w: 200, h: 150 });
  
  // Drag state
  const dragRef   = useRef(null); // { type, startX, startY, initCrop }
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);
  const fileRef   = useRef(null);
  const containerRef = useRef(null);

  // Display canvas dimensions
  const [displaySize, setDisplaySize] = useState({ w: 600, h: 400 });

  // ── Compute scale: image pixels → canvas display pixels ──
  const scale = imgSize.w > 0 ? displaySize.w / imgSize.w : 1;

  // ── Load & render ──────────────────────────────────────────────────────────
  const loadImage = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const img = new Image();
      img.onload = () => {
        setImgSize({ w: img.width, h: img.height });
        setImage(src);
        setCroppedImage(null);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setZoom(1);
        setIsUploading(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Compute display size based on container ──
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxW = Math.max(rect.width - 2, 200);
      const maxH = Math.max(rect.height - 2, 200);
      if (imgSize.w === 0) {
        setDisplaySize({ w: maxW, h: maxH });
        return;
      }
      const ratio = imgSize.w / imgSize.h;
      let w = maxW, h = maxW / ratio;
      if (h > maxH) { h = maxH; w = maxH * ratio; }
      setDisplaySize({ w: Math.floor(w), h: Math.floor(h) });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [imgSize, image]);

  // ── Init crop when image loads ─────────────────────────────────────────────
  useEffect(() => {
    if (displaySize.w > 0 && imgSize.w > 0) {
      const pad = 20;
      const cw = displaySize.w - pad * 2;
      const ch = displaySize.h - pad * 2;
      setCrop({ x: pad, y: pad, w: cw, h: ch });
    }
  }, [displaySize, imgSize]);

  // ── Sync manual inputs with crop ──────────────────────────────────────────
  useEffect(() => {
    const s = imgSize.w > 0 ? imgSize.w / displaySize.w : 1;
    setManualX(Math.round(crop.x * s));
    setManualY(Math.round(crop.y * s));
    setManualW(Math.round(crop.w * s));
    setManualH(Math.round(crop.h * s));
  }, [crop, displaySize, imgSize]);

  // ── Draw canvas ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width  = displaySize.w;
    canvas.height = displaySize.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      // Draw dimmed background
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation * Math.PI / 180);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(img, 0, 0, displaySize.w, displaySize.h);
      ctx.restore();

      // Overlay dim
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Cut out crop area
      ctx.globalCompositeOperation = "destination-out";
      if (circularCrop) {
        ctx.beginPath();
        ctx.ellipse(crop.x + crop.w/2, crop.y + crop.h/2, crop.w/2, crop.h/2, 0, 0, Math.PI*2);
        ctx.fill();
      } else {
        ctx.fillRect(crop.x, crop.y, crop.w, crop.h);
      }
      ctx.restore();

      // Redraw original in crop area
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation * Math.PI / 180);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      if (circularCrop) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(crop.x + crop.w/2, crop.y + crop.h/2, crop.w/2, crop.h/2, 0, 0, Math.PI*2);
        ctx.clip();
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.rect(crop.x, crop.y, crop.w, crop.h);
        ctx.clip();
      }
      ctx.drawImage(img, 0, 0, displaySize.w, displaySize.h);
      ctx.restore();
      ctx.restore();

      // Draw grid overlay
      drawGrid(ctx, crop, gridMode);

      // Draw crop border
      ctx.save();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 4;
      if (circularCrop) {
        ctx.beginPath();
        ctx.ellipse(crop.x + crop.w/2, crop.y + crop.h/2, crop.w/2, crop.h/2, 0, 0, Math.PI*2);
        ctx.stroke();
      } else {
        ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
      }
      ctx.restore();

      // Draw handles
      if (!circularCrop) drawHandles(ctx, crop);
    };
    img.src = image;
  }, [image, crop, rotation, flipH, flipV, displaySize, gridMode, circularCrop]);

  const drawGrid = (ctx, c, mode) => {
    if (mode === "none") return;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 0.8;
    if (mode === "thirds") {
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(c.x + c.w*(i/3), c.y); ctx.lineTo(c.x + c.w*(i/3), c.y+c.h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c.x, c.y + c.h*(i/3)); ctx.lineTo(c.x+c.w, c.y + c.h*(i/3)); ctx.stroke();
      }
    } else if (mode === "grid") {
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(c.x + c.w*(i/4), c.y); ctx.lineTo(c.x + c.w*(i/4), c.y+c.h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c.x, c.y + c.h*(i/4)); ctx.lineTo(c.x+c.w, c.y + c.h*(i/4)); ctx.stroke();
      }
    } else if (mode === "diagonal") {
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x+c.w, c.y+c.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c.x+c.w, c.y); ctx.lineTo(c.x, c.y+c.h); ctx.stroke();
    } else if (mode === "golden") {
      const phi = 0.618;
      ctx.beginPath(); ctx.moveTo(c.x + c.w*phi, c.y); ctx.lineTo(c.x + c.w*phi, c.y+c.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c.x, c.y + c.h*phi); ctx.lineTo(c.x+c.w, c.y + c.h*phi); ctx.stroke();
    }
    ctx.restore();
  };

  const drawHandles = (ctx, c) => {
    const handles = getHandlePositions(c);
    handles.forEach(({ x, y }) => {
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillRect(x - HANDLE_SIZE/2, y - HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.restore();
    });
    // Edge handles (middle edges) - slightly smaller
    const edgeHandles = getEdgeHandlePositions(c);
    edgeHandles.forEach(({ x, y }) => {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.restore();
    });
  };

  const getHandlePositions = (c) => [
    { x: c.x,         y: c.y,         id: "tl" },
    { x: c.x + c.w,   y: c.y,         id: "tr" },
    { x: c.x,         y: c.y + c.h,   id: "bl" },
    { x: c.x + c.w,   y: c.y + c.h,   id: "br" },
  ];

  const getEdgeHandlePositions = (c) => [
    { x: c.x + c.w/2, y: c.y,         id: "t" },
    { x: c.x + c.w/2, y: c.y + c.h,   id: "b" },
    { x: c.x,         y: c.y + c.h/2, id: "l" },
    { x: c.x + c.w,   y: c.y + c.h/2, id: "r" },
  ];

  const getHitTarget = (mx, my, c) => {
    const hs = HANDLE_SIZE + 4;
    for (const { x, y, id } of getHandlePositions(c)) {
      if (Math.abs(mx - x) < hs && Math.abs(my - y) < hs) return id;
    }
    for (const { x, y, id } of getEdgeHandlePositions(c)) {
      if (Math.abs(mx - x) < hs && Math.abs(my - y) < hs) return id;
    }
    if (mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h) return "move";
    return null;
  };

  const getCursorForHandle = (id) => {
    const map = { tl: "nwse-resize", tr: "nesw-resize", bl: "nesw-resize", br: "nwse-resize",
                  t: "ns-resize", b: "ns-resize", l: "ew-resize", r: "ew-resize", move: "move" };
    return map[id] || "default";
  };

  // ── Pointer events ────────────────────────────────────────────────────────
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onPointerDown = (e) => {
    if (!image) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const hit = getHitTarget(x, y, crop);
    if (!hit) return;
    dragRef.current = { type: hit, startX: x, startY: y, initCrop: { ...crop } };
  };

  const onPointerMove = (e) => {
    if (!canvasRef.current || !image) return;
    const { x, y } = getPos(e);
    if (!dragRef.current) {
      const hit = getHitTarget(x, y, crop);
      canvasRef.current.style.cursor = getCursorForHandle(hit) || "crosshair";
      return;
    }
    e.preventDefault();
    const { type, startX, startY, initCrop: ic } = dragRef.current;
    const dx = x - startX, dy = y - startY;
    const W = displaySize.w, H = displaySize.h;

    let nc = { ...crop };
    if (type === "move") {
      nc.x = Math.max(0, Math.min(W - ic.w, ic.x + dx));
      nc.y = Math.max(0, Math.min(H - ic.h, ic.y + dy));
      nc.w = ic.w; nc.h = ic.h;
    } else {
      let { x: cx, y: cy, w: cw, h: ch } = ic;
      if (type.includes("l")) { const nx = Math.min(cx + cw - MIN_CROP, cx + dx); nc.x = Math.max(0, nx); nc.w = cw + (cx - nc.x); }
      if (type.includes("r")) { nc.w = Math.min(W - cx, Math.max(MIN_CROP, cw + dx)); }
      if (type.includes("t")) { const ny = Math.min(cy + ch - MIN_CROP, cy + dy); nc.y = Math.max(0, ny); nc.h = ch + (cy - nc.y); }
      if (type.includes("b")) { nc.h = Math.min(H - cy, Math.max(MIN_CROP, ch + dy)); }

      // Enforce aspect ratio
      if (aspectLocked) {
        if (type === "l" || type === "r") nc.h = nc.w / aspectLocked;
        else if (type === "t" || type === "b") nc.w = nc.h * aspectLocked;
        else {
          nc.w = Math.max(nc.w, nc.h * aspectLocked);
          nc.h = nc.w / aspectLocked;
        }
        nc.h = Math.max(MIN_CROP, nc.h);
        nc.w = Math.max(MIN_CROP, nc.w);
        // Clamp
        nc.w = Math.min(nc.w, W - nc.x);
        nc.h = Math.min(nc.h, H - nc.y);
      }
    }
    setCrop(nc);
  };

  const onPointerUp = () => { dragRef.current = null; };

  // ── Perform Crop ──────────────────────────────────────────────────────────
  const performCrop = useCallback(() => {
    if (!image || !imgSize.w) return;
    const s = imgSize.w / displaySize.w;
    const sx = crop.x * s, sy = crop.y * s, sw = crop.w * s, sh = crop.h * s;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.save();
      if (circularCrop) {
        ctx.beginPath();
        ctx.ellipse(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2, 0, 0, Math.PI*2);
        ctx.clip();
      }
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(rotation * Math.PI / 180);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.translate(-canvas.width/2, -canvas.height/2);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      setCroppedImage(canvas.toDataURL("image/png"));
      setShowPreview(true);
    };
    img.src = image;
  }, [image, crop, displaySize, imgSize, rotation, flipH, flipV, circularCrop]);

  // ── Download ──────────────────────────────────────────────────────────────
  const download = (format = "png") => {
    if (!croppedImage) return;
    if (format === "png") {
      const a = document.createElement("a");
      a.href = croppedImage;
      a.download = `${fileName}-cropped.png`;
      a.click();
    } else {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (format === "jpg") ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement("a");
        a.href = canvas.toDataURL(`image/${format === "jpg" ? "jpeg" : "webp"}`, 0.92);
        a.download = `${fileName}-cropped.${format}`;
        a.click();
      };
      img.src = croppedImage;
    }
  };

  // ── Set aspect ratio ──────────────────────────────────────────────────────
  const setAspect = (ratio) => {
    setAspectLocked(ratio);
    if (!ratio) return;
    // Adjust crop height to match
    const newH = crop.w / ratio;
    if (newH + crop.y <= displaySize.h) {
      setCrop(c => ({ ...c, h: newH }));
    } else {
      const newW = (displaySize.h - crop.y) * ratio;
      setCrop(c => ({ ...c, w: newW, h: displaySize.h - c.y }));
    }
  };

  // ── Select all ────────────────────────────────────────────────────────────
  const selectAll = () => {
    setCrop({ x: 0, y: 0, w: displaySize.w, h: displaySize.h });
  };

  // ── Apply manual crop input ───────────────────────────────────────────────
  const applyManual = () => {
    if (!imgSize.w) return;
    const s = displaySize.w / imgSize.w;
    const nx = Math.max(0, Math.min(manualX * s, displaySize.w - MIN_CROP));
    const ny = Math.max(0, Math.min(manualY * s, displaySize.h - MIN_CROP));
    const nw = Math.max(MIN_CROP, Math.min(manualW * s, displaySize.w - nx));
    const nh = Math.max(MIN_CROP, Math.min(manualH * s, displaySize.h - ny));
    setCrop({ x: nx, y: ny, w: nw, h: nh });
  };

  const imgScale = imgSize.w > 0 ? imgSize.w / displaySize.w : 1;
  const cropInPx = {
    x: Math.round(crop.x * imgScale),
    y: Math.round(crop.y * imgScale),
    w: Math.round(crop.w * imgScale),
    h: Math.round(crop.h * imgScale),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Mulish:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cr-app {
          font-family: 'Mulish', sans-serif;
          background: #f5f0e8;
          color: #1a1412;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Topbar ── */
        .cr-top {
          background: #1a1412;
          color: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 52px;
          flex-shrink: 0;
          gap: 12px;
        }
        .cr-brand {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #e8c547;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cr-brand svg { color: #e8c547; }
        .cr-top-actions { display: flex; align-items: center; gap: 8px; }

        /* ── Buttons ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          font-family: 'Mulish', sans-serif;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-dark {
          background: #f5f0e8;
          color: #1a1412;
        }
        .btn-dark:hover:not(:disabled) { background: #e8c547; }
        .btn-yellow {
          background: #e8c547;
          color: #1a1412;
        }
        .btn-yellow:hover:not(:disabled) { background: #d4b23a; transform: translateY(-1px); }
        .btn-outline {
          background: transparent;
          color: #1a1412;
          border: 1.5px solid rgba(26,20,18,0.2);
        }
        .btn-outline:hover:not(:disabled) { background: rgba(26,20,18,0.06); border-color: rgba(26,20,18,0.4); }
        .btn-outline-dark {
          background: transparent;
          color: #f5f0e8;
          border: 1.5px solid rgba(245,240,232,0.2);
        }
        .btn-outline-dark:hover:not(:disabled) { background: rgba(245,240,232,0.08); }
        .btn-icon {
          background: transparent;
          color: #1a1412;
          border: 1.5px solid rgba(26,20,18,0.15);
          padding: 7px;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .btn-icon:hover:not(:disabled) { background: rgba(26,20,18,0.07); border-color: rgba(26,20,18,0.35); }
        .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-icon.active { background: #1a1412; color: #e8c547; border-color: #1a1412; }
        .btn-icon.active-yellow { background: #e8c547; color: #1a1412; border-color: #e8c547; }

        /* ── Main layout ── */
        .cr-main {
          display: grid;
          grid-template-columns: 1fr 280px;
          flex: 1;
          gap: 0;
          overflow: hidden;
          min-height: 0;
        }

        /* ── Canvas area ── */
        .cr-canvas-area {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #2a2220;
          position: relative;
        }
        .cr-canvas-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #1a1412;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .cr-canvas-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
          position: relative;
        }
        .cr-canvas {
          display: block;
          touch-action: none;
          border: 2px solid rgba(232,197,71,0.3);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
          max-width: 100%;
          max-height: 100%;
        }
        .cr-drop-zone {
          border: 2px dashed rgba(232,197,71,0.4);
          border-radius: 12px;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 240px;
          color: rgba(245,240,232,0.4);
        }
        .cr-drop-zone:hover, .cr-drop-zone.drag-over {
          border-color: #e8c547;
          background: rgba(232,197,71,0.06);
          color: rgba(245,240,232,0.7);
        }
        .cr-drop-zone h3 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
        .cr-drop-zone p  { font-size: 12px; opacity: 0.6; }

        /* ── Sidebar ── */
        .cr-sidebar {
          background: #f5f0e8;
          border-left: 1.5px solid rgba(26,20,18,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Tabs ── */
        .cr-tabs {
          display: flex;
          border-bottom: 1.5px solid rgba(26,20,18,0.1);
          flex-shrink: 0;
        }
        .cr-tab {
          flex: 1;
          padding: 12px 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          background: none;
          color: rgba(26,20,18,0.4);
          border-bottom: 2.5px solid transparent;
          transition: all 0.15s;
          font-family: 'Mulish', sans-serif;
        }
        .cr-tab:hover { color: rgba(26,20,18,0.7); }
        .cr-tab.active { color: #1a1412; border-bottom-color: #e8c547; }

        /* ── Panel ── */
        .cr-panel {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(26,20,18,0.15) transparent;
          -webkit-overflow-scrolling: touch;
        }
        .cr-panel::-webkit-scrollbar { width: 4px; }
        .cr-panel::-webkit-scrollbar-thumb { background: rgba(26,20,18,0.15); border-radius: 4px; }

        .cr-section { margin-bottom: 20px; }
        .cr-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26,20,18,0.4);
          margin-bottom: 10px;
        }

        /* ── Aspect ratio buttons ── */
        .cr-aspect-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
        }
        .cr-aspect-btn {
          padding: 8px 4px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          border: 1.5px solid rgba(26,20,18,0.12);
          background: transparent;
          color: rgba(26,20,18,0.6);
          transition: all 0.12s;
          text-align: center;
          font-family: 'Mulish', sans-serif;
          letter-spacing: 0.03em;
        }
        .cr-aspect-btn:hover { border-color: rgba(26,20,18,0.4); color: #1a1412; }
        .cr-aspect-btn.active { background: #1a1412; color: #e8c547; border-color: #1a1412; }

        /* ── Grid mode buttons ── */
        .cr-grid-btns { display: flex; gap: 5px; flex-wrap: wrap; }
        .cr-grid-btn {
          padding: 6px 10px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          border: 1.5px solid rgba(26,20,18,0.12);
          background: transparent;
          color: rgba(26,20,18,0.6);
          transition: all 0.12s;
          font-family: 'Mulish', sans-serif;
          text-transform: capitalize;
        }
        .cr-grid-btn:hover { border-color: rgba(26,20,18,0.35); color: #1a1412; }
        .cr-grid-btn.active { background: #1a1412; color: #e8c547; border-color: #1a1412; }

        /* ── Manual inputs ── */
        .cr-inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cr-input-group label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(26,20,18,0.5);
          margin-bottom: 4px;
        }
        .cr-input {
          width: 100%;
          padding: 7px 10px;
          border-radius: 5px;
          border: 1.5px solid rgba(26,20,18,0.15);
          background: #fff;
          font-size: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          color: #1a1412;
          outline: none;
          transition: border-color 0.15s;
        }
        .cr-input:focus { border-color: #e8c547; }

        /* ── Info box ── */
        .cr-info-box {
          background: rgba(26,20,18,0.05);
          border-radius: 7px;
          padding: 10px 12px;
          font-size: 11px;
          color: rgba(26,20,18,0.6);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cr-info-row { display: flex; justify-content: space-between; }
        .cr-info-val { font-family: 'Syne', monospace; font-weight: 700; color: #1a1412; }

        /* ── Divider ── */
        .cr-divider { height: 1px; background: rgba(26,20,18,0.08); margin: 4px 0 16px; }

        /* ── Bottom crop button ── */
        .cr-crop-btn {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 800;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #1a1412;
          color: #e8c547;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .cr-crop-btn:hover:not(:disabled) { background: #2d2420; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,20,18,0.25); }
        .cr-crop-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Preview modal ── */
        .cr-modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(26,20,18,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .cr-modal {
          background: #f5f0e8;
          border-radius: 14px;
          overflow: hidden;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .cr-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #1a1412;
          color: #f5f0e8;
          flex-shrink: 0;
        }
        .cr-modal-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
        .cr-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .cr-modal-img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .cr-modal-img.circular { border-radius: 50%; }
        .cr-modal-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .cr-modal-footer {
          padding: 14px 18px;
          border-top: 1.5px solid rgba(26,20,18,0.1);
          font-size: 11px;
          color: rgba(26,20,18,0.5);
          text-align: center;
        }

        /* ── Status bar ── */
        .cr-statusbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 5px 14px;
          background: #0e0c0b;
          color: rgba(245,240,232,0.4);
          font-size: 10px;
          font-family: 'Syne', sans-serif;
          flex-shrink: 0;
        }
        .cr-statusbar span { color: rgba(245,240,232,0.7); }
        .cr-sep { color: rgba(245,240,232,0.15); }

        /* ── Toggle ── */
        .cr-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        .cr-toggle-label { font-size: 12px; font-weight: 600; }
        .cr-toggle {
          width: 36px;
          height: 20px;
          border-radius: 10px;
          background: rgba(26,20,18,0.15);
          position: relative;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .cr-toggle.on { background: #e8c547; }
        .cr-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .cr-toggle.on::after { transform: translateX(16px); }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .cr-main { grid-template-columns: 1fr; grid-template-rows: 1fr auto; }
          .cr-sidebar {
            border-left: none;
            border-top: 1.5px solid rgba(26,20,18,0.1);
            max-height: 44vh;
          }
          .cr-canvas-area { min-height: 45vh; }
          .cr-statusbar { flex-wrap: wrap; gap: 8px; }
          .cr-top { padding: 0 12px; }
          .btn-txt { display: none; }
        }
      `}</style>

      <div className="cr-app">
        {/* ── Topbar ── */}
        <div className="cr-top">
          <div className="cr-brand">
            <Ic d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14" size={18} />
            CROPMASTER
          </div>
          <div className="cr-top-actions">
            <button className="btn btn-outline-dark" onClick={() => fileRef.current?.click()}>
              <Icons.Upload /> <span className="btn-txt">Open Image</span>
            </button>
            {croppedImage && (
              <button className="btn btn-yellow" onClick={() => setShowPreview(true)}>
                <Icons.Eye /> <span className="btn-txt">Preview & Export</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Main workspace ── */}
        <div className="cr-main" style={{ flex: 1 }}>

          {/* Canvas side */}
          <div className="cr-canvas-area">
            {/* Canvas toolbar */}
            {image && (
              <div className="cr-canvas-toolbar">
                <button className="btn-icon" onClick={() => setRotation(r => r - 90)} title="Rotate CCW"><Icons.RotateCCW /></button>
                <button className="btn-icon" onClick={() => setRotation(r => r + 90)} title="Rotate CW"><Icons.RotateCW /></button>
                <button className={`btn-icon ${flipH ? "active" : ""}`} onClick={() => setFlipH(v => !v)} title="Flip H"><Icons.Flip /></button>
                <button className={`btn-icon ${flipV ? "active" : ""}`}
                  onClick={() => setFlipV(v => !v)} title="Flip V"
                  style={{ transform: "rotate(90deg)" }}><Icons.Flip /></button>
                <div style={{ width: 1, height: 20, background: "rgba(245,240,232,0.15)", margin: "0 4px" }} />
                <button className="btn-icon" style={{ color: "#e8c547" }} onClick={selectAll} title="Select all"><Icons.Maximize /></button>
                <button className="btn-icon" style={{ color: "#e8c547" }}
                  onClick={() => setCrop(c => ({ x: displaySize.w*0.1, y: displaySize.h*0.1, w: displaySize.w*0.8, h: displaySize.h*0.8 }))}
                  title="Reset crop"><Icons.Reset /></button>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "rgba(245,240,232,0.4)", fontFamily: "Syne,monospace" }}>
                    {Math.round(rotation)}°
                  </span>
                </div>
              </div>
            )}

            {/* Canvas container */}
            <div className="cr-canvas-container" ref={containerRef}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); loadImage(e.dataTransfer.files[0]); }}>
              {image ? (
                <canvas
                  ref={canvasRef}
                  className="cr-canvas"
                  width={displaySize.w}
                  height={displaySize.h}
                  style={{ width: displaySize.w, height: displaySize.h }}
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerUp}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                />
              ) : (
                <div className="cr-drop-zone" onClick={() => fileRef.current?.click()}>
                  <Ic d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21" size={48} />
                  <h3>Drop image here</h3>
                  <p>or click to browse · PNG, JPG, WebP, GIF, BMP, SVG</p>
                </div>
              )}
            </div>

            {/* Status bar */}
            {image && (
              <div className="cr-statusbar">
                <span>{fileName}</span>
                <span className="cr-sep">·</span>
                <span>{imgSize.w} × {imgSize.h}px</span>
                <span className="cr-sep">·</span>
                <span>Crop: {cropInPx.w} × {cropInPx.h}px</span>
                <span className="cr-sep">·</span>
                <span>at ({cropInPx.x}, {cropInPx.y})</span>
                {rotation !== 0 && <><span className="cr-sep">·</span><span>Rot: {rotation}°</span></>}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="cr-sidebar">
            <div className="cr-tabs">
              <button className={`cr-tab ${tab === "crop" ? "active" : ""}`} onClick={() => setTab("crop")}>Crop</button>
              <button className={`cr-tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
            </div>

            <div className="cr-panel">
              {tab === "crop" && (
                <>
                  {/* Aspect Ratio */}
                  <div className="cr-section">
                    <div className="cr-section-title">Aspect Ratio</div>
                    <div className="cr-aspect-grid">
                      {ASPECT_PRESETS.map(p => (
                        <button key={p.label}
                          className={`cr-aspect-btn ${aspectLocked === p.value && !(p.value === null && aspectLocked !== null) ? "active" : p.value === null && aspectLocked === null ? "active" : ""}`}
                          onClick={() => setAspect(p.value)}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cr-divider" />

                  {/* Grid Overlay */}
                  <div className="cr-section">
                    <div className="cr-section-title">Guide Overlay</div>
                    <div className="cr-grid-btns">
                      {GRID_MODES.map(m => (
                        <button key={m} className={`cr-grid-btn ${gridMode === m ? "active" : ""}`}
                          onClick={() => setGridMode(m)}>
                          {m === "none" ? "Off" : m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cr-divider" />

                  {/* Manual dimensions */}
                  <div className="cr-section">
                    <div className="cr-section-title">Manual Crop (px)</div>
                    <div className="cr-inputs-grid">
                      <div className="cr-input-group"><label>X</label><input className="cr-input" type="number" value={manualX} onChange={e => setManualX(+e.target.value)} onBlur={applyManual} onKeyDown={e => e.key === "Enter" && applyManual()} /></div>
                      <div className="cr-input-group"><label>Y</label><input className="cr-input" type="number" value={manualY} onChange={e => setManualY(+e.target.value)} onBlur={applyManual} onKeyDown={e => e.key === "Enter" && applyManual()} /></div>
                      <div className="cr-input-group"><label>Width</label><input className="cr-input" type="number" value={manualW} onChange={e => setManualW(+e.target.value)} onBlur={applyManual} onKeyDown={e => e.key === "Enter" && applyManual()} /></div>
                      <div className="cr-input-group"><label>Height</label><input className="cr-input" type="number" value={manualH} onChange={e => setManualH(+e.target.value)} onBlur={applyManual} onKeyDown={e => e.key === "Enter" && applyManual()} /></div>
                    </div>
                    <button className="btn btn-outline" style={{ marginTop: 8, width: "100%" }} onClick={applyManual}>Apply</button>
                  </div>

                  <div className="cr-divider" />

                  {/* Crop info */}
                  <div className="cr-section">
                    <div className="cr-section-title">Crop Region</div>
                    <div className="cr-info-box">
                      <div className="cr-info-row"><span>Position</span><span className="cr-info-val">({cropInPx.x}, {cropInPx.y})</span></div>
                      <div className="cr-info-row"><span>Size</span><span className="cr-info-val">{cropInPx.w} × {cropInPx.h}px</span></div>
                      <div className="cr-info-row"><span>Ratio</span><span className="cr-info-val">{cropInPx.w && cropInPx.h ? (cropInPx.w / cropInPx.h).toFixed(3) : "—"}</span></div>
                      {imgSize.w > 0 && <div className="cr-info-row"><span>Coverage</span><span className="cr-info-val">{Math.round((cropInPx.w * cropInPx.h) / (imgSize.w * imgSize.h) * 100)}%</span></div>}
                    </div>
                  </div>
                </>
              )}

              {tab === "settings" && (
                <>
                  {/* Circular crop toggle */}
                  <div className="cr-section">
                    <div className="cr-section-title">Shape</div>
                    <div className="cr-toggle-row">
                      <span className="cr-toggle-label">Circular Crop</span>
                      <button className={`cr-toggle ${circularCrop ? "on" : ""}`} onClick={() => setCircularCrop(v => !v)} />
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(26,20,18,0.45)", marginTop: 4 }}>
                      Crop to an ellipse. Best with 1:1 ratio for circles.
                    </p>
                  </div>

                  <div className="cr-divider" />

                  {/* Transform */}
                  <div className="cr-section">
                    <div className="cr-section-title">Transform</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn btn-outline" onClick={() => setRotation(r => r - 90)}><Icons.RotateCCW /> −90°</button>
                      <button className="btn btn-outline" onClick={() => setRotation(r => r + 90)}><Icons.RotateCW /> +90°</button>
                      <button className={`btn btn-outline ${flipH ? "btn-yellow" : ""}`} onClick={() => setFlipH(v => !v)}>Flip H</button>
                      <button className={`btn btn-outline ${flipV ? "btn-yellow" : ""}`} onClick={() => setFlipV(v => !v)}>Flip V</button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div className="cr-section-title" style={{ marginBottom: 6 }}>Fine Rotation</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="range" min={-180} max={180} step={1} value={rotation}
                          onChange={e => setRotation(+e.target.value)}
                          style={{ flex: 1, accentColor: "#e8c547" }} />
                        <span style={{ fontFamily: "Syne,monospace", fontSize: 12, fontWeight: 700, minWidth: 42, textAlign: "right" }}>{rotation}°</span>
                      </div>
                    </div>
                  </div>

                  <div className="cr-divider" />

                  {/* Image info */}
                  {image && (
                    <div className="cr-section">
                      <div className="cr-section-title">Source Image</div>
                      <div className="cr-info-box">
                        <div className="cr-info-row"><span>File</span><span className="cr-info-val" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span></div>
                        <div className="cr-info-row"><span>Dimensions</span><span className="cr-info-val">{imgSize.w} × {imgSize.h}</span></div>
                        <div className="cr-info-row"><span>Megapixels</span><span className="cr-info-val">{(imgSize.w * imgSize.h / 1e6).toFixed(2)} MP</span></div>
                        <div className="cr-info-row"><span>Ratio</span><span className="cr-info-val">{imgSize.w && imgSize.h ? (imgSize.w/imgSize.h).toFixed(3) : "—"}</span></div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Crop button */}
              <button className="cr-crop-btn" onClick={performCrop} disabled={!image}>
                <Icons.Scissors /> Crop Image
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {showPreview && croppedImage && (
        <div className="cr-modal-bg" onClick={() => setShowPreview(false)}>
          <div className="cr-modal" onClick={e => e.stopPropagation()}>
            <div className="cr-modal-header">
              <span className="cr-modal-title">✦ Cropped Result</span>
              <button className="btn-icon" style={{ color: "#f5f0e8", border: "1.5px solid rgba(245,240,232,0.2)" }} onClick={() => setShowPreview(false)}><Icons.X /></button>
            </div>
            <div className="cr-modal-body">
              <img
                src={croppedImage}
                alt="Cropped"
                className={`cr-modal-img ${circularCrop ? "circular" : ""}`}
              />
              <div className="cr-modal-actions">
                <button className="btn btn-dark" onClick={() => download("png")}><Icons.Download /> PNG</button>
                <button className="btn btn-dark" onClick={() => download("jpg")}><Icons.Download /> JPG</button>
                <button className="btn btn-dark" onClick={() => download("webp")}><Icons.Download /> WebP</button>
              </div>
            </div>
            <div className="cr-modal-footer">
              {cropInPx.w} × {cropInPx.h}px · Click outside to close
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }}
        onChange={e => loadImage(e.target.files?.[0])} />
    </>
  );
}