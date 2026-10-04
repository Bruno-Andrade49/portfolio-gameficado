import { seo } from "@/data/seo";

type Env = Record<string, string | undefined>;

export function siteUrl(env: Env = process.env): string {
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return seo.fallbackUrl;
}
