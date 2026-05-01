import { useState } from "react";
import { PDFDocument } from "pdf-lib-with-encrypt";
import { Lock, Loader2, Shield, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AnimatedElement from "@/components/animated-element";
import { toast } from "sonner";

const PdfEncryption = () => {
  const [file, setFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
    if (!file) return "document-encrypted.pdf";
    const normalized = file.name.toLowerCase().endsWith(".pdf")
      ? file.name.slice(0, -4)
      : file.name;
    return `${normalized}-encrypted.pdf`;
  };

  const handleEncrypt = async () => {
    if (!file) {
      toast.error("Upload a PDF first.");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Enter a new password.");
      return;
    }

    setIsExporting(true);

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, {
        password: currentPassword || undefined,
      });

      await pdfDoc.encrypt({
        userPassword: newPassword,
        ownerPassword: newPassword,
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

      downloadBytes(encryptedBytes, buildDerivedFileName());
      toast.success("Encrypted PDF downloaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to encrypt PDF";
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
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold">PDF Encryption</h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a PDF, choose a new password, and download a password-protected copy directly from this page.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pdf-encrypt-file">Choose PDF</Label>
            <div className="relative">
              <Input
                id="pdf-encrypt-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="h-12 cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:opacity-90"
              />
              <Upload className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf-encrypt-current-password">Current PDF password</Label>
            <Input
              id="pdf-encrypt-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Only if the source PDF is already locked"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf-encrypt-new-password">New password</Label>
            <Input
              id="pdf-encrypt-new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Required"
              className="h-12"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {file ? `Ready to protect ${file.name}` : "No PDF selected"}
          </p>

          <Button
            onClick={handleEncrypt}
            disabled={!file || isExporting}
            className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            Encrypt and Download
          </Button>
        </div>

        <div className="text-xs p-4 border rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-start gap-3 shadow-sm">
          <span className="text-lg">[local]</span>
          <div>
            <p className="font-semibold mb-1 text-foreground">Privacy & Security</p>
            <p className="text-muted-foreground leading-relaxed">
              Encryption happens locally in your browser. Your PDF files and passwords do not leave your device.
            </p>
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
};

export default PdfEncryption;
