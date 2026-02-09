import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Lock,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize2,
  Minimize2,
  Printer,
  Loader2,
  FileUp,
  Eye,
  EyeOff,
  Info,
  FileType,
  Copy,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  X,
  BookmarkPlus,
  Layers,
  FileDown,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Settings,
  Moon,
  Sun,
  Grid3x3,
  BookOpen,
  Maximize,
  ScanSearch,
  Type,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import * as pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PDFDocument } from "pdf-lib-with-encrypt";

type FitMode = "page" | "width" | "auto" | "custom";
type ViewMode = "single" | "scroll" | "grid" | "book";
type RenderQuality = "low" | "medium" | "high" | "ultra";
type Theme = "light" | "dark" | "sepia";

interface PageCache {
  [key: number]: {
    canvas: HTMLCanvasElement;
    timestamp: number;
  };
}

interface Bookmark {
  page: number;
  label: string;
  timestamp: number;
}

interface SearchResult {
  page: number;
  text: string;
  index: number;
}

const PdfViewer = () => {
  // File State
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState<string>("");

  // PDF State
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);

  // Display State
  const [baseScale, setBaseScale] = useState(1.2); // Scale used for actual rendering
  const [displayScale, setDisplayScale] = useState(1.2); // Scale for CSS transform (instant)
  const [rotation, setRotation] = useState(0);
  const [baseRotation, setBaseRotation] = useState(0); // Rotation used for rendering
  const [fitMode, setFitMode] = useState<FitMode>("auto");
  const [viewMode, setViewMode] = useState<ViewMode>("scroll");
  const [renderQuality, setRenderQuality] = useState<RenderQuality>("high");
  const [theme, setTheme] = useState<Theme>("light");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Feature State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);

  // Export State
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOption, setExportOption] = useState<"decrypt" | "encrypt">("decrypt");
  const [exportPassword, setExportPassword] = useState("");
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Performance State
  const [pageCache, setPageCache] = useState<PageCache>({});
  const [enableCaching, setEnableCaching] = useState(true);
  const [enableSmoothScrolling, setEnableSmoothScrolling] = useState(true);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Memoized quality multiplier
  const qualityMultiplier = useMemo(() => {
    switch (renderQuality) {
      case "low": return 1;
      case "medium": return 1.5;
      case "high": return 2;
      case "ultra": return 3;
      default: return 2;
    }
  }, [renderQuality]);

  // Theme colors
  const themeColors = useMemo(() => {
    switch (theme) {
      case "dark":
        return { bg: "#1a1a1a", canvas: "#2d2d2d" };
      case "sepia":
        return { bg: "#f4ecd8", canvas: "#f9f6ed" };
      default:
        return { bg: "#f5f5f5", canvas: "#ffffff" };
    }
  }, [theme]);

  // Cancel any ongoing render task
  const cancelRenderTask = useCallback(() => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
  }, []);

  // Enhanced page rendering with caching - ONLY renders when necessary
  const renderPage = useCallback(async (pdf: any, pageNum: number, forceRender = false) => {
    if (rendering && !forceRender) return;

    // Check cache first
    if (enableCaching && !forceRender && pageCache[pageNum]) {
      const cached = pageCache[pageNum];
      const age = Date.now() - cached.timestamp;
      if (age < 300000 && canvasRef.current) { // 5 minute cache
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          canvasRef.current.width = cached.canvas.width;
          canvasRef.current.height = cached.canvas.height;
          canvasRef.current.style.width = cached.canvas.style.width;
          canvasRef.current.style.height = cached.canvas.style.height;
          ctx.drawImage(cached.canvas, 0, 0);
          setCurrentPage(pageNum);
          return;
        }
      }
    }

    cancelRenderTask();
    setRendering(true);

    try {
      if (!canvasRef.current || !containerRef.current) {
        setRendering(false);
        return;
      }

      const page = await pdf.getPage(pageNum);

      // Calculate optimal scale for RENDERING (not display)
      let renderScale = baseScale;
      if (fitMode === "width") {
        const containerWidth = containerRef.current.clientWidth - 40;
        const viewport = page.getViewport({ scale: 1, rotation: baseRotation });
        renderScale = containerWidth / viewport.width;
      } else if (fitMode === "page") {
        const containerWidth = containerRef.current.clientWidth - 40;
        const containerHeight = containerRef.current.clientHeight - 40;
        const viewport = page.getViewport({ scale: 1, rotation: baseRotation });
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        renderScale = Math.min(scaleX, scaleY);
      } else if (fitMode === "auto") {
        const containerWidth = containerRef.current.clientWidth - 40;
        const viewport = page.getViewport({ scale: 1, rotation: baseRotation });
        renderScale = Math.min(containerWidth / viewport.width, 1.5);
      }

      const viewport = page.getViewport({ scale: renderScale, rotation: baseRotation });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: false
      });

      if (!ctx) {
        toast.error("Failed to get canvas context");
        setRendering(false);
        return;
      }

      // High quality rendering with device pixel ratio
      const pixelRatio = qualityMultiplier * (window.devicePixelRatio || 1);
      const outputWidth = viewport.width * pixelRatio;
      const outputHeight = viewport.height * pixelRatio;

      canvas.width = outputWidth;
      canvas.height = outputHeight;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Reset and prepare canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, outputWidth, outputHeight);
      ctx.fillStyle = themeColors.canvas;
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.scale(pixelRatio, pixelRatio);

      // Render with intent for better quality
      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
        intent: 'display',
        enableWebGL: true,
        renderInteractiveForms: true,
      });

      renderTaskRef.current = renderTask;
      await renderTask.promise;

      // Cache the rendered page
      if (enableCaching) {
        const cacheCanvas = document.createElement("canvas");
        cacheCanvas.width = canvas.width;
        cacheCanvas.height = canvas.height;
        cacheCanvas.style.width = canvas.style.width;
        cacheCanvas.style.height = canvas.style.height;
        const cacheCtx = cacheCanvas.getContext("2d");
        if (cacheCtx) {
          cacheCtx.drawImage(canvas, 0, 0);
          setPageCache(prev => ({
            ...prev,
            [pageNum]: {
              canvas: cacheCanvas,
              timestamp: Date.now()
            }
          }));
        }
      }

      setCurrentPage(pageNum);

      // Sync display scale with base scale after render
      setDisplayScale(renderScale);
      setBaseScale(renderScale);
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error("Page render error:", err);
        toast.error("Failed to render page");
      }
    } finally {
      setRendering(false);
      renderTaskRef.current = null;
    }
  }, [baseScale, baseRotation, fitMode, rendering, enableCaching, pageCache, qualityMultiplier, themeColors, cancelRenderTask]);

  // Enhanced scroll view with virtual rendering
  const renderScrollView = useCallback(async (pdf: any) => {
    if (rendering) return;

    cancelRenderTask();
    setRendering(true);

    try {
      if (!scrollCanvasRef.current || !containerRef.current) {
        setRendering(false);
        return;
      }

      const canvas = scrollCanvasRef.current;
      const ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: false
      });

      if (!ctx) {
        toast.error("Failed to get canvas context");
        setRendering(false);
        return;
      }

      // Calculate optimal scale
      let renderScale = baseScale;
      if (fitMode === "width" || fitMode === "auto") {
        const containerWidth = containerRef.current.clientWidth - 40;
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1, rotation: baseRotation });
        renderScale = containerWidth / viewport.width;
      }

      // Calculate layout
      let totalHeight = 0;
      let maxWidth = 0;
      const pageGap = 20;
      const pageData: Array<{ viewport: any; height: number; yOffset: number }> = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: renderScale, rotation: baseRotation });
        const yOffset = totalHeight;
        pageData.push({ viewport, height: viewport.height, yOffset });
        totalHeight += viewport.height + pageGap;
        maxWidth = Math.max(maxWidth, viewport.width);
      }

      // Setup canvas with quality
      const pixelRatio = qualityMultiplier * (window.devicePixelRatio || 1);
      const outputWidth = maxWidth * pixelRatio;
      const outputHeight = totalHeight * pixelRatio;

      canvas.width = outputWidth;
      canvas.height = outputHeight;
      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${totalHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, outputWidth, outputHeight);
      ctx.fillStyle = themeColors.bg;
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.scale(pixelRatio, pixelRatio);

      // Render all pages with progress
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const { viewport, yOffset } = pageData[i - 1];

        // Create temp canvas for page
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d", { alpha: false })!;
        tempCanvas.width = viewport.width * pixelRatio;
        tempCanvas.height = viewport.height * pixelRatio;
        tempCtx.scale(pixelRatio, pixelRatio);

        // Render page
        const renderTask = page.render({
          canvasContext: tempCtx,
          viewport,
          intent: 'display',
          enableWebGL: true,
        });

        await renderTask.promise;

        // Draw to main canvas
        ctx.fillStyle = themeColors.canvas;
        ctx.fillRect(0, yOffset, viewport.width, viewport.height);
        ctx.drawImage(tempCanvas, 0, yOffset, viewport.width, viewport.height);

        // Draw separator
        if (i < pdf.numPages) {
          ctx.fillStyle = theme === "dark" ? "#404040" : "#e0e0e0";
          ctx.fillRect(0, yOffset + viewport.height, maxWidth, pageGap);

          // Page number label
          ctx.fillStyle = theme === "dark" ? "#888" : "#999";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`Page ${i}`, maxWidth / 2, yOffset + viewport.height + 14);
        }
      }

      toast.success(`All ${pdf.numPages} pages rendered successfully`);
    } catch (err: any) {
      console.error("Scroll render error:", err);
      toast.error("Failed to render pages");
    } finally {
      setRendering(false);
    }
  }, [baseScale, baseRotation, fitMode, rendering, qualityMultiplier, themeColors, theme, cancelRenderTask]);

  // Grid view rendering
  const renderGridView = useCallback(async (pdf: any) => {
    if (rendering) return;

    setRendering(true);
    try {
      if (!scrollCanvasRef.current || !containerRef.current) {
        setRendering(false);
        return;
      }

      const canvas = scrollCanvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false })!;

      const cols = Math.min(3, Math.floor(containerRef.current.clientWidth / 250));
      const thumbSize = 200;
      const gap = 20;
      const rows = Math.ceil(pdf.numPages / cols);

      const totalWidth = cols * thumbSize + (cols - 1) * gap;
      const totalHeight = rows * (thumbSize * 1.4 + gap);

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = totalWidth * pixelRatio;
      canvas.height = totalHeight * pixelRatio;
      canvas.style.width = `${totalWidth}px`;
      canvas.style.height = `${totalHeight}px`;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.fillStyle = themeColors.bg;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const col = (i - 1) % cols;
        const row = Math.floor((i - 1) / cols);
        const x = col * (thumbSize + gap);
        const y = row * (thumbSize * 1.4 + gap);

        const viewport = page.getViewport({ scale: thumbSize / page.getViewport({ scale: 1 }).width });

        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCanvas.width = viewport.width * pixelRatio;
        tempCanvas.height = viewport.height * pixelRatio;
        tempCtx.scale(pixelRatio, pixelRatio);

        await page.render({ canvasContext: tempCtx, viewport }).promise;

        // Draw thumbnail
        ctx.fillStyle = themeColors.canvas;
        ctx.fillRect(x, y, thumbSize, viewport.height);
        ctx.drawImage(tempCanvas, x, y, thumbSize, viewport.height);

        // Draw border
        ctx.strokeStyle = theme === "dark" ? "#555" : "#ddd";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, thumbSize, viewport.height);

        // Draw page number
        ctx.fillStyle = theme === "dark" ? "#fff" : "#000";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Page ${i}`, x + thumbSize / 2, y + viewport.height + 20);
      }

      toast.success("Grid view rendered");
    } catch (err) {
      console.error("Grid render error:", err);
      toast.error("Failed to render grid view");
    } finally {
      setRendering(false);
    }
  }, [rendering, themeColors, theme]);

  // Search functionality
  const handleSearch = useCallback(async () => {
    if (!pdfDocument || !searchQuery.trim()) return;

    setSearchResults([]);
    setCurrentSearchIndex(0);

    try {
      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");

        let index = 0;
        while ((index = pageText.toLowerCase().indexOf(query, index)) !== -1) {
          const start = Math.max(0, index - 40);
          const end = Math.min(pageText.length, index + query.length + 40);
          results.push({
            page: i,
            text: pageText.substring(start, end),
            index: index
          });
          index += query.length;
        }
      }

      setSearchResults(results);
      if (results.length > 0) {
        toast.success(`Found ${results.length} result(s)`);
        goToPage(results[0].page);
      } else {
        toast.info("No results found");
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    }
  }, [pdfDocument, searchQuery]);

  // Bookmark management
  const addBookmark = useCallback(() => {
    const label = prompt(`Bookmark page ${currentPage}:`, `Page ${currentPage}`);
    if (label) {
      setBookmarks(prev => [...prev, {
        page: currentPage,
        label,
        timestamp: Date.now()
      }]);
      toast.success("Bookmark added");
    }
  }, [currentPage]);

  const removeBookmark = useCallback((index: number) => {
    setBookmarks(prev => prev.filter((_, i) => i !== index));
    toast.success("Bookmark removed");
  }, []);

  // File handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file");
      return;
    }

    setFile(f);
    setPassword("");
    setIsLocked(false);
    setCurrentPage(1);
    setPdfDocument(null);
    setRotation(0);
    setPageInput("");
    setUnlockPassword("");
    setBookmarks([]);
    setSearchResults([]);
    setPageCache({});

    loadPdf(f);
  };

  const loadPdf = async (pdfFile: File, pwd?: string) => {
    setLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();

      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
        password: pwd,
        useWorkerFetch: true,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;

      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setIsLocked(false);
      setShowPasswordDialog(false);

      if (pwd) {
        setUnlockPassword(pwd);
        toast.success(`PDF unlocked - ${pdf.numPages} pages loaded`);
      } else {
        setUnlockPassword("");
        toast.success(`PDF loaded - ${pdf.numPages} pages`);
      }

      // Load metadata
      try {
        const meta = await pdf.getMetadata();
        setMetadata(meta);
      } catch (err) {
        console.warn("Could not load metadata");
      }
    } catch (err: any) {
      console.error("PDF load error:", err);
      if (err?.message?.toLowerCase().includes("password") || err?.name === "PasswordException") {
        setIsLocked(true);
        setShowPasswordDialog(true);
      } else {
        toast.error("Failed to load PDF");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    if (file) loadPdf(file, password);
  };

  // Navigation
  const goToPage = useCallback((page: number) => {
    if (pdfDocument && page >= 1 && page <= totalPages) {
      if (viewMode === "single") {
        renderPage(pdfDocument, page, true);
      } else {
        setCurrentPage(page);
        // Scroll to page in scroll view
        if (containerRef.current && scrollCanvasRef.current) {
          const pageHeight = scrollCanvasRef.current.height / totalPages;
          const scrollTo = (page - 1) * pageHeight;
          containerRef.current.scrollTop = scrollTo;
        }
      }
      setPageInput("");
    }
  }, [pdfDocument, totalPages, viewMode, renderPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Zoom controls - INSTANT using CSS transform (NO re-rendering)
  const zoomIn = useCallback(() => {
    setDisplayScale(prev => Math.min(prev + 0.25, 5));
    setFitMode("custom");
  }, []);

  const zoomOut = useCallback(() => {
    setDisplayScale(prev => Math.max(prev - 0.25, 0.25));
    setFitMode("custom");
  }, []);

  const handleRotate = useCallback(() => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    // Apply rotation immediately to base and trigger re-render
    setBaseRotation(newRotation);
    if (pdfDocument) {
      if (viewMode === "single") {
        renderPage(pdfDocument, currentPage, true);
      } else if (viewMode === "scroll") {
        renderScrollView(pdfDocument);
      } else if (viewMode === "grid") {
        renderGridView(pdfDocument);
      }
    }
  }, [rotation, pdfDocument, viewMode, currentPage, renderPage, renderScrollView, renderGridView]);

  // Fullscreen toggle with cross-browser support
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Extract text
  const handleExtractText = async () => {
    if (!pdfDocument) return;

    try {
      let allText = "";
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        allText += `\n========== Page ${i} ==========\n${pageText}\n`;
      }
      setExtractedText(allText);
      setShowTextDialog(true);
      toast.success("Text extracted successfully");
    } catch (err) {
      console.error("Text extraction error:", err);
      toast.error("Failed to extract text");
    }
  };

  // Export functionality
  const handleExportPdf = async () => {
    if (!file) return;

    if (exportOption === "encrypt" && !exportPassword) {
      toast.error("Please enter a password");
      return;
    }

    setExporting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadOptions: any = unlockPassword ? { password: unlockPassword } : {};
      const pdfDoc = await PDFDocument.load(arrayBuffer, loadOptions);

      if (exportOption === "decrypt") {
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(".pdf", "_decrypted.pdf");
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF exported without encryption");
      } else {
        if (typeof (pdfDoc as any).encrypt === 'function') {
          await (pdfDoc as any).encrypt({
            userPassword: exportPassword,
            ownerPassword: exportPassword,
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name.replace(".pdf", "_encrypted.pdf");
          a.click();
          URL.revokeObjectURL(url);
          toast.success("PDF encrypted successfully");
        } else {
          toast.error("Encryption not supported for this PDF");
        }
      }
      setShowExportDialog(false);
      setExportPassword("");
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Export failed: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("PDF downloaded");
  };

  const handlePrint = () => {
    if (!file) return;
    const printWindow = window.open(URL.createObjectURL(file));
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  // Listen for fullscreen changes (Esc key support)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Effect for baseRotation, fitMode, theme changes - NOT for zoom (baseScale)
  useEffect(() => {
    if (!pdfDocument || rendering) return;

    const timer = setTimeout(() => {
      if (viewMode === "single" && canvasRef.current) {
        renderPage(pdfDocument, currentPage, true);
      } else if (viewMode === "scroll" && scrollCanvasRef.current) {
        renderScrollView(pdfDocument);
      } else if (viewMode === "grid" && scrollCanvasRef.current) {
        renderGridView(pdfDocument);
      }
    }, 150);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRotation, fitMode, theme]); // Removed baseScale - zoom is CSS only!

  // Effect for initial render when PDF loads or view mode changes
  useEffect(() => {
    if (!pdfDocument) return;

    // Force initial render even if rendering flag is set
    const timer = setTimeout(() => {
      if (viewMode === "single" && canvasRef.current) {
        renderPage(pdfDocument, currentPage, true);
      } else if (viewMode === "scroll" && scrollCanvasRef.current) {
        renderScrollView(pdfDocument);
      } else if (viewMode === "grid" && scrollCanvasRef.current) {
        renderGridView(pdfDocument);
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocument, viewMode, currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfDocument || e.target instanceof HTMLInputElement) return;

      if (viewMode === "single") {
        switch (e.key) {
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            goToPrevPage();
            break;
          case "ArrowRight":
          case "ArrowDown":
          case " ":
            e.preventDefault();
            goToNextPage();
            break;
          case "Home":
            e.preventDefault();
            goToPage(1);
            break;
          case "End":
            e.preventDefault();
            goToPage(totalPages);
            break;
        }
      }

      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "r":
        case "R":
          e.preventDefault();
          handleRotate();
          break;
        case "Escape":
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "f":
        case "F":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSearchDialog(true);
          }
          break;
        case "b":
        case "B":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            addBookmark();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfDocument, currentPage, viewMode, totalPages, isFullscreen, goToNextPage, goToPrevPage, goToPage, zoomIn, zoomOut, handleRotate, toggleFullscreen, addBookmark]);

  // Mouse wheel zoom - INSTANT with CSS transform
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const zoomSpeed = 0.1;

        setDisplayScale(prev => {
          const newScale = delta < 0
            ? Math.min(prev + zoomSpeed, 5)
            : Math.max(prev - zoomSpeed, 0.25);

          return newScale;
        });
        setFitMode("custom");
      }
    };

    const container = containerRef.current;
    if (container && pdfDocument) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [pdfDocument]);

  // Pinch zoom for mobile
  useEffect(() => {
    const getTouchDistance = (touches: TouchList): number => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        setLastTouchDistance(getTouchDistance(e.touches));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistance !== null) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        const delta = distance - lastTouchDistance;
        const zoomSpeed = 0.005;
        setDisplayScale(prev => {
          const newScale = Math.max(0.25, Math.min(5, prev + (delta * zoomSpeed)));

          return newScale;
        });
        setLastTouchDistance(distance);
        setFitMode("custom");
      }
    };

    const handleTouchEnd = () => setLastTouchDistance(null);

    const container = containerRef.current;
    if (container && pdfDocument) {
      container.addEventListener("touchstart", handleTouchStart, { passive: false });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      container.addEventListener("touchend", handleTouchEnd);
      return () => {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [pdfDocument, lastTouchDistance]);

  return (
    <AnimatedElement className="space-y-6">
      <TooltipProvider>
        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Protected PDF
              </DialogTitle>
              <DialogDescription>
                This PDF requires a password to view its contents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-password">Password</Label>
                <div className="relative">
                  <Input
                    id="pdf-password"
                    type={showPasswordField ? "text" : "password"}
                    placeholder="Enter PDF password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                    autoFocus
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswordField(!showPasswordField)}
                  >
                    {showPasswordField ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
              <Button onClick={handlePasswordSubmit} disabled={!password}>Unlock PDF</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search Dialog */}
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search in PDF
              </DialogTitle>
              <DialogDescription>
                Find text across all pages
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter search term..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {searchResults.length} result(s) found
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
                          setCurrentSearchIndex(newIndex);
                          goToPage(searchResults[newIndex].page);
                        }}
                        disabled={searchResults.length === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        {currentSearchIndex + 1} / {searchResults.length}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newIndex = (currentSearchIndex + 1) % searchResults.length;
                          setCurrentSearchIndex(newIndex);
                          goToPage(searchResults[newIndex].page);
                        }}
                        disabled={searchResults.length === 0}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-auto border rounded-lg">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentSearchIndex(idx);
                          goToPage(result.page);
                        }}
                        className={`w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0 ${idx === currentSearchIndex ? "bg-muted" : ""
                          }`}
                      >
                        <div className="font-medium text-sm">Page {result.page}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          ...{result.text}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Export PDF
              </DialogTitle>
              <DialogDescription>
                Encrypt or decrypt your PDF document
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>Export Option</Label>
                <div className="grid gap-2">
                  <button
                    onClick={() => setExportOption("decrypt")}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${exportOption === "decrypt" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 mt-0.5" />
                      <div>
                        <div className="font-medium">Remove Protection</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Create unencrypted copy
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setExportOption("encrypt")}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${exportOption === "encrypt" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 mt-0.5" />
                      <div>
                        <div className="font-medium">Add Protection (Experimental)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Encrypt with password
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              {exportOption === "encrypt" && (
                <div className="space-y-2">
                  <Label htmlFor="export-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="export-password"
                      type={showExportPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowExportPassword(!showExportPassword)}
                    >
                      {showExportPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button
                onClick={handleExportPdf}
                disabled={exporting || (exportOption === "encrypt" && !exportPassword)}
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Text Dialog */}
        <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileType className="h-5 w-5" />
                Extracted Text
              </DialogTitle>
              <DialogDescription>
                Full text content from the PDF
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="max-h-[50vh] overflow-auto border rounded-lg p-4 bg-muted/30 text-sm font-mono whitespace-pre-wrap">
                {extractedText || "No text found"}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTextDialog(false)}>Close</Button>
              <Button onClick={() => {
                navigator.clipboard.writeText(extractedText);
                toast.success("Text copied");
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Metadata Dialog */}
        <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                PDF Metadata
              </DialogTitle>
              <DialogDescription>Document information</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {metadata?.info ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(metadata.info).map(([key, value]: [string, any]) =>
                    value ? (
                      <React.Fragment key={key}>
                        <div className="font-medium">{key}:</div>
                        <div className="text-muted-foreground">{String(value)}</div>
                      </React.Fragment>
                    ) : null
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No metadata available
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Viewer Settings
              </DialogTitle>
              <DialogDescription>Customize your viewing experience</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>Render Quality</Label>
                <Select value={renderQuality} onValueChange={(v) => setRenderQuality(v as RenderQuality)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Default)</SelectItem>
                    <SelectItem value="ultra">Ultra (Slower)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cache">Enable Page Caching</Label>
                <Switch id="cache" checked={enableCaching} onCheckedChange={setEnableCaching} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smooth">Smooth Scrolling</Label>
                <Switch id="smooth" checked={enableSmoothScrolling} onCheckedChange={setEnableSmoothScrolling} />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main UI */}
        <div className="border rounded-lg p-6 bg-gradient-to-br from-muted/40 to-muted/20 space-y-6">
          <div className="flex items-start justify-between">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1 text-lg">📄 Advanced PDF Viewer</p>
              <p>Professional PDF viewer with advanced features and optimizations</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Upload PDF</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
          </div>

          {file && (
            <>
              {/* File Info Card */}
              <div className="space-y-3 border rounded-lg p-4 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur shadow-sm">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate flex items-center gap-2 flex-wrap">
                      <span className="truncate">{file.name}</span>
                      {isLocked ? (
                        <Badge variant="destructive" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Encrypted
                        </Badge>
                      ) : pdfDocument ? (
                        <Badge variant="secondary" className="text-xs">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Unlocked
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      {totalPages > 0 && (
                        <>
                          <span>•</span>
                          <span>{totalPages} pages</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {pdfDocument && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setShowMetadataDialog(true)}>
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Metadata</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleExtractText}>
                          <FileType className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Extract Text</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setShowSearchDialog(true)}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Search (Ctrl+F)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={addBookmark}>
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add Bookmark (Ctrl+B)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                          <Shield className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Encrypt/Decrypt</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Print</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>

              {pdfDocument && (
                <>
                  {/* Bookmarks Sidebar */}
                  {bookmarks.length > 0 && (
                    <div className="border rounded-lg p-3 bg-background/60">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Bookmarks ({bookmarks.length})</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSidebar(!showSidebar)}
                        >
                          {showSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </div>
                      {showSidebar && (
                        <div className="space-y-1 max-h-32 overflow-auto">
                          {bookmarks.map((bookmark, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 hover:bg-muted rounded text-sm"
                            >
                              <button
                                onClick={() => goToPage(bookmark.page)}
                                className="flex-1 text-left"
                              >
                                {bookmark.label}
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBookmark(idx)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Mode Selection */}
                  <div className="flex items-center gap-2 border rounded-lg p-3 bg-background/60">
                    <Label className="text-sm font-medium">View:</Label>
                    <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Single Page
                          </div>
                        </SelectItem>
                        <SelectItem value="scroll">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Scroll View
                          </div>
                        </SelectItem>
                        <SelectItem value="grid">
                          <div className="flex items-center gap-2">
                            <Grid3x3 className="h-4 w-4" />
                            Grid View
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Navigation Controls */}
                  {viewMode === "single" && (
                    <div className="flex items-center justify-between gap-4 border rounded-lg p-3 bg-background/60 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(1)}
                              disabled={currentPage <= 1 || rendering}
                            >
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>First Page</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPrevPage}
                              disabled={currentPage <= 1 || rendering}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Previous</TooltipContent>
                        </Tooltip>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const page = parseInt(pageInput);
                            if (!isNaN(page)) goToPage(page);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Input
                            type="text"
                            value={pageInput}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d+$/.test(value)) {
                                setPageInput(value);
                              }
                            }}
                            placeholder={currentPage.toString()}
                            className="w-16 h-9 text-center"
                            disabled={rendering}
                          />
                          <span className="text-sm font-medium text-muted-foreground">
                            / {totalPages}
                          </span>
                        </form>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextPage}
                              disabled={currentPage >= totalPages || rendering}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Next</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage >= totalPages || rendering}
                            >
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Last Page</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )}

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2 border rounded-lg p-3 bg-background/60 flex-wrap">
                    <Label className="text-sm font-medium">Display:</Label>

                    <Select value={fitMode} onValueChange={(v) => setFitMode(v as FitMode)}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="width">Fit Width</SelectItem>
                        <SelectItem value="auto">Auto Fit</SelectItem>
                        {viewMode === "single" && <SelectItem value="page">Fit Page</SelectItem>}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 border rounded-md">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={zoomOut}
                            disabled={displayScale <= 0.25 || rendering}
                            className="h-9"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom Out (-)</TooltipContent>
                      </Tooltip>

                      <span className="text-sm font-medium min-w-[50px] text-center px-2">
                        {Math.round(displayScale * 100)}%
                      </span>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={zoomIn}
                            disabled={displayScale >= 5 || rendering}
                            className="h-9"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom In (+)</TooltipContent>
                      </Tooltip>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRotate}
                          disabled={rendering}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Rotate (R)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPageCache({});
                            if (viewMode === "single") {
                              renderPage(pdfDocument, currentPage, true);
                            } else if (viewMode === "scroll") {
                              renderScrollView(pdfDocument);
                            } else {
                              renderGridView(pdfDocument);
                            }
                          }}
                          disabled={rendering}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Fullscreen Toggle Button */}
                  <div className="flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleFullscreen}
                        >
                          <Maximize2 className="h-4 w-4 mr-2" />
                          Fullscreen
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Enter fullscreen mode</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* PDF Canvas */}
                  <div className="space-y-2">
                    <div
                      ref={containerRef}
                      className={`relative border rounded-lg overflow-auto flex justify-center items-start shadow-inner ${isFullscreen ? "p-0" : "p-4"
                        }`}
                      style={{
                        maxHeight: isFullscreen ? "100vh" : "75vh",
                        backgroundColor: themeColors.bg
                      }}
                    >
                      {/* Google Drive Style Fullscreen Toolbar */}
                      {isFullscreen && pdfDocument && (
                        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/98 backdrop-blur-lg border-b border-gray-700/50 shadow-2xl">
                          <div className="flex items-center justify-between px-6 py-3 gap-4">
                            {/* Left: PDF Name & Info */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <FileText className="h-6 w-6 text-blue-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white truncate">{file?.name}</h3>
                                <p className="text-xs text-gray-400">
                                  {viewMode === "single" ? `Page ${currentPage} of ${totalPages}` : `${totalPages} pages`}
                                </p>
                              </div>
                            </div>

                            {/* Center: Navigation (Single Page Mode Only) */}
                            {viewMode === "single" && (
                              <div className="hidden md:flex items-center gap-2 bg-gray-800/60 rounded-lg px-4 py-2 border border-gray-700/50">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => goToPage(1)}
                                  disabled={currentPage <= 1 || rendering}
                                  className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={goToPrevPage}
                                  disabled={currentPage <= 1 || rendering}
                                  className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-300 px-3 min-w-[80px] text-center">
                                  {currentPage} / {totalPages}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={goToNextPage}
                                  disabled={currentPage >= totalPages || rendering}
                                  className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => goToPage(totalPages)}
                                  disabled={currentPage >= totalPages || rendering}
                                  className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  <ChevronsRight className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {/* Center-Right: Zoom Controls */}
                            <div className="hidden lg:flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={zoomOut}
                                disabled={displayScale <= 0.25 || rendering}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <ZoomOut className="h-4 w-4" />
                              </Button>
                              <span className="text-xs font-medium text-gray-300 min-w-[50px] text-center">
                                {Math.round(displayScale * 100)}%
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={zoomIn}
                                disabled={displayScale >= 5 || rendering}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSearchDialog(true)}
                                    className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                  >
                                    <Search className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Search (Ctrl+F)</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRotate}
                                    disabled={rendering}
                                    className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                  >
                                    <RotateCw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rotate</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Print</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDownload}
                                    className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download</TooltipContent>
                              </Tooltip>

                              <div className="w-px h-6 bg-gray-700 mx-2"></div>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleFullscreen}
                                    className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                  >
                                    <Minimize2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Exit Fullscreen (Esc)</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rendering Indicator */}
                      {rendering && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg"
                          style={{ marginTop: isFullscreen ? '60px' : '0' }}
                        >
                          <div className="flex flex-col items-center gap-3 p-6 bg-background/90 rounded-lg shadow-lg border">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium">
                              {viewMode === "grid" ? "Rendering thumbnails..." : "Rendering..."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Canvas Container */}
                      <div className={isFullscreen ? "pt-16 w-full flex justify-center items-start" : "w-full flex justify-center items-start"}>
                        {viewMode === "single" ? (
                          <canvas
                            ref={canvasRef}
                            className="shadow-2xl rounded-sm"
                            style={{
                              backgroundColor: themeColors.canvas,
                              transform: `scale(${displayScale / baseScale}) rotate(${rotation - baseRotation}deg)`,
                              transformOrigin: 'center center',
                              transition: 'none', // No transition for instant feedback
                              willChange: 'transform',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <canvas
                            ref={scrollCanvasRef}
                            className="shadow-2xl rounded-sm"
                            style={{
                              backgroundColor: themeColors.canvas,
                              transform: `scale(${displayScale / baseScale})`,
                              transformOrigin: 'center top',
                              transition: 'none',
                              willChange: 'transform',
                              display: 'block'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <details className="text-xs text-muted-foreground border rounded-lg p-3 bg-gradient-to-r from-background/40 to-background/20">
                    <summary className="cursor-pointer font-medium hover:text-foreground transition-colors">
                      ⌨️ Keyboard Shortcuts & Gestures
                    </summary>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border rounded text-xs font-mono">Ctrl+F</kbd>
                        <span>Search</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border rounded text-xs font-mono">Ctrl+B</kbd>
                        <span>Bookmark</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border rounded text-xs font-mono">+/-</kbd>
                        <span>Zoom</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border rounded text-xs font-mono">R</kbd>
                        <span>Rotate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border rounded text-xs font-mono">←/→</kbd>
                        <span>Navigate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border rounded text-xs font-mono">Ctrl+Scroll</kbd>
                        <span>Zoom</span>
                      </div>
                    </div>
                  </details>
                </>
              )}

              {loading && !pdfDocument && (
                <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-muted/50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium">Loading PDF...</p>
                    <p className="text-sm text-muted-foreground">Processing your document</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Privacy Notice */}
          <div className="text-xs p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-start gap-3 shadow-sm">
            <span className="text-lg">🔒</span>
            <div>
              <p className="font-semibold mb-1 text-foreground">Privacy & Security</p>
              <p className="text-muted-foreground leading-relaxed">
                All processing happens locally in your browser. Files never leave your device. Encryption is client-side for maximum privacy.
              </p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AnimatedElement>
  );
};

export default PdfViewer;