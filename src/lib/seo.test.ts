import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteUrl } from "./site-url";
import { structuredData } from "./structured-data";

describe("siteUrl", () => {
  it("prioriza a URL de produção da Vercel", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "bruno.dev", NEXT_PUBLIC_SITE_URL: "https://x.com" })).toBe("https://bruno.dev");
  });
  it("depois NEXT_PUBLIC_SITE_URL, sem barra final", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://x.com/" })).toBe("https://x.com");
  });
  it("por fim o fallback", () => {
    expect(siteUrl({})).toBe("http://localhost:3000");
  });
});

describe("structuredData", () => {
  const data = structuredData("https://bruno.dev");
  const person = data["@graph"].find((n) => n["@type"] === "Person")!;
  it("descreve a pessoa com cargo e perfis, sem empresa atual", () => {
    expect(person).toMatchObject({
      name: "Bruno Andrade",
      jobTitle: "Desenvolvedor Front-end Pleno",
      url: "https://bruno.dev",
    });
    expect(person.worksFor).toBeUndefined();
    expect(person.sameAs).toEqual(
      expect.arrayContaining(["https://github.com/Bruno-Andrade49", "https://www.linkedin.com/in/brunoandrade-386b331b6"]),
    );
    expect(String(person.image)).toMatch(/^https:\/\/bruno\.dev\//);
  });
  it("inclui o WebSite ligado à pessoa", () => {
    expect(data["@graph"].some((n) => n["@type"] === "WebSite")).toBe(true);
  });
});

describe("rotas de metadados", () => {
  beforeEach(() => {
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("sitemap e robots usam URLs absolutas", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toEqual(["http://localhost:3000/", "http://localhost:3000/jogo"]);
    expect(robots().sitemap).toBe("http://localhost:3000/sitemap.xml");
  });
  it("manifest tem nome, cores e ícones", () => {
    const m = manifest();
    expect(m.name).toBe("Bruno Andrade | Desenvolvedor Front-end");
    expect(m.icons?.length).toBeGreaterThanOrEqual(2);
    expect(m.lang).toBe("pt-BR");
  });
});
