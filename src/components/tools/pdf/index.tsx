
import PdfMerger from "./PdfMerger";
import PdfSplitter from "./PdfSplitter";
import PdfToWord from "./PdfToWord";
import PdfToJpg from "./PdfToJpg";
import PdfCompress from "./PdfCompress";
import PdfViewer from "./PdfViewer";
import PdfOrganizer from "./PdfOrganizer";

// Export all PDF tools
const pdfTools = {
  "pdf-merger": PdfMerger,
  "pdf-splitter": PdfSplitter,
  "pdf-word": PdfToWord,
  "pdf-jpg": PdfToJpg,
  "pdf-compress": PdfCompress,
  "pdf-viewer": PdfViewer,
  "pdf-organizer": PdfOrganizer
};

export default pdfTools;
