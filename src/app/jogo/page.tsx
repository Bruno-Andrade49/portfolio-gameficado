import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { GameLoader } from "@/components/game/GameLoader";
import { profile } from "@/data/profile";
import { seo } from "@/data/seo";
import { getProjects, getStats, sortByDate } from "@/lib/projects";

export const metadata: Metadata = {
  title: seo.gameTitle,
  description: seo.gameDescription,
  alternates: { canonical: "/jogo" },
  openGraph: {
    type: "website",
    locale: seo.locale,
    url: "/jogo",
    siteName: seo.siteName,
    title: `${seo.gameTitle} | ${seo.siteName}`,
    description: seo.gameDescription,
  },
  twitter: { card: "summary_large_image", title: `${seo.gameTitle} | ${seo.siteName}`, description: seo.gameDescription },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0e" },
  ],
  viewportFit: "cover",
};

export default async function GamePage() {
  const projects = sortByDate(await getProjects());
  const stats = await getStats(projects);

  return (
    <>
      <div className="sr-only">
        <p>
          {profile.name}, {profile.role} em {profile.location}. {profile.bio}
        </p>
        <Link href="/">Ver o portfólio em uma página, sem 3D</Link>
      </div>
      <GameLoader projects={projects} stats={stats} />
    </>
  );
}
