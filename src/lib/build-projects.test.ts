import { describe, expect, it, vi } from "vitest";
import type { ShowcaseEntry } from "@/data/projects";
import { buildProjects, sortByDate } from "./build-projects";
import type { Repo } from "./github";

const repo = (name: string, over: Partial<Repo> = {}): Repo => ({
  name,
  description: null,
  html_url: `https://github.com/u/${name}`,
  homepage: null,
  language: "TypeScript",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  size: 10,
  topics: [],
  created_at: "2024-01-17T12:00:00Z",
  pushed_at: "2024-01-17T12:00:00Z",
  ...over,
});

const entry = (name: string, over: Partial<ShowcaseEntry> = {}): ShowcaseEntry => ({
  repo: name,
  title: name.toUpperCase(),
  summary: `Resumo ${name}`,
  tags: ["React"],
  category: "frontend",
  ...over,
});

const assets = { shots: {}, cards: {}, githubUser: "u" };

describe("buildProjects", () => {
  it("inclui só os repositórios da vitrine, na ordem da vitrine", () => {
    const out = buildProjects([repo("a"), repo("b"), repo("fora")], [entry("b"), entry("a")], assets);
    expect(out.map((p) => p.slug)).toEqual(["b", "a"]);
  });

  it("casa nomes sem diferenciar maiúsculas", () => {
    const out = buildProjects([repo("DTMoney")], [entry("dtmoney")], assets);
    expect(out).toHaveLength(1);
    expect(out[0].slug).toBe("dtmoney");
    expect(out[0].repoUrl).toBe("https://github.com/u/DTMoney");
  });

  it("ignora entrada sem repositório e avisa", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const out = buildProjects([repo("a")], [entry("a"), entry("sumiu")], assets);
    expect(out.map((p) => p.slug)).toEqual(["a"]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("sumiu"));
    warn.mockRestore();
  });

  it("usa o print local como capa e só então mostra o link do site", () => {
    const out = buildProjects(
      [repo("a", { homepage: "a.vercel.app" }), repo("b", { homepage: "https://b.dev" })],
      [entry("a"), entry("b")],
      { ...assets, shots: { a: "/projects/a.jpg" } },
    );
    expect(out[0]).toMatchObject({
      cover: "/projects/a.jpg",
      images: ["/projects/a.jpg"],
      liveUrl: "https://a.vercel.app",
    });
    expect(out[1]).toMatchObject({ images: [], liveUrl: null });
  });

  it("cai no card local do GitHub e depois no card remoto", () => {
    const out = buildProjects([repo("a"), repo("b")], [entry("a"), entry("b")], {
      ...assets,
      cards: { a: "/projects/github/a.png" },
    });
    expect(out[0].cover).toBe("/projects/github/a.png");
    expect(out[1].cover).toBe("https://opengraph.githubassets.com/1/u/b");
  });

  it("leva categoria, selo, destaques, ano e mundo", () => {
    const out = buildProjects(
      [repo("api", { created_at: "2021-10-30T12:00:00Z" })],
      [entry("api", { category: "backend", badge: "TCC", highlights: ["x"] })],
      assets,
    );
    expect(out[0]).toMatchObject({
      category: "backend",
      badge: "TCC",
      highlights: ["x"],
      year: 2021,
      worldId: 1,
      featured: false,
    });
  });

  it("usa padrões quando a entrada não tem selo nem destaques", () => {
    const [p] = buildProjects([repo("a")], [entry("a")], assets);
    expect(p.badge).toBeNull();
    expect(p.highlights).toEqual([]);
  });
});

describe("sortByDate", () => {
  it("ordena do mais antigo para o mais novo sem mutar a lista", () => {
    const list = buildProjects(
      [repo("novo", { created_at: "2026-01-01T12:00:00Z" }), repo("velho", { created_at: "2021-01-01T12:00:00Z" })],
      [entry("novo"), entry("velho")],
      assets,
    );
    expect(sortByDate(list).map((p) => p.slug)).toEqual(["velho", "novo"]);
    expect(list.map((p) => p.slug)).toEqual(["novo", "velho"]);
  });
});
