import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { toolCategories } from "../src/data/tools.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://snaptools.xyz";
const DIST_DIR = path.join(__dirname, "../dist");
const OG_DIR = path.join(DIST_DIR, "og");

const categoryGradients: Record<string, { from: string; to: string }> = {
  image: { from: "#06b6d4", to: "#3b82f6" },
  pdf: { from: "#f43f5e", to: "#fb923c" },
  calculator: { from: "#10b981", to: "#06b6d4" },
  conversion: { from: "#f59e0b", to: "#ef4444" },
  code: { from: "#8b5cf6", to: "#6366f1" },
  qr: { from: "#f59e0b", to: "#ef4444" },
  password: { from: "#ec4899", to: "#f43f5e" },
  color: { from: "#d946ef", to: "#8b5cf6" },
  unit: { from: "#3b82f6", to: "#06b6d4" },
  currency: { from: "#10b981", to: "#3b82f6" },
  social: { from: "#ef4444", to: "#f59e0b" },
  seoandweb: { from: "#6366f1", to: "#8b5cf6" },
  miscellaneous: { from: "#8b5cf6", to: "#d946ef" },
  encryption: { from: "#f59e0b", to: "#ef4444" },
  clock: { from: "#8b5cf6", to: "#d946ef" },
  file: { from: "#6366f1", to: "#8b5cf6" },
  internet: { from: "#3b82f6", to: "#06b6d4" },
  markdown: { from: "#10b981", to: "#3b82f6" },
  text: { from: "#3b82f6", to: "#06b6d4" },
  network: { from: "#8b5cf6", to: "#6366f1" },
  finance: { from: "#10b981", to: "#3b82f6" },
  datetime: { from: "#f59e0b", to: "#ef4444" },
  media: { from: "#f43f5e", to: "#fb923c" },
  data: { from: "#3b82f6", to: "#06b6d4" },
  link: { from: "#10b981", to: "#3b82f6" },
  random: { from: "#f59e0b", to: "#ef4444" },
  health: { from: "#f43f5e", to: "#fb923c" },
  business: { from: "#8b5cf6", to: "#6366f1" },
  ai: { from: "#3b82f6", to: "#06b6d4" },
  blockchain: { from: "#f59e0b", to: "#ef4444" },
  privacy: { from: "#10b981", to: "#3b82f6" },
};

function generateSvg(
  title: string,
  description: string,
  categoryId: string,
): string {
  const gradient =
    categoryGradients[categoryId] || categoryGradients.miscellaneous;
  const categoryName = categoryId === "miscellaneous" ? "Tool" : categoryId;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <radialGradient id="glow1" cx="${gradient.from}" cy="0%" r="50%">
      <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="${gradient.to}" cy="100%" r="50%">
      <stop offset="0%" style="stop-color:${gradient.to};stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:transparent"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <ellipse cx="1000" cy="-100" rx="400" ry="400" fill="url(#glow1)"/>
  <ellipse cx="200" cy="730" rx="300" ry="300" fill="url(#glow2)"/>
  <g transform="translate(100, 630)">
    <rect x="300" y="-350" width="200" height="200" rx="40" fill="none" stroke="${gradient.from}" stroke-width="2" opacity="0.3"/>
    <rect x="310" y="-340" width="180" height="180" rx="30" fill="${gradient.from}" opacity="0.8"/>
    <text x="400" y="-220" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">${categoryName.charAt(0).toUpperCase()}</text>
  </g>
  <g transform="translate(500, 280)">
    <text x="0" y="-80" font-family="Arial, sans-serif" font-size="16" fill="${gradient.from}" font-weight="bold" letter-spacing="3">${categoryName.toUpperCase()}</text>
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">${title.slice(0, 20)}</text>
    <text x="0" y="60" font-family="Arial, sans-serif" font-size="28" fill="#888" max-width="600">${description.slice(0, 50)}</text>
  </g>
  <g transform="translate(100, 600)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="20" fill="white" font-weight="bold">Snap</text>
    <text x="60" y="0" font-family="Arial, sans-serif" font-size="20" fill="${gradient.from}" font-weight="bold">Tools</text>
    <text x="180" y="0" font-family="Arial, sans-serif" font-size="16" fill="#555">snaptools.xyz</text>
  </g>
</svg>`;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateOgImages() {
  console.log("🎨 Generating static OG images...");

  ensureDir(OG_DIR);

  let count = 0;

  for (const category of toolCategories) {
    // Generate category OG image
    const catSvg = generateSvg(
      category.title,
      `Free online ${category.title.toLowerCase()} tools`,
      category.id,
    );
    fs.writeFileSync(path.join(OG_DIR, `cat-${category.id}.svg`), catSvg);
    count++;

    // Generate tool OG images
    if (category.subTools) {
      for (const tool of category.subTools) {
        const toolSvg = generateSvg(
          tool.title,
          tool.description || `Free online ${tool.title} tool`,
          category.id,
        );
        fs.writeFileSync(path.join(OG_DIR, `tool-${tool.id}.svg`), toolSvg);
        count++;
      }
    }
  }

  console.log(`✅ Generated ${count} static OG images in ${OG_DIR}/`);
}

generateOgImages().catch(console.error);
