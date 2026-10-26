import type { NextConfig } from "next";

/* Content-Security-Policy: só o próprio site, o Supabase do projeto e a
   Vercel Analytics podem carregar scripts ou receber dados. 'unsafe-inline'
   continua necessário para os scripts inline do Next e do tema; o ganho está
   em bloquear scripts de outros domínios, envio de dados para fora, <object>,
   troca de <base> e o site dentro de iframes. */
function contentSecurityPolicy() {
  const supabase = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin;
    } catch {
      return "https://*.supabase.co";
    }
  })();
  const dev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${supabase} ${supabase.replace(/^https:/, "wss:")} https://va.vercel-scripts.com${dev ? " ws:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
