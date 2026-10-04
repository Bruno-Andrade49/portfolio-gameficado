import { worlds, type ProjectCategory, type ShowcaseEntry } from "@/data/projects";
import type { Repo } from "./github";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  highlights: string[];
  tags: string[];
  category: ProjectCategory;
  badge: string | null;
  featured: boolean;
  date: string;
  year: number;
  worldId: number;
  images: string[];
  cover: string;
  liveUrl: string | null;
  repoUrl: string | null;
  language: string | null;
  stars: number;
};

export type ProjectAssets = {
  shots: Record<string, string>;
  cards: Record<string, string>;
  githubUser: string;
};

const worldFor = (year: number) =>
  (worlds.find((w) => w.match(year)) ?? worlds[worlds.length - 1]).id;

const normalizeUrl = (url: string | null) =>
  !url ? null : url.startsWith("http") ? url : `https://${url}`;

export function buildProjects(
  repos: Repo[],
  entries: ShowcaseEntry[],
  assets: ProjectAssets,
): Project[] {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

  return entries.flatMap((e) => {
    const r = byName.get(e.repo.toLowerCase());
    if (!r) {
      console.warn(`[projects] repositório da vitrine não encontrado: ${e.repo}`);
      return [];
    }
    const slug = r.name.toLowerCase();
    const year = new Date(r.created_at).getUTCFullYear();
    const shot = assets.shots[slug];
    const project: Project = {
      slug,
      title: e.title,
      summary: e.summary,
      highlights: e.highlights ?? [],
      tags: e.tags,
      category: e.category,
      badge: e.badge ?? null,
      featured: e.featured ?? false,
      date: r.created_at,
      year,
      worldId: worldFor(year),
      images: shot ? [shot] : [],
      cover:
        shot ??
        assets.cards[slug] ??
        `https://opengraph.githubassets.com/1/${assets.githubUser}/${r.name}`,
      liveUrl: shot ? normalizeUrl(r.homepage) : null,
      repoUrl: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
    };
    return [project];
  });
}

export const sortByDate = (projects: Project[]) =>
  [...projects].sort((a, b) => a.date.localeCompare(b.date));
