import { lazy } from 'react';

// Lazy load each code tool to split into separate chunks
// This reduces the tool-code chunk from 1.1MB to smaller, on-demand chunks
const codeTools = {
  "code-formatter": lazy(() => import('./CodeFormatter')),
  "json-formatter": lazy(() => import('./JsonFormatter')),
  "xml-formatter": lazy(() => import('./XmlFormatter')),
  "html-formatter": lazy(() => import('./HtmlFormatter')),
  "css-formatter": lazy(() => import('./CssFormatter')),
  "js-minifier": lazy(() => import('./JavaScriptMinifier')),
  "code-runner": lazy(() => import('./CodeRunner')),
};

export default codeTools;