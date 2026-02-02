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
  FileUp,
  Eye,
  EyeOff,
  Info,
  FileType,
  Copy,
  Shield,
  ShieldCheck,
  ShieldAlert
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { PDFDocument } from "pdf-lib-with-encrypt";

type FitMode = "page" | "width" | "custom";
type ViewMode = "single" | "scroll";

const PdfViewer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState<string>(""); // Store the password used to unlock
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
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOption, setExportOption] = useState<"decrypt" | "encrypt">("decrypt");
  const [exportPassword, setExportPassword] = useState("");
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

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
    setUnlockPassword("");

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
      
      // Store the unlock password for later use in export operations
      if (pwd) {
        setUnlockPassword(pwd);
        toast.success(`PDF unlocked - ${pdf.numPages} page(s) loaded`);
      } else {
        setUnlockPassword("");
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

  const handleExtractText = async () => {
    if (!pdfDocument) return;
    
    try {
      let allText = "";
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        allText += `\n--- Page ${i} ---\n${pageText}\n`;
      }
      setExtractedText(allText);
      setShowTextDialog(true);
      toast.success("Text extracted successfully");
    } catch (err) {
      console.error("Text extraction error:", err);
      toast.error("Failed to extract text");
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Text copied to clipboard");
  };

  const handleViewMetadata = async () => {
    if (!pdfDocument) return;
    
    try {
      const meta = await pdfDocument.getMetadata();
      setMetadata(meta);
      setShowMetadataDialog(true);
    } catch (err) {
      console.error("Metadata error:", err);
      toast.error("Failed to load metadata");
    }
  };

  const handleExportPdf = async () => {
    if (!file) return;
    
    if (exportOption === "encrypt" && !exportPassword) {
      toast.error("Please enter a password");
      return;
    }
    
    setExporting(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (exportOption === "decrypt") {
        // Decrypt mode: Just save without encryption
        
        // If the PDF was encrypted, provide the unlock password
        const loadOptions: any = {};
        if (unlockPassword) {
          loadOptions.password = unlockPassword;
        }
        
        const pdfDoc = await PDFDocument.load(arrayBuffer, loadOptions);
        
        const pdfBytes = await pdfDoc.save();
        
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(".pdf", "_decrypted.pdf");
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success("PDF exported without password protection");
        setShowExportDialog(false);
        setExportPassword("");
      } else {
        // Encrypt mode: Use pdf-lib-with-encrypt
        
        try {
          // If the PDF was encrypted, provide the unlock password
          const loadOptions: any = {};
          if (unlockPassword) {
            loadOptions.password = unlockPassword;
          }
          
          const pdfDoc = await PDFDocument.load(arrayBuffer, loadOptions);
          
          // Check if encrypt method exists
          if (typeof (pdfDoc as any).encrypt === 'function') {
            // Call encrypt before save
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
            
            toast.success("PDF encrypted successfully! Try opening it to verify the password works.");
            setShowExportDialog(false);
            setExportPassword("");
          } else {
            // Fallback: encrypt method not available
            console.warn("Encrypt method not available in pdf-lib");
            toast.error("Browser encryption not available. The library doesn't support encryption on this PDF.");
          }
        } catch (encryptErr: any) {
          console.error("Encryption error:", encryptErr);
          
          // Provide more helpful error messages
          if (encryptErr.message?.includes("encrypt")) {
            toast.error("Encryption failed: This PDF may use unsupported features. Try a different PDF or use a simpler one.");
          } else {
            toast.error("Encryption failed: " + (encryptErr.message || "Unknown error"));
          }
        }
      }
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Failed to process PDF: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };


  /* ================= UI ================= */

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
              This PDF is password protected. Please enter the password to view it.
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordSubmit();
                    }
                  }}
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
                  {showPasswordField ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
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

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Export PDF
            </DialogTitle>
            <DialogDescription>
              Remove password protection from encrypted PDFs or add basic password protection (experimental).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Export Option</Label>
              <div className="space-y-2">
                <button
                  onClick={() => setExportOption("decrypt")}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    exportOption === "decrypt"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 mt-0.5" />
                    <div>
                      <div className="font-medium">Remove Password Protection</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Create an unencrypted copy of the PDF
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setExportOption("encrypt")}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    exportOption === "encrypt"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 mt-0.5" />
                    <div>
                      <div className="font-medium">Add Password Protection (Experimental)</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Encrypt PDF with a password - May not work with all PDFs
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
                    {showExportPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {exportPassword && (
                  <div className="text-xs">
                    Strength: {exportPassword.length < 6 ? (
                      <span className="text-red-500">Weak</span>
                    ) : exportPassword.length < 10 ? (
                      <span className="text-yellow-500">Medium</span>
                    ) : (
                      <span className="text-green-500">Strong</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {exportOption === "encrypt" && (
              <div className="text-xs p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                <div className="text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">⚠️ Browser Encryption Limitations</p>
                  <p>Browser-based encryption has limited compatibility and may not work with all PDFs. For reliable encryption, download the encrypted PDF and test if it asks for a password when you open it. The decryption option is more reliable.</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
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
                  Export PDF
                </>
              )}
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
            <DialogDescription>
              Information about the PDF document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {metadata?.info && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {metadata.info.Title && (
                  <>
                    <div className="font-medium">Title:</div>
                    <div className="text-muted-foreground">{metadata.info.Title}</div>
                  </>
                )}
                {metadata.info.Author && (
                  <>
                    <div className="font-medium">Author:</div>
                    <div className="text-muted-foreground">{metadata.info.Author}</div>
                  </>
                )}
                {metadata.info.Subject && (
                  <>
                    <div className="font-medium">Subject:</div>
                    <div className="text-muted-foreground">{metadata.info.Subject}</div>
                  </>
                )}
                {metadata.info.Creator && (
                  <>
                    <div className="font-medium">Creator:</div>
                    <div className="text-muted-foreground">{metadata.info.Creator}</div>
                  </>
                )}
                {metadata.info.Producer && (
                  <>
                    <div className="font-medium">Producer:</div>
                    <div className="text-muted-foreground">{metadata.info.Producer}</div>
                  </>
                )}
                {metadata.info.CreationDate && (
                  <>
                    <div className="font-medium">Created:</div>
                    <div className="text-muted-foreground">
                      {new Date(metadata.info.CreationDate).toLocaleDateString()}
                    </div>
                  </>
                )}
                {metadata.info.ModDate && (
                  <>
                    <div className="font-medium">Modified:</div>
                    <div className="text-muted-foreground">
                      {new Date(metadata.info.ModDate).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            )}
            {(!metadata || !metadata.info || Object.keys(metadata.info).length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No metadata available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Text Extraction Dialog */}
      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileType className="h-5 w-5" />
              Extracted Text
            </DialogTitle>
            <DialogDescription>
              Text content from all pages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="max-h-[50vh] overflow-auto border rounded-lg p-4 bg-muted/30 text-sm font-mono whitespace-pre-wrap">
              {extractedText || "No text found"}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTextDialog(false)}>
              Close
            </Button>
            <Button onClick={handleCopyText}>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <div className="border rounded-lg p-6 bg-gradient-to-br from-muted/40 to-muted/20 space-y-6">
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
            <div className="space-y-3 border rounded-lg p-4 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur shadow-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate flex items-center gap-2 flex-wrap">
                    <span className="truncate">{file.name}</span>
                    {isLocked ? (
                      <Badge variant="destructive" className="text-xs flex-shrink-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    ) : pdfDocument ? (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
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
                        <span>{totalPages} page{totalPages > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {pdfDocument && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleViewMetadata} className="w-full">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Metadata</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleExtractText} className="w-full">
                        <FileType className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Extract Text</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)} className="w-full">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Encrypt/Decrypt</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handlePrint} className="w-full">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print PDF</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleDownload} className="w-full col-span-2 sm:col-span-1">
                        <Download className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Download</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToFirstPage}
                            disabled={currentPage <= 1 || rendering}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <ChevronLeft className="h-4 w-4 -ml-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>First page (Home)</TooltipContent>
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
                        <TooltipContent>Previous page (← or ↑)</TooltipContent>
                      </Tooltip>
                      
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
                        <TooltipContent>Next page (→ or ↓)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToLastPage}
                            disabled={currentPage >= totalPages || rendering}
                          >
                            <ChevronRight className="h-4 w-4" />
                            <ChevronRight className="h-4 w-4 -ml-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Last page (End)</TooltipContent>
                      </Tooltip>
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={zoomOut}
                            disabled={scale <= 0.25 || rendering}
                            className="h-9"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom out (-)</TooltipContent>
                      </Tooltip>
                      <span className="text-sm font-medium min-w-[50px] text-center px-2">
                        {Math.round(scale * 100)}%
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={zoomIn}
                            disabled={scale >= 5 || rendering}
                            className="h-9"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom in (+)</TooltipContent>
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
                      <TooltipContent>Rotate 90° (R)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle fullscreen</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Keyboard Shortcuts Info */}
                  <details className="text-xs text-muted-foreground border rounded-lg p-3 bg-gradient-to-r from-background/40 to-background/20">
                    <summary className="cursor-pointer font-medium hover:text-foreground transition-colors">⌨️ Keyboard Shortcuts</summary>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {viewMode === "single" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">←/↑</kbd>
                            <span>Previous</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">→/↓</kbd>
                            <span>Next</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">Home</kbd>
                            <span>First</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">End</kbd>
                            <span>Last</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">↑</kbd>
                            <span>Scroll up</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">↓</kbd>
                            <span>Scroll down</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">PgUp</kbd>
                            <span>Page up</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">PgDn</kbd>
                            <span>Page down</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">Home</kbd>
                            <span>Top</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">End</kbd>
                            <span>Bottom</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">+</kbd>
                        <span>Zoom in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">-</kbd>
                        <span>Zoom out</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono shadow-sm">R</kbd>
                        <span>Rotate</span>
                      </div>
                    </div>
                  </details>
                </div>

                {/* PDF Canvas */}
                <div className="space-y-2">
                  <div 
                    ref={containerRef}
                    className="relative border rounded-lg overflow-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex justify-center items-start p-4 shadow-inner"
                    style={{ minHeight: "500px", maxHeight: "70vh" }}
                  >
                    {rendering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg">
                        <div className="flex flex-col items-center gap-3 p-6 bg-background/80 rounded-lg shadow-lg border">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm font-medium">
                            {viewMode === "scroll" ? "Rendering all pages..." : "Rendering page..."}
                          </p>
                        </div>
                      </div>
                    )}
                    {viewMode === "single" ? (
                      <canvas
                        ref={canvasRef}
                        className="shadow-2xl bg-white rounded-sm"
                      />
                    ) : (
                      <canvas
                        ref={scrollCanvasRef}
                        className="shadow-2xl bg-white rounded-sm"
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

        <div className="text-xs p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-start gap-3 shadow-sm">
          <span className="text-lg">🔒</span>
          <div>
            <p className="font-semibold mb-1 text-foreground">Privacy & Security</p>
            <p className="text-muted-foreground leading-relaxed">
              All processing happens locally in your browser. Your PDF files never leave your device and are not uploaded to any server. Encryption is performed client-side for maximum privacy.
            </p>
          </div>
        </div>
      </div>
      </TooltipProvider>
    </AnimatedElement>
  );
};

export default PdfViewer;
