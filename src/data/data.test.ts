import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { careerStart, education, jobs } from "./experience";
import { attributes, profile } from "./profile";
import { showcase, tcc } from "./projects";
import snapshot from "./repos-snapshot.json";

const publicFile = (src: string) => existsSync(join(process.cwd(), "public", src));

describe("vitrine de projetos", () => {
  it("tem exatamente os projetos escolhidos, na ordem de curadoria", () => {
    expect(showcase.filter((e) => e.category === "frontend").map((e) => e.repo)).toEqual([
      "bruno-financas",
      "managment-clinic",
      "conecta",
      "fullstack-barberBooking",
      "DTMoney",
      "new-portfolio-bruno",
      "ssr-repository",
      "csr-repository",
    ]);
    expect(showcase.filter((e) => e.category === "backend").map((e) => e.repo)).toEqual([
      "springboot-tests",
      "Projeto_Site_Impulse",
      "petshop_BrunoApp",
      "BrMovie-SpringReact",
    ]);
  });

  it("todo repositório da vitrine existe no snapshot do GitHub", () => {
    const names = new Set((snapshot as { name: string }[]).map((r) => r.name.toLowerCase()));
    for (const e of showcase) expect(names.has(e.repo.toLowerCase()), e.repo).toBe(true);
  });

  it("só os dois repositórios do TCC levam o selo", () => {
    expect(showcase.filter((e) => e.badge === "TCC").map((e) => e.repo)).toEqual([
      "ssr-repository",
      "csr-repository",
    ]);
    expect(tcc.highlights.length).toBeGreaterThanOrEqual(2);
  });

  it("projetos de back-end explicam o que têm de técnico", () => {
    for (const e of showcase.filter((x) => x.category === "backend")) {
      expect(e.highlights?.length ?? 0, e.repo).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("experiência", () => {
  it("cargo atual é Pleno na Single Software", () => {
    expect(jobs[0].company).toBe("Single Software");
    expect(jobs[0].current).toBe(true);
    expect(jobs[0].roles.map((r) => r.title)).toEqual([
      "Desenvolvedor Front-end Pleno",
      "Desenvolvedor Front-end Júnior",
    ]);
    expect(jobs[0].roles[0].end).toBeNull();
  });

  it("depois vem a Impulse, com a galeria dos trabalhos de cliente", () => {
    expect(jobs.map((j) => j.company)).toEqual(["Single Software", "Impulse Business Solutions"]);
    const gallery = jobs[1].gallery ?? [];
    expect(gallery.map((g) => g.title)).toEqual(["CRM Impulse", "Site EasyData", "Lojas Tem Jeito"]);
    for (const g of gallery) expect(publicFile(g.src), g.src).toBe(true);
  });

  it("carreira começa na Impulse em nov/2022", () => {
    expect(careerStart.startsWith("2022-11")).toBe(true);
  });
});

describe("atributos", () => {
  it("tem os dez atributos com nível entre 0 e 10", () => {
    expect(attributes).toHaveLength(10);
    for (const a of attributes) {
      expect(a.level, a.name).toBeGreaterThanOrEqual(0);
      expect(a.level, a.name).toBeLessThanOrEqual(10);
    }
    expect(attributes.find((a) => a.name === "PostgreSQL")?.level).toBe(5);
  });
});

describe("textos", () => {
  it("períodos não usam travessão", () => {
    const periods = [education.period, ...jobs.flatMap((j) => [j.period, ...j.roles.map((r) => r.period)])];
    for (const p of periods) expect(p, p).not.toMatch(/[–—]/);
  });
});

describe("perfil", () => {
  it("expõe os contatos e o PDF do currículo existe", () => {
    expect(profile.email).toBe("brunoa71240@gmail.com");
    expect(profile.whatsapp).toBe("https://wa.me/5583982121351");
    expect(profile.linkedin).toBe("https://www.linkedin.com/in/brunoandrade-386b331b6");
    expect(publicFile(profile.resume)).toBe(true);
  });
});
