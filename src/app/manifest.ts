import type { MetadataRoute } from "next";
import { seo } from "@/data/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seo.title,
    short_name: seo.siteName,
    description: seo.description,
    start_url: "/",
    display: "browser",
    background_color: "#0f0d0e",
    theme_color: "#c8322b",
    lang: "pt-BR",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
