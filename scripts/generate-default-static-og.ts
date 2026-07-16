import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Gradient for default (SnapTools branding)
const defaultGradient = { from: "#3b82f6", to: "#8b5cf6" };

// Inter font loader helper
function loadFont(weight: 400 | 700 | 900 = 400): ArrayBuffer | null {
  const p = resolve(
    process.cwd(),
    `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`
  );
  try {
    const buf = readFileSync(p);
    return buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength
    ) as ArrayBuffer;
  } catch (e) {
    console.warn(`Warning: Could not load Inter weight ${weight} from ${p}`);
    return null;
  }
}

// Visual tree builder matching vite-plugin-og.ts
function buildTree(title: string, description: string, gradient: { from: string; to: string }) {
  return {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0f",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter",
      },
      children: [
        // Glow blob top-right
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "-180px",
              right: "-180px",
              width: "560px",
              height: "560px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${gradient.from}30 0%, ${gradient.from}10 50%, transparent 70%)`,
            },
          },
        },
        // Glow blob bottom-left
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "-120px",
              left: "-120px",
              width: "380px",
              height: "380px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${gradient.to}20 0%, ${gradient.to}08 50%, transparent 70%)`,
            },
          },
        },
        // Dot-grid overlay
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: "0",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            },
          },
        },
        // Main content
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              padding: "60px 80px",
              gap: "72px",
              position: "relative",
            },
            children: [
              // Icon Block
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "200px",
                          height: "200px",
                          borderRadius: "48px",
                          background: `linear-gradient(135deg, ${gradient.from}33, ${gradient.to}22)`,
                          border: `2px solid ${gradient.from}55`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 8px 40px ${gradient.from}33`,
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                width: "140px",
                                height: "140px",
                                borderRadius: "34px",
                                background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 8px 32px ${gradient.from}44`,
                              },
                              children: [
                                {
                                  type: "div",
                                  props: {
                                    style: { fontSize: "64px", lineHeight: "1" },
                                    children: "⚡",
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
              // Text Block
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    flex: 1,
                  },
                  children: [
                    // Pills
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                padding: "6px 18px",
                                borderRadius: "999px",
                                background: `linear-gradient(135deg, ${gradient.from}22, ${gradient.to}22)`,
                                border: `1px solid ${gradient.from}55`,
                              },
                              children: [
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                                      marginRight: "8px",
                                    },
                                  },
                                },
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      color: gradient.from,
                                      fontSize: "16px",
                                      fontWeight: "700",
                                      textTransform: "uppercase",
                                      letterSpacing: "2px",
                                    },
                                    children: "UTILITIES",
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                padding: "6px 18px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.4)",
                                fontSize: "14px",
                                fontWeight: "600",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                              },
                              children: "100% Free",
                            },
                          },
                        ],
                      },
                    },
                    // Title
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "80px",
                          fontWeight: "900",
                          color: "#ffffff",
                          letterSpacing: "-0.03em",
                          lineHeight: "1.0",
                        },
                        children: title,
                      },
                    },
                    // Description
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "30px",
                          color: "rgba(255,255,255,0.45)",
                          lineHeight: "1.5",
                          fontWeight: "400",
                          maxWidth: "700px",
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
        // Brand bar
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 80px 36px",
              position: "relative",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "26px",
                          fontWeight: "800",
                          color: "rgba(255,255,255,0.9)",
                          letterSpacing: "-0.02em",
                        },
                        children: "Snap",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "26px",
                          fontWeight: "800",
                          color: gradient.from,
                          letterSpacing: "-0.02em",
                        },
                        children: "Tools",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          marginLeft: "10px",
                          fontSize: "18px",
                          color: "rgba(255,255,255,0.2)",
                          fontWeight: "400",
                        },
                        children: "— snaptools.xyz",
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "row",
                    gap: "12px",
                  },
                  children: ["No Sign-up", "No Ads", "Secure"].map((label) => ({
                    type: "div",
                    props: {
                      style: {
                        padding: "6px 16px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "16px",
                        fontWeight: "500",
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

async function run() {
  console.log("🎨 Rendering default static OG fallback image...");

  const fonts: { data: ArrayBuffer; weight: number }[] = [];
  for (const w of [400, 700, 900] as const) {
    const buf = loadFont(w);
    if (buf) {
      fonts.push({ data: buf, weight: w });
    }
  }

  if (fonts.length === 0) {
    throw new Error("No Inter fonts could be loaded from node_modules. Run npm install @fontsource/inter --save-dev first.");
  }

  const svg = await satori(
    buildTree(
      "SnapTools",
      "100+ Free Online PDF, Image, Code & Conversion Utilities",
      defaultGradient
    ) as any,
    {
      width: 1200,
      height: 630,
      fonts: fonts.map((f) => ({
        name: "Inter",
        data: f.data,
        weight: f.weight as any,
        style: "normal" as const,
      })),
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const publicOgPath1 = resolve(process.cwd(), "public/og-image.jpg");
  const publicOgPath2 = resolve(process.cwd(), "public/og_image.jpg");

  writeFileSync(publicOgPath1, pngBuffer);
  writeFileSync(publicOgPath2, pngBuffer);

  console.log(`✅ Default OG fallbacks generated successfully:`);
  console.log(`   - ${publicOgPath1}`);
  console.log(`   - ${publicOgPath2}`);
}

run().catch((e) => {
  console.error("❌ Failed to generate static OG image:", e);
  process.exit(1);
});
