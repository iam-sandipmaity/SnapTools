import { useRef, useState, useEffect } from "react";
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
  FileUp
} from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import * as pdfjs from "pdfjs-dist";
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

type FitMode = "page" | "width" | "custom";
type ViewMode = "single" | "scroll";

const PdfViewer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>("custom");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [pageInput, setPageInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-render page when scale or rotation changes
  useEffect(() => {
    if (pdfDocument && currentPage) {
      if (viewMode === "single") {
        renderPage(pdfDocument, currentPage);
      } else {
        renderAllPages(pdfDocument);
      }
    }
  }, [scale, rotation]);

  // Re-render when view mode changes
  useEffect(() => {
    if (pdfDocument) {
      if (viewMode === "scroll") {
        renderAllPages(pdfDocument);
      } else {
        renderPage(pdfDocument, currentPage);
      }
    }
  }, [viewMode]);

  // Initial render when PDF document is loaded
  useEffect(() => {
    if (pdfDocument && !rendering && !loading) {
      // Use setTimeout to ensure canvas is mounted in DOM
      const timer = setTimeout(() => {
        if (viewMode === "single" && canvasRef.current) {
          renderPage(pdfDocument, currentPage);
        } else if (viewMode === "scroll" && scrollCanvasRef.current) {
          renderAllPages(pdfDocument);
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [pdfDocument]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfDocument) return;

      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement) return;

      // Navigation only works in single page mode
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
            goToFirstPage();
            break;
          case "End":
            e.preventDefault();
            goToLastPage();
            break;
        }
      } else if (viewMode === "scroll") {
        // Scroll view: arrow keys scroll the container
        if (!containerRef.current) return;
        
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            containerRef.current.scrollBy({ top: -100, behavior: 'smooth' });
            break;
          case "ArrowDown":
          case " ":
            e.preventDefault();
            containerRef.current.scrollBy({ top: 100, behavior: 'smooth' });
            break;
          case "PageUp":
            e.preventDefault();
            containerRef.current.scrollBy({ top: -containerRef.current.clientHeight * 0.9, behavior: 'smooth' });
            break;
          case "PageDown":
            e.preventDefault();
            containerRef.current.scrollBy({ top: containerRef.current.clientHeight * 0.9, behavior: 'smooth' });
            break;
          case "Home":
            e.preventDefault();
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case "End":
            e.preventDefault();
            containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
            break;
        }
      }

      // Zoom and rotate work in both modes
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfDocument, currentPage, scale, rotation, viewMode]);

  /* ================= Upload ================= */

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

    loadPdf(f);
  };

  /* ================= Load PDF ================= */

  const loadPdf = async (pdfFile: File, pwd?: string) => {
    setLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();

      const pdf = await pdfjs
        .getDocument({
          data: arrayBuffer,
          password: pwd,
        })
        .promise;

      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setIsLocked(false);
      setShowPasswordDialog(false);
      
      if (pwd) {
        toast.success(`PDF unlocked - ${pdf.numPages} page(s) loaded`);
      } else {
        toast.success(`PDF loaded - ${pdf.numPages} page(s)`);
      }
    } catch (err: any) {
      console.error("PDF load error:", err);
      if (
        err?.message?.toLowerCase().includes("password") ||
        err?.name === "PasswordException"
      ) {
        setIsLocked(true);
        setShowPasswordDialog(true);
      } else {
        toast.error("Failed to load PDF");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= Render Page ================= */

  const renderPage = async (pdf: any, pageNum: number) => {
    if (rendering) return; // Prevent concurrent renders
    
    setRendering(true);
    try {
      if (!canvasRef.current || !containerRef.current) {
        console.warn("Canvas or container ref not ready");
        setRendering(false);
        return;
      }

      const page = await pdf.getPage(pageNum);
      
      // Calculate scale based on fit mode
      let displayScale = scale;
      if (fitMode === "width") {
        const containerWidth = containerRef.current.clientWidth - 32; // padding
        const viewport = page.getViewport({ scale: 1, rotation });
        displayScale = containerWidth / viewport.width;
      } else if (fitMode === "page") {
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = containerRef.current.clientHeight - 32;
        const viewport = page.getViewport({ scale: 1, rotation });
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        displayScale = Math.min(scaleX, scaleY);
      }

      const viewport = page.getViewport({ scale: displayScale, rotation });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        console.error("Failed to get canvas context");
        toast.error("Failed to get canvas context");
        setRendering(false);
        return;
      }

      // Use device pixel ratio for sharp rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      const outputWidth = viewport.width * devicePixelRatio;
      const outputHeight = viewport.height * devicePixelRatio;
      
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Reset transform and clear canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, outputWidth, outputHeight);
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      // Apply device pixel ratio
      ctx.scale(devicePixelRatio, devicePixelRatio);

      // Render page
      await page.render({
        canvasContext: ctx,
        viewport,
        intent: 'display',
      }).promise;

      setCurrentPage(pageNum);
    } catch (err: any) {
      console.error("Page render error:", err);
      toast.error("Failed to render page");
    } finally {
      setRendering(false);
    }
  };

  /* ================= Render All Pages (Scroll View) ================= */

  const renderAllPages = async (pdf: any) => {
    if (rendering) return; // Prevent concurrent renders
    
    setRendering(true);
    try {
      if (!scrollCanvasRef.current || !containerRef.current) {
        console.warn("Scroll canvas or container ref not ready");
        setRendering(false);
        return;
      }

      const canvas = scrollCanvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        console.error("Failed to get canvas context");
        toast.error("Failed to get canvas context");
        setRendering(false);
        return;
      }

      // Calculate scale based on fit mode for scroll view
      let displayScale = scale;
      if (fitMode === "width") {
        const containerWidth = containerRef.current.clientWidth - 32;
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1, rotation });
        displayScale = containerWidth / viewport.width;
      }

      // Calculate total height and max width for all pages
      let totalHeight = 0;
      let maxWidth = 0;
      const pageData: Array<{ viewport: any; height: number; yOffset: number }> = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: displayScale, rotation });
        const yOffset = totalHeight;
        pageData.push({ viewport, height: viewport.height, yOffset });
        totalHeight += viewport.height + 10; // 10px gap between pages
        maxWidth = Math.max(maxWidth, viewport.width);
      }

      // Use device pixel ratio for sharp rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      const outputWidth = maxWidth * devicePixelRatio;
      const outputHeight = totalHeight * devicePixelRatio;
      
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${totalHeight}px`;

      // Reset transform and clear canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, outputWidth, outputHeight);

      // Fill background
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      
      // Apply device pixel ratio
      ctx.scale(devicePixelRatio, devicePixelRatio);

      // Render all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const { viewport, yOffset } = pageData[i - 1];

        // Create temp canvas for this page
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d", { alpha: false })!;
        tempCanvas.width = viewport.width * devicePixelRatio;
        tempCanvas.height = viewport.height * devicePixelRatio;
        
        tempCtx.scale(devicePixelRatio, devicePixelRatio);

        // Render page to temp canvas
        await page.render({
          canvasContext: tempCtx,
          viewport,
          intent: 'display',
        }).promise;

        // Draw white background for page
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, yOffset, viewport.width, viewport.height);

        // Draw page to main canvas
        ctx.drawImage(tempCanvas, 0, yOffset, viewport.width, viewport.height);

        // Add page separator
        if (i < pdf.numPages) {
          ctx.fillStyle = "#e0e0e0";
          ctx.fillRect(0, yOffset + viewport.height, maxWidth, 10);
        }
      }

      toast.success(`All ${pdf.numPages} pages rendered`);
    } catch (err: any) {
      console.error("Scroll render error:", err);
      toast.error("Failed to render all pages");
    } finally {
      setRendering(false);
    }
  };

  /* ================= Password Dialog Submit ================= */

  const handlePasswordSubmit = () => {
    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (file) {
      loadPdf(file, password);
    }
  };

  /* ================= Navigation ================= */

  const goToNextPage = () => {
    if (pdfDocument && currentPage < totalPages) {
      renderPage(pdfDocument, currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (pdfDocument && currentPage > 1) {
      renderPage(pdfDocument, currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    if (pdfDocument && currentPage !== 1) {
      renderPage(pdfDocument, 1);
    }
  };

  const goToLastPage = () => {
    if (pdfDocument && currentPage !== totalPages) {
      renderPage(pdfDocument, totalPages);
    }
  };

  const goToPage = (page: number) => {
    if (pdfDocument && page >= 1 && page <= totalPages) {
      renderPage(pdfDocument, page);
      setPageInput("");
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page);
    } else {
      toast.error(`Please enter a page number between 1 and ${totalPages}`);
      setPageInput("");
    }
  };

  /* ================= Zoom & Rotation ================= */

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 5));
    setFitMode("custom");
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
    setFitMode("custom");
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitModeChange = (mode: FitMode) => {
    setFitMode(mode);
    if (pdfDocument) {
      if (viewMode === "scroll") {
        renderAllPages(pdfDocument);
      } else {
        renderPage(pdfDocument, currentPage);
      }
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  /* ================= Print ================= */

  const handlePrint = () => {
    if (!file) return;
    
    const printWindow = window.open(URL.createObjectURL(file));
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  /* ================= Download ================= */

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

  /* ================= Export PDF ================= */



  /* ================= UI ================= */

  return (
    <AnimatedElement className="space-y-6">
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Protected PDF
            </DialogTitle>
            <DialogDescription>
              This PDF is password protected. Please enter the password to view it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-password">Password</Label>
              <Input
                id="pdf-password"
                type="password"
                placeholder="Enter PDF password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={!password}>
              Unlock PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <div className="border rounded-lg p-6 bg-muted/40 space-y-6">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1 text-lg">📄 PDF Viewer</p>
          <p>View and navigate PDF files with zoom, rotation, and keyboard shortcuts.</p>
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
            {/* File Info */}
            <div className="flex items-center justify-between gap-3 border rounded-lg p-4 bg-background/60 backdrop-blur">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {totalPages > 0 && (
                      <>
                        <span>•</span>
                        <span>{totalPages} page{totalPages > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {pdfDocument && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint} title="Print PDF">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {pdfDocument && (
              <>
                {/* Enhanced Controls */}
                <div className="space-y-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2 border rounded-lg p-3 bg-background/60 backdrop-blur">
                    <Label className="text-sm font-medium">View Mode:</Label>
                    <Select value={viewMode} onValueChange={(value) => handleViewModeChange(value as ViewMode)}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Page</SelectItem>
                        <SelectItem value="scroll">Scroll View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Navigation Controls - Only show in single page mode */}
                  {viewMode === "single" && (
                    <div className="flex items-center justify-between gap-4 border rounded-lg p-3 bg-background/60 backdrop-blur flex-wrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={currentPage <= 1 || rendering}
                        title="First page (Home)"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <ChevronLeft className="h-4 w-4 -ml-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage <= 1 || rendering}
                        title="Previous page (← or ↑)"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Page Input */}
                      <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={pageInput}
                          onChange={handlePageInputChange}
                          placeholder={currentPage.toString()}
                          className="w-16 h-9 text-center"
                          disabled={rendering}
                        />
                        <span className="text-sm font-medium text-muted-foreground">
                          of {totalPages}
                        </span>
                      </form>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages || rendering}
                        title="Next page (→ or ↓)"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={currentPage >= totalPages || rendering}
                        title="Last page (End)"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <ChevronRight className="h-4 w-4 -ml-3" />
                      </Button>
                    </div>
                  </div>
                  )}

                  {/* Zoom and Fit Controls */}
                  <div className="flex items-center gap-2 border rounded-lg p-3 bg-background/60 backdrop-blur flex-wrap">
                    <Label className="text-sm font-medium">Display:</Label>
                    
                    <Select value={fitMode} onValueChange={(value) => handleFitModeChange(value as FitMode)}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="width">Fit Width</SelectItem>
                        {viewMode === "single" && <SelectItem value="page">Fit Page</SelectItem>}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={zoomOut}
                        disabled={scale <= 0.25 || rendering}
                        title="Zoom out (-)"
                        className="h-9"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[50px] text-center px-2">
                        {Math.round(scale * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={zoomIn}
                        disabled={scale >= 5 || rendering}
                        title="Zoom in (+)"
                        className="h-9"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotate}
                      disabled={rendering}
                      title="Rotate 90° (R)"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
                      title="Toggle fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Keyboard Shortcuts Info */}
                  <details className="text-xs text-muted-foreground border rounded-lg p-3 bg-background/40">
                    <summary className="cursor-pointer font-medium">⌨️ Keyboard Shortcuts</summary>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {viewMode === "single" ? (
                        <>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">←/↑</kbd> Previous page</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">→/↓</kbd> Next page</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">Home</kbd> First page</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">End</kbd> Last page</div>
                        </>
                      ) : (
                        <>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd> Scroll up</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd> Scroll down</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">PgUp</kbd> Page up</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">PgDn</kbd> Page down</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">Home</kbd> Scroll to top</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">End</kbd> Scroll to bottom</div>
                        </>
                      )}
                      <div><kbd className="px-1.5 py-0.5 bg-muted rounded">+</kbd> Zoom in</div>
                      <div><kbd className="px-1.5 py-0.5 bg-muted rounded">-</kbd> Zoom out</div>
                      <div><kbd className="px-1.5 py-0.5 bg-muted rounded">R</kbd> Rotate</div>
                    </div>
                  </details>
                </div>

                {/* PDF Canvas */}
                <div className="space-y-2">
                  <div 
                    ref={containerRef}
                    className="relative border rounded-lg overflow-auto bg-gradient-to-br from-muted/30 to-muted/60 flex justify-center items-start p-4"
                    style={{ minHeight: "500px", maxHeight: "70vh" }}
                  >
                    {rendering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">
                            {viewMode === "scroll" ? "Rendering all pages..." : "Rendering page..."}
                          </p>
                        </div>
                      </div>
                    )}
                    {viewMode === "single" ? (
                      <canvas
                        ref={canvasRef}
                        className="shadow-2xl bg-white"
                      />
                    ) : (
                      <canvas
                        ref={scrollCanvasRef}
                        className="shadow-2xl bg-white"
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {loading && !pdfDocument && (
              <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-muted/50">
                <div className="flex flex-col items-center text-muted-foreground gap-3">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg font-medium">Loading PDF...</p>
                  <p className="text-sm">Please wait while we process your file</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-start gap-2">
          <span>🔒</span>
          <div>
            <p className="font-medium mb-1">Privacy & Security</p>
            <p className="text-muted-foreground">All processing happens locally in your browser. Your PDF files never leave your device and are not uploaded to any server.</p>
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
};

export default PdfViewer;
