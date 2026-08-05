import { env } from "cloudflare:workers";

type RouteContext = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { key } = await context.params;
  const objectKey = key.join("/");

  if (!objectKey.endsWith(".fbx") || objectKey.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.MOTION_FILES.get(objectKey);
  if (!object || !object.body) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=86400");
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/octet-stream");
  }

  return new Response(object.body, { headers });
}
