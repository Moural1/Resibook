import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResiBook",
    short_name: "ResiBook",
    description: "Banco clínico organizado e acervo privado para médicos.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#09172d",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      { src: "/resibook-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Plantão", url: "/plantao" },
      { name: "ACLS", url: "/acls" },
      { name: "Calculadoras", url: "/calculadoras" },
    ],
  };
}
