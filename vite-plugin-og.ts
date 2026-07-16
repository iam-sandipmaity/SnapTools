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

// Category emojis mapping
const categoryEmojis: Record<string, string> = {
  image: "🖼️",
  pdf: "📄",
  calculator: "🔢",
  conversion: "🔄",
  code: "💻",
  qr: "📱",
  password: "🔑",
  color: "🎨",
  unit: "📏",
  currency: "💵",
  social: "📢",
  seoandweb: "🔍",
  miscellaneous: "🛠️",
  encryption: "🔒",
  clock: "⏰",
  file: "📁",
  internet: "🌐",
  markdown: "📝",
  text: "✍️",
  network: "🕸️",
  finance: "📈",
  datetime: "📅",
  media: "🎥",
  data: "📊",
  link: "🔗",
  random: "🎲",
  health: "❤️",
  business: "💼",
  ai: "🧠",
  blockchain: "🪙",
  privacy: "🛡️",
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
// Build the satori element tree — redesigned card OG style
// ---------------------------------------------------------------------------
function buildTree(
  title: string,
  description: string,
  categoryId: string,
) {
  const gradient = categoryGradients[categoryId] ?? categoryGradients.miscellaneous;
  const emoji = categoryEmojis[categoryId] || '🛠️';

  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter',
      },
      children: [

        // ── Large glow blob top-right (no blur — resvg doesn't support CSS blur) ──
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-180px',
              right: '-180px',
              width: '560px',
              height: '560px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${gradient.from}30 0%, ${gradient.from}10 50%, transparent 70%)`,
            },
          },
        },

        // ── Small glow blob bottom-left ───────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-120px',
              left: '-120px',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${gradient.to}20 0%, ${gradient.to}08 50%, transparent 70%)`,
            },
          },
        },

        // ── Subtle dot-grid overlay ───────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: '0',
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            },
          },
        },

        // ── Main content area (flex row, vertically centred) ──────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              padding: '60px 80px',
              gap: '72px',
              position: 'relative',
            },
            children: [

              // Left: icon block
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0px',
                    flexShrink: 0,
                  },
                  children: [
                    // Outer glow ring
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '200px',
                          height: '200px',
                          borderRadius: '48px',
                          background: `linear-gradient(135deg, ${gradient.from}33, ${gradient.to}22)`,
                          border: `2px solid ${gradient.from}55`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 40px ${gradient.from}33`,
                        },
                        children: [
                          // Inner icon square
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: '140px',
                                height: '140px',
                                borderRadius: '34px',
                                background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 8px 32px ${gradient.from}44`,
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: { fontSize: '64px', lineHeight: '1' },
                                    children: emoji,
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Right: text block
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    flex: 1,
                  },
                  children: [

                    // Category pill
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px 18px',
                                borderRadius: '999px',
                                background: `linear-gradient(135deg, ${gradient.from}22, ${gradient.to}22)`,
                                border: `1px solid ${gradient.from}55`,
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                                      marginRight: '8px',
                                    },
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      color: gradient.from,
                                      fontSize: '16px',
                                      fontWeight: '700',
                                      textTransform: 'uppercase',
                                      letterSpacing: '2px',
                                    },
                                    children: categoryId === 'miscellaneous' ? 'Tool' : categoryId,
                                  },
                                },
                              ],
                            },
                          },
                          // Free badge
                          {
                            type: 'div',
                            props: {
                              style: {
                                padding: '6px 18px',
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '14px',
                                fontWeight: '600',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                              },
                              children: '100% Free',
                            },
                          },
                        ],
                      },
                    },

                    // Title
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '80px',
                          fontWeight: '900',
                          color: '#ffffff',
                          letterSpacing: '-0.03em',
                          lineHeight: '1.0',
                        },
                        children: title,
                      },
                    },

                    // Description
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '30px',
                          color: 'rgba(255,255,255,0.45)',
                          lineHeight: '1.5',
                          fontWeight: '400',
                          maxWidth: '700px',
                        },
                        children: description,
                      },
                    },

                  ],
                },
              },

            ],
          },
        },

        // ── Bottom brand bar ──────────────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 80px 36px',
              position: 'relative',
            },
            children: [
              // Brand name
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '26px',
                          fontWeight: '800',
                          color: 'rgba(255,255,255,0.9)',
                          letterSpacing: '-0.02em',
                        },
                        children: 'Snap',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '26px',
                          fontWeight: '800',
                          color: gradient.from,
                          letterSpacing: '-0.02em',
                        },
                        children: 'Tools',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginLeft: '10px',
                          fontSize: '18px',
                          color: 'rgba(255,255,255,0.2)',
                          fontWeight: '400',
                        },
                        children: '— snaptools.xyz',
                      },
                    },
                  ],
                },
              },

              // Right: feature pills
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                  },
                  children: ['No Sign-up', 'No Ads', 'Secure'].map((label) => ({
                    type: 'div',
                    props: {
                      style: {
                        padding: '6px 16px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '16px',
                        fontWeight: '500',
                      },
                      children: label,
                    },
                  })),
                },
              },
            ],
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
        // Normalize double-leading-slash (e.g. //api/og → /api/og)
        const normalizedUrl = req.url?.replace(/^\/+/, '/') ?? '';
        if (!normalizedUrl.startsWith('/api/og')) return next();

        try {
          // Dynamic imports — only loaded on first OG request, not at config parse time
          const [{ default: satori }, { Resvg }] = await Promise.all([
            import('satori'),
            import('@resvg/resvg-js'),
          ]);

          const base = `http://localhost`;
          const url = new URL(normalizedUrl, base);

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
