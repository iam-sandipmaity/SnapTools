export const config = {
  runtime: "nodejs18.x",
};

export default async function handler(req: Request) {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "API is working",
      runtime: process.version,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
