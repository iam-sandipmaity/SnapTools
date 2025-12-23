
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PDFDocument } from "pdf-lib";
import { loadPdfDocument, renderPageToCanvas, canvasToBlob, downloadBlob } from "@/lib/pdf-utils";

const compressionLevels = [
  { value: "low", label: "Low Compression", description: "Better quality, larger file size" },
  { value: "medium", label: "Medium Compression", description: "Balanced quality and size" },
  { value: "high", label: "High Compression", description: "Smaller file size, lower quality" },
  { value: "custom", label: "Custom Compression", description: "Set your own compression level" }
];

const PdfCompress = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [customCompression, setCustomCompression] = useState([50]);

  // Calculate estimated compressed size
  const estimatedSize = pdfFile ?
    (pdfFile.size / 1024 / 1024) *
    (compressionLevel === "low" ? 0.8 :
      compressionLevel === "medium" ? 0.5 :
        compressionLevel === "high" ? 0.3 :
          (100 - customCompression[0]) / 100) : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setPdfFile(file);
  };

  const compressPdf = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF file first");
      return;
    }

    setIsLoading(true);

    try {
      // Get the compression percentage based on level
      const compressionPercentage =
        compressionLevel === "low" ? 20 :
          compressionLevel === "medium" ? 50 :
            compressionLevel === "high" ? 70 :
              customCompression[0];

      const arrayBuffer = await pdfFile.arrayBuffer();

      // For low compression, use pdf-lib optimization only
      if (compressionPercentage < 25) {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = pdfFile.name.replace('.pdf', '_compressed.pdf');
        downloadBlob(blob, fileName);

        const originalSize = (pdfFile.size / 1024 / 1024).toFixed(2);
        const compressedSize = (blob.size / 1024 / 1024).toFixed(2);
        const reduction = (((pdfFile.size - blob.size) / pdfFile.size) * 100).toFixed(1);

        toast.success(`PDF compressed successfully!`, {
          description: `Reduced from ${originalSize}MB to ${compressedSize}MB (${reduction}% reduction)`
        });
      } else {
        // For medium/high compression, re-render pages as compressed images
        const pdf = await loadPdfDocument(pdfFile);
        const newPdfDoc = await PDFDocument.create();

        // Calculate scale and quality based on compression level
        const scaleFactor = 1.5 - ((compressionPercentage - 25) / 70) * 0.5;
        const quality = 0.8 - ((compressionPercentage - 25) / 70) * 0.6;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const canvas = await renderPageToCanvas(page, scaleFactor);

          // Convert canvas to JPEG blob
          const imgBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
          const imgArrayBuffer = await imgBlob.arrayBuffer();

          // Embed image in new PDF
          const jpgImage = await newPdfDoc.embedJpg(imgArrayBuffer);
          const viewport = page.getViewport({ scale: scaleFactor });

          const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
          newPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });
        }

        const pdfBytes = await newPdfDoc.save({ useObjectStreams: true });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = pdfFile.name.replace('.pdf', '_compressed.pdf');
        downloadBlob(blob, fileName);

        const originalSize = (pdfFile.size / 1024 / 1024).toFixed(2);
        const compressedSize = (blob.size / 1024 / 1024).toFixed(2);
        const reduction = (((pdfFile.size - blob.size) / pdfFile.size) * 100).toFixed(1);

        toast.success(`PDF compressed successfully!`, {
          description: `Reduced from ${originalSize}MB to ${compressedSize}MB (${reduction}% reduction)`
        });
      }

    } catch (error) {
      console.error('PDF compression error:', error);
      toast.error("Failed to compress PDF", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedElement className="space-y-6">
      <div className="bg-muted/40 rounded-lg border p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pdf-upload" className="text-lg font-medium">
              Upload PDF File
            </Label>
            <p className="text-muted-foreground text-sm">
              Upload the PDF file you want to compress. Reduce file size while maintaining quality.
            </p>

            <div className="flex gap-4 items-center mt-2">
              <div className="relative">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <Button variant="outline" className="gap-2">
                  <Upload size={18} />
                  Select PDF File
                </Button>
              </div>

              <Button
                variant="default"
                onClick={compressPdf}
                disabled={!pdfFile || isLoading}
                className="gap-2"
              >
                <Minimize2 size={18} />
                {isLoading ? "Compressing..." : "Compress PDF"}
              </Button>
            </div>
          </div>

          {pdfFile && (
            <AnimatedElement animation="fadeIn" className="mt-4 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                    <FileText size={20} />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="font-medium text-sm md:text-base max-w-[250px] truncate">
                      {pdfFile.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Original size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="text-sm">Estimated size after compression:</div>
                  <div className="font-medium">{estimatedSize.toFixed(2)} MB</div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Compression Level</Label>
                <RadioGroup
                  value={compressionLevel}
                  onValueChange={setCompressionLevel}
                  className="space-y-3"
                >
                  {compressionLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={level.value} id={`level-${level.value}`} />
                      <Label htmlFor={`level-${level.value}`} className="flex flex-col cursor-pointer">
                        <span>{level.label}</span>
                        <span className="text-xs text-muted-foreground">{level.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {compressionLevel === "custom" && (
                <div className="mt-4">
                  <Label className="mb-2 block">Custom Compression Strength: {customCompression}%</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="quality"
                      min={10}
                      max={90}
                      step={5}
                      value={customCompression}
                      onValueChange={setCustomCompression}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-medium">{customCompression}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Higher values result in smaller files but lower quality.
                  </p>
                </div>
              )}
            </AnimatedElement>
          )}
        </div>
      </div>
    </AnimatedElement>
  );
};

export default PdfCompress;
