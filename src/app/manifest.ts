import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResiBook - Banco clínico e workspace médico",
    short_name: "ResiBook",
    description: "Banco clínico organizado e acervo privado para médicos.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#09172d",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [{ src: "/resibook-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
