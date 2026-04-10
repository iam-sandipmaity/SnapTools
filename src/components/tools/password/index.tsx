import { lazy } from 'react';

const passwordTools = {
  "password-generator": lazy(() => import("./PasswordGenerator")),
  "word-counter": lazy(() => import("./WordCounter")),
  "lorem-ipsum-generator": lazy(() => import("./LoremIpsumGenerator")),
  "character-counter": lazy(() => import("./CharacterCounter")),
};

export default passwordTools;
