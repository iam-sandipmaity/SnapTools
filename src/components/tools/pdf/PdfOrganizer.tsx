import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Copy, MoveUp, MoveDown, Download, X } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { PDFDocument } from 'pdf-lib';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdf-utils';

interface PageData {
    id: string;
    pageNumber: number;
    thumbnail: string;
}

const PdfOrganizer = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        setPdfFile(file);
        await loadPdfPages(file);
    };

    const loadPdfPages = async (file: File) => {
        try {
            setIsLoading(true);

            // Use the shared utility function to load PDF
            const pdf = await loadPdfDocument(file);
            const pageCount = pdf.numPages;
            const pageDataArray: PageData[] = [];

            // Generate thumbnails for each page
            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);

                // Use the shared utility function to render page to canvas
                const canvas = await renderPageToCanvas(page, 0.5);
                const thumbnail = canvas.toDataURL();

                pageDataArray.push({
                    id: `page-${i}-${Date.now()}`,
                    pageNumber: i,
                    thumbnail
                });
            }

            setPages(pageDataArray);
            toast.success(`Loaded ${pageCount} pages`);
        } catch (error) {
            console.error("Error loading PDF:", error);
            toast.error("Failed to load PDF. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const movePage = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === pages.length - 1)
        ) {
            return;
        }

        const newPages = [...pages];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        // Swap positions
        [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];

        setPages(newPages);
    };

    const deletePage = (index: number) => {
        if (pages.length === 1) {
            toast.error("Cannot delete the last page");
            return;
        }

        const newPages = [...pages];
        newPages.splice(index, 1);
        setPages(newPages);
        toast.success("Page deleted");
    };

    const duplicatePage = (index: number) => {
        const newPages = [...pages];
        const pageToDuplicate = { ...pages[index], id: `page-dup-${Date.now()}` };
        newPages.splice(index + 1, 0, pageToDuplicate);
        setPages(newPages);
        toast.success("Page duplicated");
    };

    const saveOrganizedPdf = async () => {
        if (!pdfFile || pages.length === 0) {
            toast.error("No PDF to save");
            return;
        }

        try {
            setIsProcessing(true);

            // Load the original PDF
            const arrayBuffer = await pdfFile.arrayBuffer();
            const originalPdf = await PDFDocument.load(arrayBuffer);

            // Create a new PDF document
            const newPdf = await PDFDocument.create();

            // Add pages in the new order
            for (const pageData of pages) {
                // Get the original page index (0-based)
                const originalPageIndex = pageData.pageNumber - 1;

                // Copy the page from the original PDF
                const [copiedPage] = await newPdf.copyPages(originalPdf, [originalPageIndex]);
                newPdf.addPage(copiedPage);
            }

            // Save the new PDF
            const pdfBytes = await newPdf.save();

            // Create download link
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "organized.pdf";
            document.body.appendChild(a);
            a.click();

            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("PDF organized and downloaded successfully!");
        } catch (error) {
            console.error("Error organizing PDF:", error);
            toast.error("Failed to organize PDF. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetTool = () => {
        setPdfFile(null);
        setPages([]);
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
                            Upload a PDF file to organize its pages. You can reorder, delete, or duplicate pages.
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

                            {pdfFile && (
                                <Button
                                    variant="ghost"
                                    onClick={resetTool}
                                    className="gap-2"
                                >
                                    <X size={18} />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {pdfFile && (
                        <AnimatedElement animation="fadeIn" className="mt-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{pdfFile.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • {pages.length} pages
                                    </div>
                                </div>
                                <Button
                                    variant="default"
                                    onClick={saveOrganizedPdf}
                                    disabled={isProcessing || pages.length === 0}
                                    className="gap-2"
                                >
                                    <Download size={18} />
                                    Save PDF
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Loading pages...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Pages ({pages.length})
                                    </Label>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {pages.map((page, index) => (
                                            <div
                                                key={page.id}
                                                className="border rounded-lg overflow-hidden bg-background group hover:shadow-md transition-shadow"
                                            >
                                                <div className="relative aspect-[3/4] bg-muted">
                                                    <img
                                                        src={page.thumbnail}
                                                        alt={`Page ${index + 1}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs font-medium">
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                <div className="p-2 space-y-1">
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => movePage(index, "up")}
                                                            disabled={index === 0}
                                                            className="h-7 w-7 flex-1"
                                                            title="Move up"
                                                        >
                                                            <MoveUp size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => movePage(index, "down")}
                                                            disabled={index === pages.length - 1}
                                                            className="h-7 w-7 flex-1"
                                                            title="Move down"
                                                        >
                                                            <MoveDown size={14} />
                                                        </Button>
                                                    </div>

                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => duplicatePage(index)}
                                                            className="h-7 w-7 flex-1"
                                                            title="Duplicate page"
                                                        >
                                                            <Copy size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deletePage(index)}
                                                            disabled={pages.length === 1}
                                                            className="h-7 w-7 flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            title="Delete page"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </AnimatedElement>
                    )}
                </div>
            </div>
        </AnimatedElement>
    );
};

export default PdfOrganizer;
