import { cacheLife } from "next/cache";
import { GITHUB_USER } from "@/data/profile";
import { showcase } from "@/data/projects";
import githubCards from "@/data/github-cards.json";
import screenshots from "@/data/screenshots.json";
import { buildProjects, type Project } from "./build-projects";
import { getRepos } from "./github";

export { sortByDate, type Project } from "./build-projects";

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("days");

  return buildProjects(await getRepos(), showcase, {
    shots: screenshots as Record<string, string>,
    cards: githubCards as Record<string, string>,
    githubUser: GITHUB_USER,
  });
}

export type JourneyStats = {
  repoCount: number;
  liveCount: number;
  languages: string[];
  stars: number;
  firstRepo: string;
  topTech: { name: string; count: number }[];
};

export async function getStats(projects: Project[]): Promise<JourneyStats> {
  "use cache";
  cacheLife("days");

  const repos = (await getRepos()).filter((r) => !r.fork);
  const tech = new Map<string, number>();
  for (const p of projects) {
    for (const t of p.tags) tech.set(t, (tech.get(t) ?? 0) + 1);
  }
  return {
    repoCount: repos.length,
    liveCount: projects.filter((p) => p.liveUrl).length,
    languages: [
      ...new Set(repos.map((r) => r.language).filter(Boolean) as string[]),
    ],
    stars: repos.reduce((n, r) => n + r.stargazers_count, 0),
    firstRepo: repos.map((r) => r.created_at).sort()[0],
    topTech: [...tech.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}
