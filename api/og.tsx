import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

// Category gradients map (matching vite-plugin-og.ts)
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

// Try to fetch Inter font at runtime (optional fallback)
async function fetchFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.arrayBuffer();
    }
  } catch (e) {
    console.error("Font load warning:", e);
  }
  return null;
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "SnapTools";
    const description = url.searchParams.get("description") || "Free Online Professional Tools Collection";
    const category = url.searchParams.get("category") || "miscellaneous";

    const gradient = categoryGradients[category] || categoryGradients.miscellaneous;
    const categoryName = category === "miscellaneous" ? "Tool" : category;
    const emoji = categoryEmojis[category] || "🛠️";

    // Load fonts (Inter) optionally
    const fontsOption: any[] = [];
    const interRegPromise = fetchFont("https://rsms.me/inter/font-files/Inter-Regular.woff");
    const interBoldPromise = fetchFont("https://rsms.me/inter/font-files/Inter-Bold.woff");
    
    const [interReg, interBold] = await Promise.all([interRegPromise, interBoldPromise]);
    
    if (interReg) {
      fontsOption.push({
        name: "Inter",
        data: interReg,
        weight: 400,
        style: "normal",
      });
    }
    if (interBold) {
      fontsOption.push({
        name: "Inter",
        data: interBold,
        weight: 700,
        style: "normal",
      });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0f',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: fontsOption.length > 0 ? 'Inter' : 'sans-serif',
          }}
        >
          {/* Large glow blob top-right */}
          <div
            style={{
              position: 'absolute',
              top: '-180px',
              right: '-180px',
              width: '560px',
              height: '560px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${gradient.from}30 0%, ${gradient.from}10 50%, transparent 70%)`,
              display: 'flex',
            }}
          />

          {/* Small glow blob bottom-left */}
          <div
            style={{
              position: 'absolute',
              bottom: '-120px',
              left: '-120px',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${gradient.to}20 0%, ${gradient.to}08 50%, transparent 70%)`,
              display: 'flex',
            }}
          />

          {/* Subtle dot-grid overlay */}
          <div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              display: 'flex',
            }}
          />

          {/* Main content area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              padding: '60px 80px',
              gap: '72px',
              position: 'relative',
            }}
          >
            {/* Left: icon block */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Outer glow ring */}
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '48px',
                  background: `linear-gradient(135deg, ${gradient.from}33, ${gradient.to}22)`,
                  border: `2px solid ${gradient.from}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Inner icon square */}
                <div
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '34px',
                    background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '64px', lineHeight: '1' }}>{emoji}</span>
                </div>
              </div>
            </div>

            {/* Right: text block */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                flex: 1,
              }}
            >
              {/* Category & Free pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 18px',
                    borderRadius: '999px',
                    background: `linear-gradient(135deg, ${gradient.from}22, ${gradient.to}22)`,
                    border: `1px solid ${gradient.from}55`,
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                      marginRight: '8px',
                    }}
                  />
                  <span
                    style={{
                      color: gradient.from,
                      fontSize: '16px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }}
                  >
                    {categoryName}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    padding: '6px 18px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '14px',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  100% Free
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: title.length > 25 ? '64px' : '80px',
                  fontWeight: '900',
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.0',
                  display: 'flex',
                }}
              >
                {title}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: '30px',
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: '1.5',
                  fontWeight: '400',
                  maxWidth: '700px',
                  display: 'flex',
                }}
              >
                {description}
              </div>
            </div>
          </div>

          {/* Bottom brand bar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 80px 36px',
              position: 'relative',
            }}
          >
            {/* Brand name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '-0.02em',
                }}
              >
                Snap
              </span>
              <span
                style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: gradient.from,
                  letterSpacing: '-0.02em',
                }}
              >
                Tools
              </span>
              <span
                style={{
                  marginLeft: '10px',
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.2)',
                  fontWeight: '400',
                }}
              >
                — snaptools.xyz
              </span>
            </div>

            {/* Right: feature pills */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
              }}
            >
              {['No Sign-up', 'No Ads', 'Secure'].map((label) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '16px',
                    fontWeight: '500',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontsOption.length > 0 ? fontsOption : undefined,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Error generating image: " + String(error), { status: 500 });
  }
}
