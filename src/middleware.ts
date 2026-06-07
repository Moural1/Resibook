import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/register"];
const LEGAL_FREE_ROUTES = ["/termos", "/privacidade", "/aceite-legal"];
const GUEST_EMAIL = "convidado@resibook.com";
const TERMS_VERSION = "2026-06-07";
const PRIVACY_VERSION = "2026-06-07";

const GUEST_ALLOWED_PATHS = [
  "/prescricao",
  "/topicos",
  "/cids",
  "/exames-evolucao",
  "/termos",
  "/privacidade",
  "/aceite-legal",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isLegalFreeRoute(pathname: string) {
  return LEGAL_FREE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isGuestAllowedPath(pathname: string) {
  return GUEST_ALLOWED_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function buildRedirectParam(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search || "";
  return `${pathname}${search}`;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = isPublicRoute(pathname);

  if (!user) {
    if (isPublic || isLegalFreeRoute(pathname)) {
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", buildRedirectParam(request));

    return NextResponse.redirect(redirectUrl);
  }

  const email = user.email?.trim().toLowerCase() || "";
  const isGuest = email === GUEST_EMAIL;

  if (isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isGuest ? "/prescricao" : "/dashboard";
    redirectUrl.searchParams.delete("redirect");
    redirectUrl.searchParams.delete("blocked");
    return NextResponse.redirect(redirectUrl);
  }

  const { data: blockedUser } = await supabase
    .from("blocked_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (blockedUser && email !== "igormoura@resibook.com") {
    await supabase.auth.signOut();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("blocked", "1");
    redirectUrl.searchParams.delete("redirect");

    return NextResponse.redirect(redirectUrl);
  }

  const { data: legalAcceptance } = await supabase
    .from("user_legal_acceptances")
    .select("terms_version, privacy_version")
    .eq("user_id", user.id)
    .maybeSingle();

  const acceptedCurrentVersions =
    legalAcceptance?.terms_version === TERMS_VERSION &&
    legalAcceptance?.privacy_version === PRIVACY_VERSION;

  if (!acceptedCurrentVersions && !isLegalFreeRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/aceite-legal";
    return NextResponse.redirect(redirectUrl);
  }

  if (isGuest && !isGuestAllowedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/prescricao";
    redirectUrl.searchParams.delete("redirect");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-resibook.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};