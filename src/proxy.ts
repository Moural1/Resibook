import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDisabledCommercialRoute } from "@/lib/product-config";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/register", "/termos", "/privacidade", "/aceite-legal"];
const GUEST_EMAIL = "convidado@resibook.com";
const GUEST_ALLOWED_PATHS = ["/prescricao", "/caso-rapido", "/topicos", "/cids", "/exames-evolucao", "/termos", "/privacidade", "/aceite-legal", "/suporte"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );
}

function isGuestAllowedPath(pathname: string) {
  return GUEST_ALLOWED_PATHS.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isPublicRoute(pathname)) return NextResponse.next();

  if (isDisabledCommercialRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.set("recurso", "indisponivel");
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const isGuest = (user.email?.trim().toLowerCase() || "") === GUEST_EMAIL;
  if (isGuest && !isGuestAllowedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/prescricao";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo-resibook.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

