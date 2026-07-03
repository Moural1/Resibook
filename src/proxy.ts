import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isResibookAdmin } from "@/lib/auth-role";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal/constants";
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

type PendingCookie = { name: string; value: string; options: CookieOptions };

function applyCookies(response: NextResponse, cookies: PendingCookie[]) {
  cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

function apiError(message: string, status: number, code: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  if (isPublicRoute(pathname)) return NextResponse.next();

  if (isDisabledCommercialRoute(pathname)) {
    if (isApiRoute) {
      return apiError("Recurso indisponível nesta edição do Resibook.", 404, "feature_disabled");
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.set("recurso", "indisponivel");
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.next();
  const pendingCookies: PendingCookie[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (isApiRoute) {
      return applyCookies(
        apiError("Sessão não autenticada.", 401, "unauthenticated"),
        pendingCookies
      );
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return applyCookies(NextResponse.redirect(redirectUrl), pendingCookies);
  }

  const normalizedEmail = user.email?.trim().toLowerCase() || "";
  if (normalizedEmail && !isResibookAdmin(user)) {
    const { data: blockedUser, error: blockedError } = await supabase
      .from("blocked_users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (blockedError) {
      if (isApiRoute) {
        return applyCookies(
          apiError("Não foi possível validar a permissão da conta.", 503, "access_check_failed"),
          pendingCookies
        );
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "access-check");
      return applyCookies(NextResponse.redirect(redirectUrl), pendingCookies);
    }

    if (blockedUser) {
      await supabase.auth.signOut();

      if (isApiRoute) {
        return applyCookies(
          apiError("Conta bloqueada pelo administrador.", 403, "account_blocked"),
          pendingCookies
        );
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("blocked", "1");
      return applyCookies(NextResponse.redirect(redirectUrl), pendingCookies);
    }
  }

  const isGuest = (user.email?.trim().toLowerCase() || "") === GUEST_EMAIL;
  if (isGuest && !isGuestAllowedPath(pathname)) {
    if (isApiRoute) {
      return applyCookies(
        apiError("Recurso indisponível no acesso de demonstração.", 403, "guest_forbidden"),
        pendingCookies
      );
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/prescricao";
    return applyCookies(NextResponse.redirect(redirectUrl), pendingCookies);
  }

  if (!isGuest) {
    const { data: legalAcceptance, error: legalError } = await supabase
      .from("user_legal_acceptances")
      .select("terms_version, privacy_version")
      .eq("user_id", user.id)
      .maybeSingle();
    const acceptedCurrentLegal =
      legalAcceptance?.terms_version === TERMS_VERSION &&
      legalAcceptance?.privacy_version === PRIVACY_VERSION;

    if (legalError || !acceptedCurrentLegal) {
      if (isApiRoute) {
        return applyCookies(
          apiError(
            legalError
              ? "Não foi possível validar o aceite legal."
              : "Aceite os termos e a política de privacidade para continuar.",
            legalError ? 503 : 403,
            legalError ? "legal_check_failed" : "legal_acceptance_required"
          ),
          pendingCookies
        );
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/aceite-legal";
      redirectUrl.search = "";
      if (legalError) redirectUrl.searchParams.set("error", "validation");
      return applyCookies(NextResponse.redirect(redirectUrl), pendingCookies);
    }
  }

  return applyCookies(response, pendingCookies);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo-resibook.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

