export const runtime = "edge";

export default async function handler(req: Request) {
  return new Response("OG API is working!", { status: 200 });
}
