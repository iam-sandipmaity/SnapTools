import { lazy } from 'react';

const textTools = {
  "case-converter": lazy(() => import("./CaseConverter")),
  "text-diff": lazy(() => import("./TextDiff")),
  "find-replace": lazy(() => import("./FindReplace")),
  "duplicate-remover": lazy(() => import("./DuplicateRemover")),
  "reverse-text": lazy(() => import("./ReverseText")),
  "slug-generator": lazy(() => import("./SlugGenerator")),
  "text-sorter": lazy(() => import("./TextSorter")),
  "text-to-speech": lazy(() => import("./TextToSpeech")),
  "speech-to-text": lazy(() => import("./SpeechToText")),
};

export default textTools;
