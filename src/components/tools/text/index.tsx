import CaseConverter from "./CaseConverter";
import TextDiff from "./TextDiff";
import FindReplace from "./FindReplace";
import DuplicateRemover from "./DuplicateRemover";
import ReverseText from "./ReverseText";
import SlugGenerator from "./SlugGenerator";
import TextSorter from "./TextSorter";
import TextToSpeech from "./TextToSpeech";
import SpeechToText from "./SpeechToText";

const textTools = {
  "case-converter": CaseConverter,
  "text-diff": TextDiff,
  "find-replace": FindReplace,
  "duplicate-remover": DuplicateRemover,
  "reverse-text": ReverseText,
  "slug-generator": SlugGenerator,
  "text-sorter": TextSorter,
  "text-to-speech": TextToSpeech,
  "speech-to-text": SpeechToText,
};

export default textTools;
