# SnapTools - Project Structure & Roadmap

## Current Status

### Working OG Image Solution

- Using fallback `og-image.jpg` for all pages
- OG API currently broken (needs fix)
- Static SVG generation script created but not working at runtime

---

## Project Structure

### Directory Layout

```
SnapTools/
├── src/
│   ├── data/
│   │   └── tools.ts          # Main tool definitions (32 categories, 200+ tools)
│   ├── components/
│   │   ├── seo/            # SEO components (MetaTagGenerator, ToolSEO)
│   │   └── tools/           # Individual tool components by category
│   ├── pages/              # React pages
│   └── lib/               # Utility libraries
├── api/                    # Vercel API routes (currently empty after removing broken og.tsx)
├── scripts/                # Build scripts
│   ├── generate-static-pages.ts
│   └── generate-og-images.ts
└── public/                 # Static assets
    └── og-image.jpg       # Fallback OG image
```

### Tools Data Structure (src/data/tools.ts)

```typescript
type ToolCategory = {
  id: string; // Unique category ID (e.g., "pdf", "image")
  title: string; // Display title
  icon: any; // Lucide React icon component
  iconName?: string; // Icon identifier
  color?: string; // Tailwind color class
  description?: string; // Category description
  comingSoon?: boolean; // Flag for upcoming categories
  gradient?: { from; to }; // OG image gradient colors
  subTools?: {
    // Array of tools in this category
    id: string; // Tool ID (e.g., "pdf-merger")
    title: string; // Tool title
    description?: string; // Tool description
    comingSoon?: boolean; // Flag for upcoming tools
  }[];
};
```

---

## Current Categories & Tools (32 Categories, 200+ Tools)

| Category      | Tools Count | Status             |
| ------------- | ----------- | ------------------ |
| Image         | 10          | Active             |
| PDF           | 9           | Active             |
| Calculator    | 4           | Active             |
| Conversion    | 8           | Active             |
| Code          | 7           | Active             |
| QR            | 3           | Active             |
| Password      | 4           | Active             |
| Color         | 3           | Active             |
| Unit          | 6           | Active             |
| Currency      | 2           | Active             |
| Document      | 4           | Active             |
| Social        | 10          | Active             |
| SEO & Web     | 3           | Active             |
| Miscellaneous | 8           | Active             |
| Encryption    | 24          | Active             |
| Clock         | 4           | Active             |
| Share         | 2           | Active             |
| Internet      | 1           | Active             |
| Markdown      | 5           | Active             |
| Text          | 10          | Active             |
| Network       | 6           | Active             |
| Finance       | 8           | Active             |
| Datetime      | 6           | Active             |
| Media         | 7           | Active             |
| Data          | 8           | Active             |
| Link          | 3           | Active             |
| Random        | 6           | Active             |
| Health        | 6           | Active             |
| Business      | 7           | Active             |
| AI            | 5           | Mostly coming soon |
| Blockchain    | 4           | Mostly coming soon |
| Privacy       | 5           | Active             |

---

## Future Tools to Implement (Theme-Based)

### Priority 1: AI Tools (High Demand)

- [ ] AI Text Summarizer - Summarize long articles with AI
- [ ] AI Paraphrasing Tool - Rewrite content maintaining meaning
- [ ] AI Content Generator - Generate articles, blog posts
- [ ] AI Grammar Checker - Fix grammar, spelling, punctuation

### Priority 2: Video/Audio Tools

- [ ] Video Compressor - Compress video files
- [ ] Audio Trimmer - Trim audio files
- [ ] Video to Audio Converter - Extract audio from video
- [ ] Audio Joiner - Combine multiple audio files

### Priority 3: Advanced Crypto Tools

- [ ] NFT Rarity Calculator - Calculate NFT trait rarity
- [ ] Wallet Generator - Generate crypto wallet addresses
- [ ] Gas Calculator - Estimate Ethereum gas fees

### Priority 4: Developer Tools

- [ ] Regex Tester - Test regular expressions
- [ ] UUID Generator - Generate UUIDs
- [ ] Cron Expression Builder - Build cron expressions
- [ ] JWT Decoder - Decode JWT tokens
- [ ] Hash Generator - Generate hashes (MD5, SHA)

### Priority 5: Fun Tools

- [ ] ASCII Art Generator - Convert text to ASCII art
- [ ] Emoji Converter - Convert text to emoji
- [ ] Zalgo Text Generator - Add zalgo characters

---

## OG Image Solution (For Implementation)

### Problem

The Vercel Edge API (`api/og.tsx`) keeps crashing with 500 errors. Various approaches tried:

- Node.js runtime
- Edge runtime
- JSX syntax
- Plain JS
- TypeScript
- With/without fonts
- With/without gradients

All resulted in `FUNCTION_INVOCATION_FAILED` or empty responses.

### Recommended Solution: Static Generation at Build Time

The solution is to generate OG images at build time rather than at runtime:

#### Option A: Use Satori in Build Script

Generate OG images during the build process using `@vercel/og`:

```typescript
// scripts/generate-og-images.ts
import { ImageResponse } from '@vercel/og';
import fs from 'fs';

// Generate all tool OG images at build time
for (const category of toolCategories) {
  for (const tool of category.subTools) {
    const img = new ImageResponse(...)
    fs.writeFileSync(`dist/og/${tool.id}.png`, img);
  }
}
```

#### Option B: Use Canvas/Puppeteer

Pre-render all OG images using Puppeteer:

```typescript
// scripts/generate-og-images.ts
import puppeteer from "puppeteer";

// Visit each tool page and screenshot for OG
const browser = await puppeteer.launch();
for (const tool of tools) {
  await page.goto(`https://snaptools.xyz/tools/${tool.category}/${tool.id}`);
  await page.screenshot({ path: `dist/og/${tool.id}.png` });
}
```

#### Option C: Use Cloudflare Images / imgix

Outsource OG image generation to a service.

#### Option D: Use og:image meta with unique images per tool

Each tool page references a unique pre-generated image:

```html
<meta property="og:image" content="https://snaptools.xyz/og/pdf-merger.png" />
```

---

## OG API Fix - For Reference

### What Was Tried

1. Edge runtime with JSX - blank response (Content-Length: 0)
2. Node.js runtime - crashes with 500
3. Plain JS .js file - crashes
4. Plain JS .jsx file - crashes (route structure `/api/og/index.jsx`)
5. TypeScript .tsx file - crashes

### What Worked Locally

- `vite-plugin-og.ts` works perfectly in local dev
- Uses `@resvg/resvg-js` to render PNG
- Uses `@fontsource/inter` for fonts

### Likely Root Cause

- Vercel's Edge runtime has issues with `@vercel/og`
- Node.js runtime may have memory/timeout issues
- Font loading fails at runtime on Vercel

---

## Implementation Checklist

- [ ] Fix OG API (using build-time generation)
- [ ] Implement AI tools (Priority 1)
- [ ] Implement video/audio tools (Priority 2)
- [ ] Implement blockchain tools (Priority 3)
- [ ] Implement developer tools (Priority 4)
- [ ] Implement fun tools (Priority 5)
- [ ] Add more sub-tools to existing categories

---

## Notes

- All existing tool components are in `src/components/tools/[category]/`
- Tool pages are auto-generated from the data
- SEO meta tags are handled in `src/components/seo/ToolSEO.tsx`
- Static pages generated in `scripts/generate-static-pages.ts`
