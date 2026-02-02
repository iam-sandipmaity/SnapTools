
import PdfMerger from "./PdfMerger";
import PdfSplitter from "./PdfSplitter";
import PdfToWord from "./PdfToWord";
import PdfToJpg from "./PdfToJpg";
import PdfCompress from "./PdfCompress";
import PdfViewer from "./PdfViewer";
import PdfOrganizer from "./PdfOrganizer";
// import PdfEncryption from "./PdfEncryption";
// import PdfDecryption from "./PdfDecryption"; 

// Export all PDF tools
const pdfTools = {
  "pdf-merger": PdfMerger,
  "pdf-splitter": PdfSplitter,
  "pdf-word": PdfToWord,
  "pdf-jpg": PdfToJpg,
  "pdf-compress": PdfCompress,
  "pdf-viewer": PdfViewer,
  "pdf-organizer": PdfOrganizer,
  // "pdf-encryption": PdfEncryption 
  // "pdf-decryption": PdfDecryption
};

export default pdfTools;
