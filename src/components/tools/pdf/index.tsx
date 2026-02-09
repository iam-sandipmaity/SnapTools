import { lazy } from 'react';

// Lazy load each PDF tool to split into separate chunks
// PDF tools use heavy libraries (pdf-lib, pdfjs-dist) totaling ~1MB
const pdfTools = {
  "pdf-merger": lazy(() => import('./PdfMerger')),
  "pdf-splitter": lazy(() => import('./PdfSplitter')),
  "pdf-word": lazy(() => import('./PdfToWord')),
  "pdf-jpg": lazy(() => import('./PdfToJpg')),
  "pdf-compress": lazy(() => import('./PdfCompress')),
  "pdf-viewer": lazy(() => import('./PdfViewer')),
  "pdf-organizer": lazy(() => import('./PdfOrganizer')),
  "pdf-encryption": lazy(() => import('./PdfEncryption')),
  "pdf-decryption": lazy(() => import('./PdfDecryption')),
};

export default pdfTools;
