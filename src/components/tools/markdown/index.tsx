import { lazy } from 'react';

const markdownTools = {
  'markdown-editor': lazy(() => import('./MarkdownEditor')),
  'markdown-preview': lazy(() => import('./MarkdownPreview')),
  'markdown-to-html': lazy(() => import('./MarkdownToHtml')),
  'html-to-markdown': lazy(() => import('./HtmlToMarkdown')),
  'markdown-table-generator': lazy(() => import('./MarkdownTableGenerator')),
};

export default markdownTools;
