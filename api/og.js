import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "nodejs",
};

export default function handler(req) {
  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "SnapTools";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0f",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 80, color: "white", fontWeight: 900 }}>
            {title}
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch (error) {
    return new Response("Error: " + String(error), { status: 500 });
  }
}
