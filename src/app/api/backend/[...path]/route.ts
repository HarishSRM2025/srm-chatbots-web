import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
const base = (process.env.DJANGO_API_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);
async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (
    path.some((p) => !/^[a-zA-Z0-9_-]+$/.test(p)) ||
    !["auth", "agents", "knowledge", "chat", "analytics", "health"].includes(
      path[0],
    )
  )
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  if (
    !["GET", "HEAD"].includes(request.method) &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json(
      { detail: "Invalid request origin." },
      { status: 403 },
    );
  const jar = await cookies();
  const endpoint = path.join("/") + "/";
  const config = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  if (endpoint === "auth/logout/") {
    jar.delete("srm-access");
    jar.delete("srm-refresh");
    return NextResponse.json({ ok: true });
  }
  const publicRequest =
    endpoint.startsWith("chat/widget/") ||
    ["auth/login/", "auth/register/", "health/"].includes(endpoint);
  if (
    endpoint.startsWith("auth/") &&
    !["auth/login/", "auth/register/"].includes(endpoint)
  )
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const headers = new Headers();
  for (const key of ["content-type", "x-widget-session", "idempotency-key"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  if (endpoint.startsWith("chat/widget/"))
    headers.set("Origin", request.nextUrl.origin);
  let access = jar.get("srm-access")?.value;
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  try {
    const refresh = async () => {
      const token = jar.get("srm-refresh")?.value;
      if (!token) return false;
      const r = await fetch(`${base}/api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: token }),
        cache: "no-store",
      });
      if (!r.ok) return false;
      const d = await r.json();
      access = d.access;
      jar.set("srm-access", d.access, { ...config, maxAge: 900 });
      if (d.refresh)
        jar.set("srm-refresh", d.refresh, { ...config, maxAge: 86400 });
      return true;
    };
    if (!publicRequest && !access && !(await refresh()))
      return NextResponse.json(
        { detail: "Please sign in to continue." },
        { status: 401 },
      );
    const send = () => {
      if (!publicRequest && access)
        headers.set("Authorization", `Bearer ${access}`);
      return fetch(`${base}/api/${endpoint}${request.nextUrl.search}`, {
        method: request.method,
        headers,
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(180000),
      });
    };
    let response = await send();
    if (response.status === 401 && !publicRequest && (await refresh()))
      response = await send();
    if (endpoint === "auth/login/" && response.ok) {
      const data = await response.json();
      jar.set("srm-access", data.access, { ...config, maxAge: 900 });
      jar.set("srm-refresh", data.refresh, { ...config, maxAge: 86400 });
      return NextResponse.json({ ok: true });
    }
    return new NextResponse(
      response.status === 204 ? null : await response.arrayBuffer(),
      {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("content-type") || "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        detail:
          "Cannot reach the API. Check that Django and its services are running.",
      },
      { status: 502 },
    );
  }
}
export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
};
