
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { LazyImage } from "@/components/ui/lazy-image";

const ImageCompressor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [originalSize, setOriginalSize] = useState<string>("");
  const [compressedSize, setCompressedSize] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    
    // Set original file size
    setOriginalSize(formatFileSize(file.size));
    
    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      compressImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };
  
  const compressImage = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Maintain original dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get compressed image
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);
      setCompressedImage(compressedDataUrl);
      
      // Calculate compressed size
      const compressedBytes = Math.round((compressedDataUrl.length * 3) / 4);
      setCompressedSize(formatFileSize(compressedBytes));
    };
    img.src = dataUrl;
  };
  
  const handleQualityChange = (values: number[]) => {
    const newQuality = values[0];
    setQuality(newQuality);
    if (originalImage) {
      compressImage(originalImage);
    }
  };
  
  const handleDownload = () => {
    if (!compressedImage) return;
    
    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = "compressed-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded successfully");
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="image-upload">Upload Image</Label>
          <div className="flex gap-2">
            <Input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              ref={fileInputRef}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              size="icon"
            >
              <Upload size={18} />
            </Button>
          </div>
        </div>
        
        {originalImage && (
          <>
            <div className="space-y-2">
              <Label>Compression Quality: {quality}%</Label>
              <Slider
                defaultValue={[quality]}
                min={1}
                max={100}
                step={1}
                onValueChange={handleQualityChange}
              />
            </div>
            
            <div className="text-sm space-y-1">
              <p>Original Size: {originalSize}</p>
              <p>Compressed Size: {compressedSize}</p>
              <p>Reduction: {
                originalSize && compressedSize 
                  ? `${(100 - (parseFloat(compressedSize) / parseFloat(originalSize) * 100)).toFixed(1)}%`
                  : "0%"
              }</p>
            </div>
            
            {compressedImage && (
              <Button onClick={handleDownload} className="w-full">
                <Download size={18} className="mr-2" />
                Download Compressed Image
              </Button>
            )}
          </>
        )}
      </div>
      
      <div className="flex flex-col space-y-4">
        {!originalImage && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md bg-muted/50">
            <div className="flex flex-col items-center text-muted-foreground">
              <ImageIcon size={48} className="mb-2" />
              <p>Upload an image to compress</p>
            </div>
          </div>
        )}
        
        {originalImage && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Original Image</Label>
              <div className="border rounded-md overflow-hidden bg-checkerboard">
                <LazyImage 
                  src={originalImage} 
                  alt="Original" 
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>
            </div>
            
            {compressedImage && (
              <div className="space-y-2">
                <Label>Compressed Image</Label>
                <div className="border rounded-md overflow-hidden bg-checkerboard">
                  <LazyImage 
                    src={compressedImage} 
                    alt="Compressed" 
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompressor;
