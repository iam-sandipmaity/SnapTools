/**
 * Vite dev-server plugin that handles /api/og locally.
 * Uses satori (already installed via @vercel/og) + @resvg/resvg-js to
 * render an OG image PNG without needing Vercel's Edge runtime.
 *
 * All heavy imports are DYNAMIC so they don't break Vite's config bundling.
 */

import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Category gradient map (mirrors api/og.tsx)
// ---------------------------------------------------------------------------
const categoryGradients: Record<string, { from: string; to: string }> = {
  image: { from: '#06b6d4', to: '#3b82f6' },
  pdf: { from: '#f43f5e', to: '#fb923c' },
  calculator: { from: '#10b981', to: '#06b6d4' },
  conversion: { from: '#f59e0b', to: '#ef4444' },
  code: { from: '#8b5cf6', to: '#6366f1' },
  qr: { from: '#f59e0b', to: '#ef4444' },
  password: { from: '#ec4899', to: '#f43f5e' },
  color: { from: '#d946ef', to: '#8b5cf6' },
  unit: { from: '#3b82f6', to: '#06b6d4' },
  currency: { from: '#10b981', to: '#3b82f6' },
  social: { from: '#ef4444', to: '#f59e0b' },
  seoandweb: { from: '#6366f1', to: '#8b5cf6' },
  miscellaneous: { from: '#8b5cf6', to: '#d946ef' },
  encryption: { from: '#f59e0b', to: '#ef4444' },
  clock: { from: '#8b5cf6', to: '#d946ef' },
  file: { from: '#6366f1', to: '#8b5cf6' },
  internet: { from: '#3b82f6', to: '#06b6d4' },
  markdown: { from: '#10b981', to: '#3b82f6' },
  text: { from: '#3b82f6', to: '#06b6d4' },
  network: { from: '#8b5cf6', to: '#6366f1' },
  finance: { from: '#10b981', to: '#3b82f6' },
  datetime: { from: '#f59e0b', to: '#ef4444' },
  media: { from: '#f43f5e', to: '#fb923c' },
  data: { from: '#3b82f6', to: '#06b6d4' },
  link: { from: '#10b981', to: '#3b82f6' },
  random: { from: '#f59e0b', to: '#ef4444' },
  health: { from: '#f43f5e', to: '#fb923c' },
  business: { from: '#8b5cf6', to: '#6366f1' },
  ai: { from: '#3b82f6', to: '#06b6d4' },
  blockchain: { from: '#f59e0b', to: '#ef4444' },
  privacy: { from: '#10b981', to: '#3b82f6' },
};

// ---------------------------------------------------------------------------
// Try to load a font buffer from @fontsource/inter (installed locally)
// Satori requires OTF or WOFF (not WOFF2) font data.
// ---------------------------------------------------------------------------
function loadFont(weight: 400 | 700 | 900 = 400): ArrayBuffer | null {
  // Prefer .woff (WOFF2 is NOT supported by satori/resvg)
  const candidates = [
    resolve(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`),
  ];
  for (const p of candidates) {
    try {
      const buf = readFileSync(p);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    } catch {
      // try next
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build the satori element tree (same design as api/og.tsx)
// ---------------------------------------------------------------------------
function buildTree(
  title: string,
  description: string,
  categoryId: string,
) {
  const gradient = categoryGradients[categoryId] ?? categoryGradients.miscellaneous;

  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#09090b',
        padding: '40px',
      },
      children: [
        // Logo top-left
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    display: 'flex',
                  },
                  children: [
                    'Snap',
                    {
                      type: 'span',
                      props: { style: { color: '#3b82f6' }, children: 'Tools' },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    marginLeft: '16px',
                    padding: '4px 12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                  },
                  children: 'Professional Suite',
                },
              },
            ],
          },
        },
        // Main card
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '40px',
              padding: '80px',
              width: '1000px',
              height: '480px',
              position: 'relative',
              overflow: 'hidden',
            },
            children: [
              // Background accent circle
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: '-150px',
                    right: '-150px',
                    width: '500px',
                    height: '500px',
                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                    opacity: 0.15,
                    borderRadius: '50%',
                  },
                },
              },
              // Icon box
              {
                type: 'div',
                props: {
                  style: {
                    width: '110px',
                    height: '110px',
                    borderRadius: '28px',
                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '40px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: { style: { fontSize: '50px' }, children: '🛠️' },
                    },
                  ],
                },
              },
              // Title + description
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '72px',
                          fontWeight: '900',
                          color: 'white',
                          letterSpacing: '-0.04em',
                          lineHeight: '1.1',
                        },
                        children: title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '32px',
                          color: 'rgba(255,255,255,0.5)',
                          maxWidth: '800px',
                          lineHeight: '1.4',
                          fontWeight: '400',
                        },
                        children: description,
                      },
                    },
                  ],
                },
              },
              // Bottom badge
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    bottom: '60px',
                    right: '80px',
                    display: 'flex',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          color: 'rgba(255,255,255,0.25)',
                          fontSize: '16px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '3px',
                        },
                        children: '100% Free • Secure • No Ads',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Footer URL
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '40px',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '20px',
              fontWeight: '500',
              letterSpacing: '1px',
            },
            children: 'snaptools.xyz',
          },
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Vite plugin
// ---------------------------------------------------------------------------
export default function ogPlugin(): Plugin {
  let fonts: { data: ArrayBuffer; weight: number }[] | null = null;

  function ensureFonts() {
    if (fonts) return fonts;

    const loaded: { data: ArrayBuffer; weight: number }[] = [];
    for (const w of [400, 700, 900] as const) {
      const buf = loadFont(w);
      if (buf) loaded.push({ data: buf, weight: w });
    }

    if (loaded.length === 0) {
      throw new Error(
        '@fontsource/inter .woff files not found. Run: npm install @fontsource/inter --save-dev',
      );
    }

    fonts = loaded;
    return fonts;
  }

  return {
    name: 'vite-plugin-og',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/og')) return next();

        try {
          // Dynamic imports — only loaded on first OG request, not at config parse time
          const [{ default: satori }, { Resvg }] = await Promise.all([
            import('satori'),
            import('@resvg/resvg-js'),
          ]);

          const base = `http://localhost`;
          const url = new URL(req.url, base);

          const title = url.searchParams.get('title') || 'SnapTools';
          const description =
            url.searchParams.get('description') ||
            'Free Online Professional Tools Collection';
          const categoryId = url.searchParams.get('category') || 'miscellaneous';

          const loadedFonts = ensureFonts();

          const svg = await satori(
            buildTree(title, description, categoryId) as any,
            {
              width: 1200,
              height: 630,
              fonts: loadedFonts.map((f) => ({
                name: 'Inter',
                data: f.data,
                weight: f.weight as any,
                style: 'normal' as const,
              })),
            },
          );

          const resvg = new Resvg(svg, {
            fitTo: { mode: 'width', value: 1200 },
          });
          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();

          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.end(pngBuffer);
        } catch (err: any) {
          console.error('[og-plugin] Error generating OG image:', err);
          res.statusCode = 500;
          res.end(`OG generation error: ${err.message}`);
        }
      });
    },
  };
}
