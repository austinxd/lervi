const API_BASE =
  process.env.INTERNAL_API_URL || "http://127.0.0.1:8100/api/v1/public";

async function proxy(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const slug = path.join("/");
  const { search } = new URL(request.url);
  const target = `${API_BASE}/${slug}/${search}`;

  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers["Content-Type"] = contentType || "application/json";
  }

  const auth = request.headers.get("authorization");
  if (auth) {
    headers["Authorization"] = auth;
  }

  let body: BodyInit | undefined;
  if (request.method !== "GET") {
    body = isMultipart
      ? Buffer.from(await request.arrayBuffer())
      : await request.text();
    if (isMultipart) {
      headers["Content-Type"] = contentType;
    }
  }

  const res = await fetch(target, {
    method: request.method,
    headers,
    body,
  });

  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
