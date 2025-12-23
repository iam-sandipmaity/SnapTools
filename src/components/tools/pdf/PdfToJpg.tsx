
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image, FileText, ArrowRight, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { jsPDF } from "jspdf";
import {
  loadPdfDocument,
  renderPageToCanvas,
  canvasToBlob,
  createZipFromBlobs,
  downloadBlob,
  readFileAsDataURL
} from "@/lib/pdf-utils";

interface ImageFile {
  file: File;
  name: string;
  size: string;
  preview: string;
}

const PdfToJpg = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState([80]);

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setPdfFile(file);
  };

  const handleImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const fileArray = Array.from(files);

    // Filter out non-image files
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Read all files as data URLs using Promise.all
    const newImages = await Promise.all(
      validFiles.map(file => {
        return new Promise<ImageFile>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (event) => {
            if (event.target?.result) {
              resolve({
                file,
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                preview: event.target.result as string
              });
            } else {
              reject(new Error('Failed to read file'));
            }
          };

          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      })
    );

    // Add new images to existing ones
    setImageFiles([...imageFiles, ...newImages]);

    // Reset the file input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  const convertPdfToJpg = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF file first");
      return;
    }

    setIsLoading(true);

    try {
      // Load the PDF document
      const pdf = await loadPdfDocument(pdfFile);
      const blobs: Blob[] = [];
      const fileNames: string[] = [];

      // Convert quality slider value to decimal (0-1)
      const imageQuality = quality[0] / 100;

      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = await renderPageToCanvas(page, 2); // 2x scale for quality
        const blob = await canvasToBlob(canvas, 'image/jpeg', imageQuality);

        blobs.push(blob);
        fileNames.push(`page_${i}.jpg`);
      }

      // Create ZIP file
      const zipBlob = await createZipFromBlobs(blobs, fileNames);

      // Download the ZIP
      const fileName = pdfFile.name.replace('.pdf', '_images.zip');
      downloadBlob(zipBlob, fileName);

      toast.success(`Successfully converted ${pdf.numPages} page(s) to JPG images`, {
        description: "Your images have been packaged into a ZIP file."
      });

    } catch (error) {
      console.error('PDF to JPG conversion error:', error);
      toast.error("Failed to convert PDF to JPG", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertJpgToPdf = async () => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image file");
      return;
    }

    setIsLoading(true);

    try {
      const doc = new jsPDF();

      for (let i = 0; i < imageFiles.length; i++) {
        if (i > 0) {
          doc.addPage();
        }

        const imgData = await readFileAsDataURL(imageFiles[i].file);
        const img = document.createElement('img');

        // Wait for image to load to get dimensions
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgData;
        });

        // Calculate dimensions to fit page while maintaining aspect ratio
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const imgAspectRatio = img.width / img.height;
        const pageAspectRatio = pdfWidth / pdfHeight;

        let finalWidth = pdfWidth;
        let finalHeight = pdfHeight;

        if (imgAspectRatio > pageAspectRatio) {
          // Image is wider than page
          finalHeight = pdfWidth / imgAspectRatio;
        } else {
          // Image is taller than page
          finalWidth = pdfHeight * imgAspectRatio;
        }

        // Center the image on the page
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        doc.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
      }

      // Generate and download PDF
      const pdfBlob = doc.output('blob');
      downloadBlob(pdfBlob, 'converted_images.pdf');

      toast.success(`Successfully converted ${imageFiles.length} image(s) to PDF`, {
        description: "Your PDF has been created and downloaded."
      });

    } catch (error) {
      console.error('JPG to PDF conversion error:', error);
      toast.error("Failed to convert images to PDF", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedElement className="space-y-6">
      <Tabs defaultValue="pdf-to-jpg" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="pdf-to-jpg" className="flex gap-2 items-center">
            <FileText size={16} />
            <span>PDF to JPG</span>
          </TabsTrigger>
          <TabsTrigger value="jpg-to-pdf" className="flex gap-2 items-center">
            <Image size={16} />
            <span>JPG to PDF</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf-to-jpg" className="mt-6">
          <div className="bg-muted/40 rounded-lg border p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pdf-upload" className="text-lg font-medium">
                  Upload PDF File
                </Label>
                <p className="text-muted-foreground text-sm">
                  Upload the PDF file you want to convert to JPG images.
                </p>

                <div className="flex gap-4 items-center mt-2">
                  <div className="relative">
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handlePdfFileChange}
                    />
                    <Button variant="outline" className="gap-2">
                      <Upload size={18} />
                      Select PDF File
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    onClick={convertPdfToJpg}
                    disabled={!pdfFile || isLoading}
                    className="gap-2"
                  >
                    <Download size={18} />
                    {isLoading ? "Converting..." : "Extract Images"}
                  </Button>
                </div>
              </div>

              {pdfFile && (
                <AnimatedElement animation="fadeIn" className="mt-4">
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
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <ArrowRight className="mx-4 text-muted-foreground" />
                      <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                        <Image size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="mb-2 block">Image Quality: {quality}%</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="quality"
                        min={10}
                        max={100}
                        step={10}
                        value={quality}
                        onValueChange={setQuality}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-medium">{quality}%</span>
                    </div>
                  </div>
                </AnimatedElement>
              )}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Each page of your PDF will be converted to a separate JPG image.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jpg-to-pdf" className="mt-6">
          <div className="bg-muted/40 rounded-lg border p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="image-upload" className="text-lg font-medium">
                  Upload Image Files
                </Label>
                <p className="text-muted-foreground text-sm">
                  Upload the images you want to combine into a PDF file. Supported formats: JPG, PNG, BMP, GIF.
                </p>

                <div className="flex gap-4 items-center mt-2">
                  <div className="relative">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageFilesChange}
                    />
                    <Button variant="outline" className="gap-2">
                      <Upload size={18} />
                      Select Images
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    onClick={convertJpgToPdf}
                    disabled={imageFiles.length === 0 || isLoading}
                    className="gap-2"
                  >
                    <Plus size={18} />
                    {isLoading ? "Creating..." : "Create PDF"}
                  </Button>
                </div>
              </div>

              {imageFiles.length > 0 && (
                <AnimatedElement animation="fadeIn" className="mt-4">
                  <div className="text-sm font-medium mb-2">
                    {imageFiles.length} {imageFiles.length === 1 ? "image" : "images"} selected
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imageFiles.map((image, index) => (
                      <div key={`${image.name}-${index}`} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border bg-background">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeImage(index)}
                          className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </Button>
                        <div className="text-xs mt-1 truncate">{image.name}</div>
                      </div>
                    ))}
                  </div>
                </AnimatedElement>
              )}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Images will be added to the PDF in the order they appear above.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AnimatedElement>
  );
};

export default PdfToJpg;
