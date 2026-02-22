import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { PDFDocument } from "pdf-lib";
import {
  loadPdfDocument,
  renderPageToCanvas,
  canvasToBlob,
  downloadBlob,
} from "@/lib/pdf-utils";

/* ---------------- Compression Presets ---------------- */

const compressionLevels = [
  { value: "auto", label: "Auto (Recommended)", desc: "Smart size & quality balance" },
  { value: "low", label: "Low", desc: "Best quality, larger size" },
  { value: "medium", label: "Medium", desc: "Balanced compression" },
  { value: "high", label: "High", desc: "Smaller size, lower quality" },
  { value: "custom", label: "Custom", desc: "Manual control" },
];

/* ---------------- Helper Functions ---------------- */

// DPI gives predictable output size
const getDpi = (compression: number) => {
  if (compression <= 25) return 220;
  if (compression <= 50) return 170;
  if (compression <= 75) return 130;
  return 96;
};

// Non-linear perceptual quality curve
const getJpegQuality = (compression: number) =>
  Math.max(0.35, 1 - Math.pow(compression / 100, 1.6));

/* ---------------- Component ---------------- */

const PdfCompress = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("auto");
  const [customCompression, setCustomCompression] = useState([60]);
  const [grayscale, setGrayscale] = useState(false);

  /* -------- Estimated Size -------- */

  const estimatedSize =
    pdfFile &&
    (pdfFile.size / 1024 / 1024) *
    (compressionLevel === "low"
      ? 0.8
      : compressionLevel === "medium"
        ? 0.5
        : compressionLevel === "high"
          ? 0.3
          : compressionLevel === "custom"
            ? (100 - customCompression[0]) / 100
            : pdfFile.size > 10_000_000
              ? 0.25
              : 0.5);

  /* -------- File Upload -------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setPdfFile(file);
  };

  /* -------- Core Compression Logic -------- */

  const compressPdf = async () => {
    if (!pdfFile) {
      toast.error("Upload a PDF first");
      return;
    }

    setIsLoading(true);

    try {
      const compression =
        compressionLevel === "low"
          ? 20
          : compressionLevel === "medium"
            ? 50
            : compressionLevel === "high"
              ? 75
              : compressionLevel === "custom"
                ? customCompression[0]
                : pdfFile.size > 10_000_000
                  ? 80
                  : 55;

      const dpi = getDpi(compression);
      const quality = getJpegQuality(compression);
      const scale = dpi / 72;

      const pdf = await loadPdfDocument(pdfFile);
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = await renderPageToCanvas(page, scale);

        if (grayscale) {
          const ctx = canvas.getContext("2d")!;
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let p = 0; p < img.data.length; p += 4) {
            const avg =
              (img.data[p] + img.data[p + 1] + img.data[p + 2]) / 3;
            img.data[p] = img.data[p + 1] = img.data[p + 2] = avg;
          }
          ctx.putImageData(img, 0, 0);
        }

        const imgBlob = await canvasToBlob(canvas, "image/jpeg", quality);
        const imgBytes = await imgBlob.arrayBuffer();
        const jpg = await newPdf.embedJpg(imgBytes);

        const viewport = page.getViewport({ scale });
        const newPage = newPdf.addPage([viewport.width, viewport.height]);

        newPage.drawImage(jpg, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const pdfBytes = await newPdf.save({
        useObjectStreams: true,
      });

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      downloadBlob(
        blob,
        pdfFile.name.replace(".pdf", "_compressed.pdf")
      );

      const original = (pdfFile.size / 1024 / 1024).toFixed(2);
      const compressed = (blob.size / 1024 / 1024).toFixed(2);
      const reduction = (
        ((pdfFile.size - blob.size) / pdfFile.size) *
        100
      ).toFixed(1);

      toast.success("PDF Compressed Successfully", {
        description: `${original}MB → ${compressed}MB (${reduction}% saved)`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Compression failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <AnimatedElement className="space-y-6">
      <div className="border rounded-lg p-6 bg-muted/40 space-y-6">

        <div>
          <Label className="text-lg">Upload PDF</Label>
          <div className="flex gap-3 mt-2">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="max-w-xs"
            />
            <Button
              onClick={compressPdf}
              disabled={!pdfFile || isLoading}
              className="gap-2"
            >
              <Minimize2 size={18} />
              {isLoading ? "Compressing..." : "Compress"}
            </Button>
          </div>
        </div>

        {pdfFile && (
          <>
            <div className="flex items-center gap-3 border rounded p-4 bg-background">
              <FileText />
              <div>
                <div className="font-medium">{pdfFile.name}</div>
                <div className="text-xs text-muted-foreground">
                  Original: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="text-xs">
                  Estimated: {estimatedSize?.toFixed(2)} MB
                </div>
              </div>
            </div>

            <div>
              <Label>Compression Level</Label>
              <RadioGroup
                value={compressionLevel}
                onValueChange={setCompressionLevel}
                className="space-y-2 mt-2"
              >
                {compressionLevels.map((l) => (
                  <div key={l.value} className="flex gap-2 items-start">
                    <RadioGroupItem value={l.value} />
                    <div>
                      <div className="font-medium">{l.label}</div>
                      <div className="text-xs text-muted-foreground">{l.desc}</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {compressionLevel === "custom" && (
              <div>
                <Label>Compression Strength: {customCompression[0]}%</Label>
                <Slider
                  min={20}
                  max={90}
                  step={5}
                  value={customCompression}
                  onValueChange={setCustomCompression}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch checked={grayscale} onCheckedChange={setGrayscale} />
              <Label>Grayscale (smaller size)</Label>
            </div>
          </>
        )}
      </div>
    </AnimatedElement>
  );
};

export default PdfCompress;
