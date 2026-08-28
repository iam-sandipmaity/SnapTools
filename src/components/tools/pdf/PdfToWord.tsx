
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, FileType2, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mammoth from "mammoth";
import DOMPurify from "dompurify";
// @ts-ignore - html2pdf.js doesn't have proper TypeScript definitions
import html2pdf from "html2pdf.js";
import { loadPdfDocument, downloadBlob } from "@/lib/pdf-utils";

const PdfToWord = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [wordFile, setWordFile] = useState<File | null>(null);

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setPdfFile(file);
  };

  const handleWordFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check if the file is a Word document
    if (!file.type.includes("word") &&
      !file.name.endsWith(".doc") &&
      !file.name.endsWith(".docx")) {
      toast.error("Please upload a Word document (.doc or .docx)");
      return;
    }

    setWordFile(file);
  };

  const convertPdfToWord = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF file first");
      return;
    }

    setIsLoading(true);

    try {
      // Load PDF and extract text
      const pdf = await loadPdfDocument(pdfFile);
      let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      margin: 1in;
    }
    p {
      margin: 0 0 12pt 0;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
`;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items into lines based on Y position
        const lines: { [key: number]: string[] } = {};
        textContent.items.forEach((item: any) => {
          const y = Math.round(item.transform[5]);
          if (!lines[y]) {
            lines[y] = [];
          }
          lines[y].push(item.str);
        });

        // Sort lines by Y position (top to bottom)
        const sortedYPositions = Object.keys(lines).map(Number).sort((a, b) => b - a);

        sortedYPositions.forEach(y => {
          const lineText = lines[y].join(' ').trim();
          if (lineText) {
            // Escape HTML special characters
            const escapedText = lineText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
            htmlContent += `<p>${escapedText}</p>\n`;
          }
        });

        // Add page break after each page except the last
        if (i < pdf.numPages) {
          htmlContent += '<div class="page-break"></div>\n';
        }
      }

      htmlContent += `</body>
</html>`;

      // Create HTML blob that Word can open
      const blob = new Blob([htmlContent], {
        type: 'application/msword'
      });

      const fileName = pdfFile.name.replace('.pdf', '.doc');
      downloadBlob(blob, fileName);

      toast.success("PDF converted to Word successfully!", {
        description: "Text has been extracted. Open the .doc file in Word to edit and save as .docx."
      });

    } catch (error) {
      console.error('PDF to Word conversion error:', error);
      toast.error("Failed to convert PDF to Word", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertWordToPdf = async () => {
    if (!wordFile) {
      toast.error("Please upload a Word document first");
      return;
    }

    setIsLoading(true);

    try {
      // Read the Word file
      const arrayBuffer = await wordFile.arrayBuffer();

      // Convert Word to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      let htmlContent = DOMPurify.sanitize(result.value);

      // Pre-process: Detect likely tabbed patterns (names/IDs, TOC)
      htmlContent = htmlContent.replace(
        /([A-Z\s]+)\s{3,}([0-9]+)/g,
        '<div style="display: flex; justify-content: space-between;"><span>$1</span><span>$2</span></div>'
      );

      // Create a styled wrapper for Word-like appearance
      const styledHtml = `
        <div style="
          background-color: white;
          padding: 25.4mm;
          width: 210mm;
          min-height: 297mm;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
        ">
          ${htmlContent}
        </div>
      `;

      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.innerHTML = styledHtml;
      document.body.appendChild(tempContainer);

      // Apply additional styling to elements
      const wrapper = tempContainer.firstElementChild as HTMLElement;
      if (wrapper) {
        // Style paragraphs
        const paragraphs = wrapper.querySelectorAll('p');
        paragraphs.forEach(p => {
          (p as HTMLElement).style.marginBottom = '12pt';
          (p as HTMLElement).style.textAlign = 'justify';
        });

        // Style headings
        const headings = wrapper.querySelectorAll('h1, h2, h3');
        headings.forEach(h => {
          (h as HTMLElement).style.fontFamily = 'Arial, Helvetica, sans-serif';
          (h as HTMLElement).style.fontWeight = 'bold';
          (h as HTMLElement).style.lineHeight = '1.2';
          (h as HTMLElement).style.marginTop = '18pt';
          (h as HTMLElement).style.marginBottom = '6pt';
        });

        // Style tables
        const tables = wrapper.querySelectorAll('table');
        tables.forEach(table => {
          (table as HTMLElement).style.borderCollapse = 'collapse';
          (table as HTMLElement).style.width = '100%';
          (table as HTMLElement).style.margin = '15pt 0';
        });

        const cells = wrapper.querySelectorAll('td, th');
        cells.forEach(cell => {
          (cell as HTMLElement).style.border = '1px solid #000';
          (cell as HTMLElement).style.padding = '8pt';
          (cell as HTMLElement).style.verticalAlign = 'top';
        });
      }

      // Convert to PDF using html2pdf
      const options = {
        margin: 0,
        filename: wordFile.name.replace(/\.(docx?|DOCX?)$/, '.pdf'),
        image: { type: 'jpeg' as const, quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const pdfBlob = await html2pdf().from(wrapper).set(options).output('blob');

      // Clean up
      document.body.removeChild(tempContainer);

      // Download the PDF
      const fileName = wordFile.name.replace(/\.(docx?|DOCX?)$/, '.pdf');
      downloadBlob(pdfBlob, fileName);

      toast.success("Word document converted to PDF successfully!", {
        description: "Your document has been converted with formatting preserved."
      });

    } catch (error) {
      console.error('Word to PDF conversion error:', error);
      toast.error("Failed to convert Word to PDF", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedElement className="space-y-6">
      <Tabs defaultValue="pdf-to-word" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="pdf-to-word" className="flex gap-2 items-center">
            <FileText size={16} />
            <span>PDF to Word</span>
          </TabsTrigger>
          <TabsTrigger value="word-to-pdf" className="flex gap-2 items-center">
            <FileType2 size={16} />
            <span>Word to PDF</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf-to-word" className="mt-6">
          <div className="bg-muted/40 rounded-lg border p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pdf-upload" className="text-lg font-medium">
                  Upload PDF File
                </Label>
                <p className="text-muted-foreground text-sm">
                  Upload the PDF file you want to convert to a Word document.
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
                    onClick={convertPdfToWord}
                    disabled={!pdfFile || isLoading}
                    className="gap-2"
                  >
                    <Download size={18} />
                    {isLoading ? "Converting..." : "Convert to Word"}
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
                        <FileType2 size={20} />
                      </div>
                    </div>
                  </div>
                </AnimatedElement>
              )}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Text will be extracted as HTML. Open in Word to edit and save as .docx.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="word-to-pdf" className="mt-6">
          <div className="bg-muted/40 rounded-lg border p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="word-upload" className="text-lg font-medium">
                  Upload Word Document
                </Label>
                <p className="text-muted-foreground text-sm">
                  Upload the Word document you want to convert to a PDF file.
                </p>

                <div className="flex gap-4 items-center mt-2">
                  <div className="relative">
                    <Input
                      id="word-upload"
                      type="file"
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleWordFileChange}
                    />
                    <Button variant="outline" className="gap-2">
                      <Upload size={18} />
                      Select Word File
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    onClick={convertWordToPdf}
                    disabled={!wordFile || isLoading}
                    className="gap-2"
                  >
                    <Download size={18} />
                    {isLoading ? "Converting..." : "Convert to PDF"}
                  </Button>
                </div>
              </div>

              {wordFile && (
                <AnimatedElement animation="fadeIn" className="mt-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                        <FileType2 size={20} />
                      </div>
                      <div className="text-center md:text-left">
                        <div className="font-medium text-sm md:text-base max-w-[250px] truncate">
                          {wordFile.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(wordFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <ArrowRight className="mx-4 text-muted-foreground" />
                      <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                        <FileText size={20} />
                      </div>
                    </div>
                  </div>
                </AnimatedElement>
              )}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Your document will be converted with formatting preserved as closely as possible.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AnimatedElement>
  );
};

export default PdfToWord;
