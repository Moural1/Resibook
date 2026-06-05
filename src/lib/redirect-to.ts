import { NextResponse } from "next/server";

export function redirectTo(path: string, request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const originHeader = request.headers.get("origin");

  const rawHost =
    forwardedHost ||
    hostHeader ||
    (originHeader ? new URL(originHeader).host : "localhost:3000");

  const proto =
    request.headers.get("x-forwarded-proto") ||
    (rawHost.includes("localhost") ? "http" : "https");

  const normalizedHost = rawHost.includes("github.dev")
    ? rawHost.replace(/:\d+$/, "")
    : rawHost;

  return NextResponse.redirect(`${proto}://${normalizedHost}${path}`, 303);
}