import React, { useEffect, useRef, useState } from "react";
import EmbedPDF, {
  type DocumentManagerPlugin,
  type EmbedPdfContainer,
  type ExportPlugin,
  type PDFViewerConfig,
} from "@embedpdf/snippet";
import { PDFDocument } from "pdf-lib-with-encrypt";
import AnimatedElement from "@/components/animated-element";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Loader2,
  RefreshCw,
  Shield,
  ShieldCheck,
  Upload,
  Eye,
  Download,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

const snippetWasmUrl = new URL(
  "../../../../node_modules/@embedpdf/snippet/dist/pdfium.wasm",
  import.meta.url
).href;

const disabledCategories = [];

const createViewerConfig = (src?: string, password?: string): PDFViewerConfig => ({
  wasmUrl: snippetWasmUrl,
  worker: true,
  src,
  disabledCategories,
  fonts: {
    ui: null,
    signature: null,
  },
  theme: { preference: "system" },
  scroll: {
    defaultBufferSize: 3,
    defaultPageGap: 16,
  },
  zoom: {
    minZoom: 0.25,
    maxZoom: 5,
  },
  documentManager: src
    ? {
        initialDocuments: [
          {
            url: src,
            password,
            autoActivate: true,
          },
        ],
      }
    : undefined,
});

const PdfViewer = () => {
  const viewerMountRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<EmbedPdfContainer | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [exportPassword, setExportPassword] = useState("");
  const [viewerReady, setViewerReady] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [isLoadingViewer, setIsLoadingViewer] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const mountNode = viewerMountRef.current;
    if (!mountNode || viewerRef.current) return;

    const viewer = EmbedPDF.init({
      type: "container",
      target: mountNode,
      ...createViewerConfig(),
    });

    if (!viewer) {
      setViewerError("EmbedPDF snippet could not initialize.");
      return;
    }

    viewerRef.current = viewer;

    viewer.registry
      .then(() => {
        setViewerReady(true);
        setViewerError(null);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Failed to initialize PDF viewer.";
        setViewerError(message);
      });

    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
      viewer.remove();
      viewerRef.current = null;
      setViewerReady(false);
    };
  }, []);

  const loadViewerDocument = (nextFile: File, nextPassword?: string) => {
    if (!viewerRef.current) {
      toast.error("PDF viewer is not ready yet.");
      return;
    }

    setIsLoadingViewer(true);
    setViewerError(null);

    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
    }

    const blobUrl = URL.createObjectURL(nextFile);
    activeBlobUrlRef.current = blobUrl;

    viewerRef.current.config = createViewerConfig(blobUrl, nextPassword);

    window.setTimeout(() => {
      setIsLoadingViewer(false);
      toast.success("PDF loaded in EmbedPDF snippet.");
    }, 250);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (nextFile.type !== "application/pdf") {
      toast.error("Please choose a valid PDF file.");
      return;
    }

    setFile(nextFile);
    loadViewerDocument(nextFile, password || undefined);
  };

  const handleReload = () => {
    if (!file) {
      toast.error("Choose a PDF first.");
      return;
    }

    loadViewerDocument(file, password || undefined);
  };

  const handleExportEditedPdf = async () => {
    if (!viewerRef.current) {
      toast.error("PDF viewer is not ready yet.");
      return;
    }

    setIsExporting(true);

    try {
      const registry = await viewerRef.current.registry;
      await registry.pluginsReady();

      const documentManager = registry.getPlugin<DocumentManagerPlugin>("document-manager");
      const exportPlugin = registry.getPlugin<ExportPlugin>("export");

      const activeDocumentId = documentManager?.provides().getActiveDocumentId();
      if (!activeDocumentId || !exportPlugin) {
        throw new Error("No active edited PDF is available to export.");
      }

      const result = await exportPlugin.saveAsCopyAndGetBufferAndName(activeDocumentId).toPromise();
      downloadBytes(new Uint8Array(result.buffer), result.name || buildDerivedFileName("edited"));
      toast.success("Edited PDF downloaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export edited PDF";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBytes = (bytes: Uint8Array, fileName: string) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const buildDerivedFileName = (suffix: string) => {
    if (!file) return `document-${suffix}.pdf`;
    const normalized = file.name.toLowerCase().endsWith(".pdf")
      ? file.name.slice(0, -4)
      : file.name;
    return `${normalized}-${suffix}.pdf`;
  };

  const applyMetadata = (source: PDFDocument, target: PDFDocument) => {
    const safeRead = <T,>(reader: () => T): T | undefined => {
      try {
        return reader();
      } catch {
        return undefined;
      }
    };

    const title = safeRead(() => source.getTitle());
    const author = safeRead(() => source.getAuthor());
    const subject = safeRead(() => source.getSubject());
    const keywords = safeRead(() => source.getKeywords());
    const creator = safeRead(() => source.getCreator());
    const producer = safeRead(() => source.getProducer());
    const creationDate = safeRead(() => source.getCreationDate());
    const modificationDate = safeRead(() => source.getModificationDate());

    if (title) target.setTitle(title);
    if (author) target.setAuthor(author);
    if (subject) target.setSubject(subject);
    if (keywords && keywords.length > 0) target.setKeywords(keywords);
    if (creator) target.setCreator(creator);
    if (producer) target.setProducer(producer);
    if (creationDate instanceof Date && !Number.isNaN(creationDate.getTime())) {
      target.setCreationDate(creationDate);
    }
    if (modificationDate instanceof Date && !Number.isNaN(modificationDate.getTime())) {
      target.setModificationDate(modificationDate);
    }
  };

  const handleEncryptExport = async () => {
    if (!file) {
      toast.error("Load a PDF before exporting.");
      return;
    }

    if (!exportPassword.trim()) {
      toast.error("Enter a password to encrypt this PDF.");
      return;
    }

    setIsExporting(true);

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, {
        password: password || undefined,
      });

      await pdfDoc.encrypt({
        userPassword: exportPassword,
        ownerPassword: exportPassword,
        permissions: {
          printing: "highResolution",
          modifying: true,
          copying: true,
          annotating: true,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: true,
        },
      });

      const encryptedBytes = await pdfDoc.save({
        useObjectStreams: false,
      });

      downloadBytes(encryptedBytes, buildDerivedFileName("encrypted"));
      toast.success("Encrypted PDF exported.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to encrypt PDF";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDecryptExport = async () => {
    if (!file) {
      toast.error("Load a PDF before exporting.");
      return;
    }

    if (!password.trim()) {
      toast.error("Enter the current PDF password to remove encryption.");
      return;
    }

    setIsExporting(true);

    try {
      const bytes = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(bytes, { password });
      const targetDoc = await PDFDocument.create();
      applyMetadata(sourceDoc, targetDoc);

      const pageIndices = sourceDoc.getPageIndices();
      const copiedPages = await targetDoc.copyPages(sourceDoc, pageIndices);
      copiedPages.forEach((page) => targetDoc.addPage(page));

      const decryptedBytes = await targetDoc.save({
        useObjectStreams: false,
      });

      downloadBytes(decryptedBytes, buildDerivedFileName("decrypted"));
      toast.success("Decrypted PDF exported.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to decrypt PDF";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedElement animation="fadeIn">
        <div className="rounded-[2rem] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                <Shield className="h-3 w-3" />
                EmbedPDF Snippet
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Fast local PDF rendering</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  The viewer now uses the drop-in EmbedPDF snippet. Local PDFs are mounted through blob URLs, while your encrypt and decrypt exports still run entirely in-browser.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                Snippet runtime
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                Local file loading
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                Browser-only export
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_140px]">
            <div className="space-y-2">
              <Label htmlFor="pdf-viewer-file">Choose PDF</Label>
              <div className="relative">
                <Input
                  id="pdf-viewer-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="h-12 cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:opacity-90"
                />
                <Upload className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf-viewer-password">Password</Label>
              <Input
                id="pdf-viewer-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter current PDF password if needed"
                className="h-12"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleReload}
                disabled={!file || isLoadingViewer}
                className="h-12 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                {isLoadingViewer ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Reload PDF
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              {file ? file.name : "No PDF selected"}
            </span>
            {file && (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
                onClick={() => {
                  const url = URL.createObjectURL(file);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = file.name;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Download original file
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:opacity-50"
              onClick={handleExportEditedPdf}
              disabled={!viewerReady || isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download edited PDF
            </button>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-primary/10 bg-background/60 p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Export security options
                </div>
                <p className="max-w-2xl text-xs text-muted-foreground">
                  Encrypt the loaded PDF with a new password, or click Decrypt PDF to remove the current password and immediately download a passwordless copy.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[220px_auto_auto]">
                <div className="space-y-2">
                  <Label htmlFor="pdf-export-password">New export password</Label>
                  <Input
                    id="pdf-export-password"
                    type="password"
                    value={exportPassword}
                    onChange={(event) => setExportPassword(event.target.value)}
                    placeholder="Required for encrypt"
                    className="h-11"
                  />
                </div>

                <Button
                  onClick={handleEncryptExport}
                  disabled={!file || isExporting}
                  className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Encrypt PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDecryptExport}
                  disabled={!file || isExporting}
                  className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Unlock className="mr-2 h-4 w-4" />
                  )}
                  Remove Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedElement>

      {viewerError && (
        <Alert className="rounded-[2rem] border-destructive/20 bg-destructive/5">
          <AlertDescription>{viewerError}</AlertDescription>
        </Alert>
      )}

      <AnimatedElement animation="fadeIn" delay={0.05}>
        <div className="rounded-[2rem] border border-black/5 bg-white/60 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
            <ViewerStatus
              isReady={viewerReady}
              isLoading={isLoadingViewer}
              fileName={file?.name}
            />
          </div>

          <div className="relative h-[75vh] min-h-[640px] rounded-[2rem] overflow-hidden border border-black/5 bg-background/40">
            <div ref={viewerMountRef} className="h-full w-full" />
            {!viewerReady && !viewerError && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-background/70 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Booting EmbedPDF snippet
                </div>
              </div>
            )}
          </div>
        </div>
      </AnimatedElement>
    </div>
  );
};

function ViewerStatus({
  isReady,
  isLoading,
  fileName,
}: {
  isReady: boolean;
  isLoading: boolean;
  fileName?: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        Loading PDF into the snippet viewer
      </div>
    );
  }

  if (!isReady) {
    return (
      <p className="text-xs text-muted-foreground">
        Waiting for the snippet runtime to initialize.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-2 font-medium text-foreground">
        <Eye className="h-3.5 w-3.5 text-primary" />
        {fileName || "Viewer ready"}
      </span>
      <span>Snippet-based PDF rendering active</span>
    </div>
  );
}

export default PdfViewer;
