import { lazy } from 'react';

const aiTools = {
  'ai-sarvam': lazy(() => import('./Sarvam')),
  'ai-summarizer': lazy(() => import('./AiTextSummarizer')),
  'ai-paraphraser': lazy(() => import('./AiParaphraser')),
  'ai-content-generator': lazy(() => import('./AiContentGenerator')),
  'ai-grammar-checker': lazy(() => import('./AiGrammarChecker')),
  'ai-code-explainer': lazy(() => import('./AiCodeExplainer')),
  'ai-code-generator': lazy(() => import('./AiCodeGenerator')),
  'ai-chatbot': lazy(() => import('./AiChatbot')),
};

export default aiTools;
