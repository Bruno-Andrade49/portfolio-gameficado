import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
import { profile } from "@/data/profile";
import { seo } from "@/data/seo";
import { ThemeSync } from "@/components/ThemeSync";
import { siteUrl } from "@/lib/site-url";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const pixelify = Pixelify_Sans({ variable: "--font-pixelify", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: seo.title, template: seo.titleTemplate },
  description: seo.description,
  applicationName: seo.siteName,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  keywords: seo.keywords,
  category: "technology",
  openGraph: {
    type: "website",
    locale: seo.locale,
    url: "/",
    siteName: seo.siteName,
    title: seo.title,
    description: seo.description,
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${pixelify.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
