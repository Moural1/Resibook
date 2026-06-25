import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResiBook - Sistema Clínico",
    short_name: "ResiBook",
    description: "Apoio clínico, prontuário e ferramentas para o plantão.",
    start_url: "/plantao",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#09172d",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [{ src: "/resibook-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
