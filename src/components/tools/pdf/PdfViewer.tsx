import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Lock, Unlock, Key } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Progress } from "@/components/ui/progress";
import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "@/lib/pdf-utils";
import * as pdfjs from "pdfjs-dist";

const PdfViewer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setNewPassword("");
    setIsLocked(null);

    detectLock(f);
  };

  /* ================= Detect Lock ================= */

  const detectLock = async (pdfFile: File) => {
    try {
      await loadPdfDocument(pdfFile);
      setIsLocked(false);
      await renderPreview(pdfFile);
    } catch (err: any) {
      if (
        err?.message?.toLowerCase().includes("password") ||
        err?.name === "PasswordException"
      ) {
        setIsLocked(true);
      } else {
        toast.error("Unable to read PDF");
      }
    }
  };

  /* ================= Preview - ALL PAGES ================= */

  const renderPreview = async (pdfFile: File, pwd?: string) => {
    try {
      if (!canvasRef.current) {
        toast.error("Canvas not ready");
        return;
      }

      const arrayBuffer = await pdfFile.arrayBuffer();

      const pdf = await pdfjs
        .getDocument({
          data: arrayBuffer,
          password: pwd,
          disableWorker: true,
        })
        .promise;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast.error("Failed to get canvas context");
        return;
      }

      // Calculate total height for all pages
      let totalHeight = 0;
      let maxWidth = 0;
      const pageData: Array<{ viewport: any; height: number }> = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.2 });
        pageData.push({ viewport, height: viewport.height });
        totalHeight += viewport.height + (i < pdf.numPages ? 10 : 0);
        maxWidth = Math.max(maxWidth, viewport.width);
      }

      // Set canvas size
      canvas.width = maxWidth;
      canvas.height = totalHeight;

      // Clear canvas with light background
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render all pages
      let currentY = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const { viewport } = pageData[i - 1];

        // Create temp canvas for this page
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        // Render page
        await page.render({ canvasContext: tempCtx, viewport }).promise;

        // Draw to main canvas
        ctx.drawImage(tempCanvas, 0, currentY);

        // Add separator between pages
        if (i < pdf.numPages) {
          ctx.fillStyle = "#e0e0e0";
          ctx.fillRect(0, currentY + viewport.height, canvas.width, 10);
          currentY += viewport.height + 10;
        } else {
          currentY += viewport.height;
        }
      }

      if (pwd && isLocked) {
        toast.success(`Password verified - ${pdf.numPages} page(s) loaded`);
      }
    } catch (err: any) {
      console.error("Preview error:", err);
      if (
        err?.message?.toLowerCase().includes("password") ||
        err?.name === "PasswordException"
      ) {
        toast.error("Incorrect password - Please try again");
      } else {
        toast.error(`Failed to load preview: ${err?.message || "Unknown error"}`);
      }
    }
  };

  /* ================= Export ================= */

  const exportPdf = async () => {
    if (!file) return;

    if (isLocked && !password) {
      toast.error("Please enter the current PDF password");
      return;
    }

    setLoading(true);
    setProgress(25);

    try {
      const pdfDoc = await PDFDocument.load(
        await file.arrayBuffer(),
        isLocked ? { password } : undefined
      );

      setProgress(60);

      let pdfBytes: Uint8Array;

      if (newPassword) {
        // 🔐 FORCE REAL PASSWORD PROTECTION
        pdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          userPassword: newPassword,
          ownerPassword: newPassword,
          permissions: {
            printing: "none",
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false,
          },
        });
      } else {
        // 🔓 REMOVE PASSWORD
        pdfBytes = await pdfDoc.save({
          useObjectStreams: true,
        });
      }

      setProgress(90);

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(
        ".pdf",
        newPassword ? "_protected.pdf" : "_unlocked.pdf"
      );
      a.click();

      URL.revokeObjectURL(url);
      setProgress(100);

      toast.success(
        newPassword
          ? "PDF protected with password"
          : "PDF unlocked successfully"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message?.toLowerCase().includes("password")
          ? "Incorrect password"
          : "Failed to process PDF"
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  /* ================= UI ================= */

  return (
    <AnimatedElement className="space-y-6">
      <div className="border rounded-lg p-6 bg-muted/40 space-y-6">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">PDF Viewer & Unlock Tool</p>
          <p>View and unlock password-protected PDFs. Enter the password to preview locked PDFs, or export them without password protection.</p>
        </div>

        <div>
          <Label className="text-lg">Upload PDF</Label>
          <Input type="file" accept=".pdf" onChange={handleFileChange} />
        </div>

        {file && (
          <>
            <div className="flex items-center gap-3 border rounded p-4 bg-background">
              <FileText />
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            {isLocked && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key size={14} /> Current PDF Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>PDF Preview (All Pages)</Label>
              {isLocked && (
                <Button
                  variant="outline"
                  onClick={() => renderPreview(file, password)}
                  disabled={!password}
                  className="w-full"
                >
                  Unlock & Preview
                </Button>
              )}
              <div className="border rounded overflow-auto max-h-[600px] bg-muted">
                <canvas
                  ref={canvasRef}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock size={14} /> Set New Password (optional)
              </Label>
              <Input
                type="password"
                placeholder="Leave empty to remove password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassword && (
                <div className="text-xs p-2 border rounded bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300">
                  ⚠️ Note: Password protection has limited compatibility. For better security, use Adobe Acrobat or other professional PDF tools.
                </div>
              )}
            </div>

            <Button onClick={exportPdf} disabled={loading}>
              <Unlock size={18} />
              Export PDF
            </Button>

            {loading && <Progress value={progress} />}
          </>
        )}

        <div className="text-xs p-3 border rounded bg-yellow-50 dark:bg-yellow-950/30">
          🔐 All processing happens locally in your browser.
          No files or passwords are uploaded.
        </div>
      </div>
    </AnimatedElement>
  );
};

export default PdfViewer;
