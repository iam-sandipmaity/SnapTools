import { useState } from "react";
import { PDFDocument } from "pdf-lib-with-encrypt";
import { ShieldCheck, Unlock, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AnimatedElement from "@/components/animated-element";
import { toast } from "sonner";

const PdfDecryption = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (nextFile.type !== "application/pdf") {
      toast.error("Please choose a valid PDF file.");
      return;
    }

    setFile(nextFile);
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

  const buildDerivedFileName = () => {
    if (!file) return "document-decrypted.pdf";
    const normalized = file.name.toLowerCase().endsWith(".pdf")
      ? file.name.slice(0, -4)
      : file.name;
    return `${normalized}-decrypted.pdf`;
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
    if (keywords && keywords.length > 0) {
      target.setKeywords(Array.isArray(keywords) ? keywords : keywords.split(/,\s*/).filter(Boolean));
    }
    if (creator) target.setCreator(creator);
    if (producer) target.setProducer(producer);
    if (creationDate instanceof Date && !Number.isNaN(creationDate.getTime())) {
      target.setCreationDate(creationDate);
    }
    if (modificationDate instanceof Date && !Number.isNaN(modificationDate.getTime())) {
      target.setModificationDate(modificationDate);
    }
  };

  const handleDecrypt = async () => {
    if (!file) {
      toast.error("Upload a PDF first.");
      return;
    }

    if (!password.trim()) {
      toast.error("Enter the current PDF password.");
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

      downloadBytes(decryptedBytes, buildDerivedFileName());
      toast.success("Password removed and PDF downloaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to decrypt PDF";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatedElement className="space-y-6">
      <div className="rounded-[2rem] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold">PDF Decryption</h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload an encrypted PDF, enter its current password, and download a fresh passwordless copy directly from this page.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pdf-decrypt-file">Choose PDF</Label>
            <div className="relative">
              <Input
                id="pdf-decrypt-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="h-12 cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:opacity-90"
              />
              <Upload className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pdf-decrypt-password">Current PDF password</Label>
            <Input
              id="pdf-decrypt-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Required"
              className="h-12"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {file ? `Ready to remove password from ${file.name}` : "No PDF selected"}
          </p>

          <Button
            onClick={handleDecrypt}
            disabled={!file || isExporting}
            className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Unlock className="mr-2 h-4 w-4" />
            )}
            Decrypt and Download
          </Button>
        </div>

        <div className="text-xs p-4 border rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-start gap-3 shadow-sm">
          <span className="text-lg">[local]</span>
          <div>
            <p className="font-semibold mb-1 text-foreground">Privacy & Security</p>
            <p className="text-muted-foreground leading-relaxed">
              Decryption happens locally in your browser. Your PDF files and passwords do not leave your device.
            </p>
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
};

export default PdfDecryption;
