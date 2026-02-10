import { lazy } from 'react';

// Lazy load each data tool to split into separate chunks
// This is critical for bundle size optimization as some tools use heavy libraries:
// - FakeDataGenerator uses @faker-js/faker (~2MB)
// - ExcelViewer uses xlsx (~800KB)
// - CsvEditor/CsvJsonConverter use papaparse (~100KB)
const dataTools = {
  "json-validator": lazy(() => import('./JsonSchemaValidator')),
  "excel-viewer": lazy(() => import('./ExcelViewer')),
  "csv-editor": lazy(() => import('./CsvEditor')),
  "text-editor": lazy(() => import('./TextEditor')),
  "word-viewer": lazy(() => import('./WordViewer')),
  "fake-data-generator": lazy(() => import('./FakeDataGenerator')),
  "random-name": lazy(() => import('./RandomNameGenerator')),
  "random-address": lazy(() => import('./RandomAddressGenerator')),
  "csv-json": lazy(() => import('./CsvJsonConverter')),
}

export default dataTools;