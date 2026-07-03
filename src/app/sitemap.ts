import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  const now = new Date();

  return [
    { url: host, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${host}/termos`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${host}/privacidade`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
