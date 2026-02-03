import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import MarkdownToHtml from './MarkdownToHtml';
import HtmlToMarkdown from './HtmlToMarkdown';
import MarkdownTableGenerator from './MarkdownTableGenerator';

const markdownTools = {
  'markdown-editor': MarkdownEditor,
  'markdown-preview': MarkdownPreview,
  'markdown-to-html': MarkdownToHtml,
  'html-to-markdown': HtmlToMarkdown,
  'markdown-table-generator': MarkdownTableGenerator,
};

export default markdownTools;
