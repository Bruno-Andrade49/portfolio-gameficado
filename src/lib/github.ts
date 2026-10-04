import { cacheLife } from "next/cache";
import { GITHUB_USER } from "@/data/profile";
import snapshot from "@/data/repos-snapshot.json";

export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  size: number;
  topics: string[];
  created_at: string;
  pushed_at: string;
};

export async function getRepos(): Promise<Repo[]> {
  "use cache";
  cacheLife("days");

  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`,
      { headers },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return (await res.json()) as Repo[];
  } catch (err) {
    console.warn("[github] usando snapshot local:", (err as Error).message);
    return snapshot as Repo[];
  }
}
