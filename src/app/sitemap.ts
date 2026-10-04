import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  return [
    { url: `${url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${url}/jogo`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
