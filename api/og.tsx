import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "SnapTools";
    const category = url.searchParams.get("category") || "";

    // Category-based gradient colors
    const gradients: Record<string, { from: string; to: string }> = {
      image: { from: '#06b6d4', to: '#3b82f6' },
      pdf: { from: '#f43f5e', to: '#fb923c' },
      calculator: { from: '#10b981', to: '#06b6d4' },
      conversion: { from: '#f59e0b', to: '#ef4444' },
      code: { from: '#8b5cf6', to: '#6366f1' },
      default: { from: '#3b82f6', to: '#8b5cf6' },
    };

    const gradient = gradients[category] || gradients.default;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            fontFamily: "Inter, sans-serif",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: 60,
              color: "white",
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: "20px",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            SnapTools - Free Online Utilities
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Error generating image: " + String(error), { status: 500 });
  }
}

