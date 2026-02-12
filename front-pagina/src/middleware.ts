import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// In-memory cache for custom-domain → slug resolution
// ---------------------------------------------------------------------------
const domainCache = new Map<string, { slug: string; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function resolveCustomDomain(host: string): Promise<string | null> {
  const cached = domainCache.get(host);
  if (cached && cached.expires > Date.now()) {
    return cached.slug;
  }

  try {
    const apiUrl =
      process.env.INTERNAL_API_URL || "http://127.0.0.1:8100/api/v1/public";
    const res = await fetch(
      `${apiUrl}/resolve-domain/?host=${encodeURIComponent(host)}`,
      { headers: { Accept: "application/json" } },
    );

    if (res.ok) {
      const data = await res.json();
      domainCache.set(host, {
        slug: data.slug,
        expires: Date.now() + CACHE_TTL,
      });
      return data.slug;
    }
  } catch {
    // API unavailable — fall through
  }

  return null;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js paths, static files, and API/media proxies
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") || "";
  const platformDomain = process.env.PLATFORM_DOMAIN || "austinos.com";
  let slug: string | null = null;

  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    // Development: use env slug
    slug = process.env.DEV_SLUG || "demo";
  } else if (host.endsWith(`.${platformDomain}`)) {
    // Platform subdomain: hotel-arena-blanca.book.ink → hotel-arena-blanca
    slug = host.replace(`.${platformDomain}`, "");
  } else {
    // Custom domain: www.myhotel.com → resolve via API
    slug = await resolveCustomDomain(host);
  }

  if (!slug) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Rewrite: /habitaciones → /hotel-arena-blanca/habitaciones
  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|media|favicon.ico).*)"],
};
