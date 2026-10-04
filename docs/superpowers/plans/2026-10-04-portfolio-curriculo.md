# Portfólio: currículo claro + projetos curados — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a home-jogo por uma página profissional clara (currículo + projetos curados + contato), mantendo o jogo 3D em `/jogo`, com só os 12 repositórios escolhidos pelo Bruno.

**Architecture:** Dados do currículo viram módulos tipados (`src/data/profile.ts`, `src/data/experience.ts`), projetos passam a vir de uma allowlist (`showcase`) processada por uma função pura testável (`src/lib/build-projects.ts`). A home é feita de server components em `src/components/site/`; o jogo é movido para `src/app/jogo/` e seus painéis passam a ler os novos dados.

**Tech Stack:** Next.js 16.3 (App Router, `cacheComponents: true`, `"use cache"`), React 19, Tailwind CSS 4, `@phosphor-icons/react` (em server components use `@phosphor-icons/react/dist/ssr`), Vitest (novo, só dev), agent-browser (Vercel) para E2E.

**Spec:** `docs/superpowers/specs/2026-10-04-portfolio-curriculo-design.md`

## Global Constraints

- Todo texto visível em **português do Brasil**, sem travessão de diálogo; datas no formato `mai/2025`.
- Next.js 16 tem APIs diferentes do que você conhece: antes de usar uma API do Next, confira `node_modules/next/dist/docs/`. Em `next/image` use `preload` (não `priority`).
- `cacheComponents: true` está ligado: **não** use `new Date()`/`Date.now()` em server components fora de `"use cache"`.
- Server components não podem importar `@phosphor-icons/react` direto: use `@phosphor-icons/react/dist/ssr`.
- Identidade visual existente: tokens em `src/app/globals.css` (`bg`, `panel`, `panel-2`, `line`, `text`, `muted`, `accent`, `accent-text`), classes `pixel-box`, `pixel-btn`, fonte `font-pixel` só em títulos/rótulos; texto corrido em Geist (padrão do body).
- Layout funciona a partir de 360 px sem scroll horizontal da página.
- Contatos: e-mail `brunoa71240@gmail.com`, LinkedIn `https://www.linkedin.com/in/brunoandrade-386b331b6`, WhatsApp `https://wa.me/5583982121351`, telefone `(83) 98212-1351`, PDF `/curriculo-bruno-andrade.pdf`.
- Allowlist exata — front-end: `bruno-financas`, `managment-clinic`, `conecta`, `fullstack-barberBooking`, `DTMoney`, `new-portfolio-bruno`, `ssr-repository`, `csr-repository` (os dois últimos com `badge: "TCC"`); back-end: `springboot-tests`, `Projeto_Site_Impulse`, `petshop_BrunoApp`, `BrMovie-SpringReact`.
- **Implementadores não fazem `git commit`** (tarefas rodam em paralelo no mesmo working tree); o controlador commita após a revisão.

## Review Focus

- Repositório da allowlist renomeado/apagado no GitHub → a página continua buildando e só omite aquele card (Task 1, teste "ignora entrada sem repositório").
- API do GitHub fora do ar → snapshot cobre todos os repositórios da allowlist (Task 1, teste "todo repositório da vitrine existe no snapshot").
- Visitante no celular (375 px) → sem scroll horizontal, header utilizável (Task 4, E2E).
- Link antigo `/projetos` salvo/compartilhado → cai em `/#projetos` (Task 2 config, Task 4 E2E).
- Navegador sem WebGL em `/jogo` → fallback com link de volta para `/` (Task 2, Task 4 E2E); botão "Baixar currículo" → PDF responde 200 (Task 1 teste de arquivo, Task 4 E2E).

---

### Task 1: Camada de dados, allowlist e testes

**Files:**
- Modify: `package.json` (script `test`, devDependency `vitest`)
- Create: `vitest.config.ts`
- Modify: `src/data/profile.ts` (reescrita completa)
- Create: `src/data/experience.ts`
- Modify: `src/data/projects.ts` (reescrita completa)
- Modify: `src/data/github-cards.json` (nova chave `springboot-tests`)
- Create: `public/curriculo-bruno-andrade.pdf`, `public/projects/github/springboot-tests.png`
- Create: `src/lib/build-projects.ts`
- Modify: `src/lib/projects.ts` (reescrita completa)
- Test: `src/lib/build-projects.test.ts`, `src/data/data.test.ts`

**Interfaces:**
- Produces:
  - `profile` (`src/data/profile.ts`): `{ name, fullName, role, headline, location, bio, about: string[], github, email: string|null, linkedin: string|null, whatsapp: string|null, phone: string|null, resume: string, photos: { portrait, desk } }`; `GITHUB_USER`.
  - `src/data/experience.ts`: `type Role = { title; period; start; end: string|null; bullets: string[] }`, `type GalleryItem = { src; title; caption; href?: string }`, `type Job = { id; company; team?: string; location; period; current: boolean; roles: Role[]; stack: string[]; gallery?: GalleryItem[] }`, `jobs: Job[]` (mais recente primeiro), `careerStart: string`, `education: { course; school; location; period; summary }`, `skills: { group: string; items: string[] }[]`, `languages: { name: string; level: string }[]`, `highlights: { value: string; label: string }[]`.
  - `src/data/projects.ts`: `type ProjectCategory = "frontend" | "backend"`, `type ShowcaseEntry = { repo; title; summary; tags: string[]; category: ProjectCategory; highlights?: string[]; badge?: string; featured?: boolean }`, `showcase: ShowcaseEntry[]`, `tcc: { title; summary; highlights: string[] }`, `worlds: World[]`, `techIcons`.
  - `src/lib/build-projects.ts`: `type Project = { slug; title; summary; highlights: string[]; tags: string[]; category: ProjectCategory; badge: string|null; featured: boolean; date; year: number; worldId: number; images: string[]; cover: string; liveUrl: string|null; repoUrl: string|null; language: string|null; stars: number }`, `buildProjects(repos: Repo[], entries: ShowcaseEntry[], assets: ProjectAssets): Project[]` (ordem da allowlist), `sortByDate(projects: Project[]): Project[]`.
  - `src/lib/projects.ts`: `getProjects(): Promise<Project[]>` (ordem de curadoria), `getStats(projects)`, re-exporta `Project` e `sortByDate`.

- [ ] **Step 1: Instalar Vitest e configurar**

Run: `npm install -D vitest`

Em `package.json`, em `"scripts"`, adicionar `"test": "vitest run"`.

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: { environment: "node" },
});
```

- [ ] **Step 2: Copiar o PDF e baixar o card do springboot-tests**

```bash
cp "$HOME/Downloads/Curriculo-Bruno-Andrade (2).pdf" public/curriculo-bruno-andrade.pdf
curl -sL -o public/projects/github/springboot-tests.png https://opengraph.githubassets.com/1/Bruno-Andrade49/springboot-tests
```

Em `src/data/github-cards.json`, adicionar (ordem alfabética, depois de `"reposvg"`):
`"springboot-tests": "/projects/github/springboot-tests.png",`

Verifique: `ls -la public/curriculo-bruno-andrade.pdf public/projects/github/springboot-tests.png` (ambos > 0 bytes).

- [ ] **Step 3: Escrever os testes que falham**

Create `src/lib/build-projects.test.ts`:

```ts
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
```

Create `src/data/data.test.ts`:

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { jobs, careerStart } from "./experience";
import { profile } from "./profile";
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

describe("perfil", () => {
  it("expõe os contatos e o PDF do currículo existe", () => {
    expect(profile.email).toBe("brunoa71240@gmail.com");
    expect(profile.whatsapp).toBe("https://wa.me/5583982121351");
    expect(profile.linkedin).toBe("https://www.linkedin.com/in/brunoandrade-386b331b6");
    expect(publicFile(profile.resume)).toBe(true);
  });
});
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL (`./build-projects` e `./experience` não existem; `showcase`/`tcc` não exportados).

- [ ] **Step 5: Reescrever `src/data/profile.ts`**

```ts
export const GITHUB_USER = "Bruno-Andrade49";

export const profile = {
  name: "Bruno Andrade",
  fullName: "Bruno Emanuel de Barros Andrade",
  role: "Desenvolvedor Front-end Pleno",
  headline: "Vue 3 & Nuxt · Arquitetura, performance e SSR",
  location: "Campina Grande, PB",
  bio: "Construo interfaces rápidas, escaláveis e bem arquitetadas. Hoje evoluo uma plataforma multi-marca com SSR e alto volume de tráfego na Single Software.",
  about: [
    "Sou desenvolvedor front-end com quase 4 anos de experiência construindo interfaces eficientes, escaláveis e de alta performance. Hoje atuo na evolução de uma plataforma multi-marca em Vue 3 e Nuxt na Single Software, com foco em arquitetura de componentes, performance e padronização entre marcas.",
    "Sou bacharel em Sistemas de Informação pela Unifacisa, uma formação que combinou front-end e back-end (Java, Spring, Angular, SQL) com governança de TI e metodologias ágeis. Essa base me dá uma visão sistêmica das aplicações e facilita a comunicação com o time e a integração de APIs.",
    "Meu próximo passo é ganhar ainda mais profundidade técnica e assumir, aos poucos, mais responsabilidade sobre decisões de arquitetura e na condução de iniciativas do time.",
  ],
  github: `https://github.com/${GITHUB_USER}`,
  // Campos nulos ficam ocultos no site e no jogo.
  email: "brunoa71240@gmail.com" as string | null,
  linkedin: "https://www.linkedin.com/in/brunoandrade-386b331b6" as string | null,
  whatsapp: "https://wa.me/5583982121351" as string | null,
  phone: "(83) 98212-1351" as string | null,
  resume: "/curriculo-bruno-andrade.pdf",
  photos: {
    portrait: "/me/coding.jpg",
    desk: "/me/desk.jpg",
  },
};
```

- [ ] **Step 6: Criar `src/data/experience.ts`**

```ts
// Currículo: fonte de verdade para a home e para o painel de missões do jogo.

export type Role = {
  title: string;
  period: string;
  start: string;
  /** null = cargo atual. */
  end: string | null;
  bullets: string[];
};

export type GalleryItem = {
  src: string;
  title: string;
  caption: string;
  href?: string;
};

export type Job = {
  id: string;
  company: string;
  team?: string;
  location: string;
  period: string;
  current: boolean;
  /** Cargo mais recente primeiro. */
  roles: Role[];
  stack: string[];
  /** Trabalhos privados de cliente: só os prints podem ser mostrados. */
  gallery?: GalleryItem[];
};

/** Mais recente primeiro. */
export const jobs: Job[] = [
  {
    id: "single",
    company: "Single Software",
    team: "Time de Front-end",
    location: "Campina Grande, PB",
    period: "mai/2024 – atual",
    current: true,
    roles: [
      {
        title: "Desenvolvedor Front-end Pleno",
        period: "mai/2025 – atual",
        start: "2025-05-01T12:00:00",
        end: null,
        bullets: [
          "Atuo na plataforma multi-marca da Single (Vue 3, Nuxt, TypeScript, Pinia, PrimeVue e Tailwind), com aplicações SSR de alto volume de tráfego.",
          "Participo da evolução da arquitetura de configuração multi-marca, reduzindo o esforço de manutenção e de criação de novas marcas.",
          "Contribuo com iniciativas de performance e Core Web Vitals: renderização lazy/idle, cache de dados em nível de sessão e otimização do carregamento de fontes.",
          "Desenvolvi componentes base do design system, reutilizados por todas as marcas.",
          "Faço revisão de código no fluxo de entrega das demandas.",
        ],
      },
      {
        title: "Desenvolvedor Front-end Júnior",
        period: "mai/2024 – mai/2025",
        start: "2024-05-01T12:00:00",
        end: "2025-05-01T12:00:00",
        bullets: [
          "Comecei em projetos WordPress e logo fui integrado às demandas da plataforma principal em Vue.js.",
          "Participei de entregas de produto e, aos poucos, passei a colaborar em tarefas de arquitetura e performance, até a promoção a Pleno.",
        ],
      },
    ],
    stack: ["Vue 3", "Nuxt", "TypeScript", "Pinia", "PrimeVue", "Tailwind CSS", "SSR", "WordPress"],
  },
  {
    id: "impulse",
    company: "Impulse Business Solutions",
    location: "Campina Grande, PB",
    period: "nov/2022 – set/2023",
    current: false,
    roles: [
      {
        title: "Desenvolvedor Front-end",
        period: "nov/2022 – set/2023",
        start: "2022-11-01T12:00:00",
        end: "2023-09-30T12:00:00",
        bullets: [
          "Desenvolvi interfaces web para clientes de diferentes segmentos com React, JavaScript, HTML/CSS e WordPress.",
          "Criei o CMS interno da empresa.",
          "Construí landing pages em WordPress para clientes da empresa.",
        ],
      },
    ],
    stack: ["React", "JavaScript", "HTML", "CSS", "WordPress", "Node.js"],
    gallery: [
      {
        src: "/projects/legacy/crm-impulse.png",
        title: "CRM Impulse",
        caption: "Front-end do sistema interno de gestão de dados.",
      },
      {
        src: "/projects/legacy/easydata.png",
        title: "Site EasyData",
        caption: "Site institucional da EasyData Solutions, em WordPress.",
      },
      {
        src: "/projects/legacy/lojastemjeito.png",
        title: "Lojas Tem Jeito",
        caption: "Site da franquia para divulgar serviços e produtos, em WordPress.",
        href: "https://lojastemjeito.com.br",
      },
    ],
  },
];

/** Início do primeiro emprego como dev. */
export const careerStart = "2022-11-01T12:00:00";

export const education = {
  course: "Bacharelado em Sistemas de Informação",
  school: "Unifacisa Centro Universitário",
  location: "Campina Grande, PB",
  period: "jun/2020 – dez/2024",
  summary:
    "Formação que combinou desenvolvimento front-end e back-end (Java, Spring, Angular, SQL) com governança de TI e metodologias ágeis.",
};

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Front-end",
    items: ["Vue 3", "Nuxt", "TypeScript", "JavaScript (ES6+)", "Pinia", "React", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "PrimeVue", "shadcn/ui", "WordPress"],
  },
  {
    group: "Arquitetura & Performance",
    items: ["SSR e hidratação", "Core Web Vitals (LCP)", "Design systems", "Componentização"],
  },
  {
    group: "Back-end & Dados",
    items: ["Java", "Spring Boot", "Node.js", "Python", "SQL", "Prisma", "APIs REST"],
  },
  {
    group: "Práticas",
    items: ["Git", "Revisão de código", "Scrum", "Metodologias ágeis"],
  },
];

export const languages = [
  { name: "Português", level: "Nativo" },
  { name: "Inglês", level: "Básico, em desenvolvimento" },
];

/** Faixa de números do topo da home. */
export const highlights = [
  { value: "~4 anos", label: "construindo interfaces para a web" },
  { value: "Pleno", label: "front-end na Single Software" },
  { value: "Vue · Nuxt", label: "stack principal, com TypeScript" },
  { value: "SSR", label: "plataforma multi-marca de alto tráfego" },
];
```

- [ ] **Step 7: Reescrever `src/data/projects.ts`**

```ts
// Vitrine curada: só os repositórios listados aqui aparecem no site e no jogo.

export type ProjectCategory = "frontend" | "backend";

export type World = {
  id: number;
  name: string;
  years: string;
  intro: string;
  /** Cor da ilha no mundo 3D. */
  color: string;
  match: (year: number) => boolean;
};

export const worlds: World[] = [
  {
    id: 1,
    name: "Forja do Java",
    years: "2021",
    intro: "Onde tudo começou: Java e Spring Boot na faculdade.",
    color: "#b8743f",
    match: (y) => y <= 2021,
  },
  {
    id: 2,
    name: "Vale do Front",
    years: "2022",
    intro: "APIs com Spring e Node e o primeiro emprego como dev, na Impulse.",
    color: "#4d8a68",
    match: (y) => y === 2022,
  },
  {
    id: 3,
    name: "Cidade React",
    years: "2023",
    intro: "React, Next.js e TypeScript no dia a dia.",
    color: "#3f6ea6",
    match: (y) => y === 2023,
  },
  {
    id: 4,
    name: "Arena Full-stack",
    years: "2024",
    intro: "Next.js full-stack, o TCC sobre CSR e SSR e a entrada na Single Software.",
    color: "#a7973f",
    match: (y) => y === 2024,
  },
  {
    id: 5,
    name: "Picos do Vue",
    years: "2025-2026",
    intro: "Vue 3 e Nuxt como Pleno, e produtos próprios com IA.",
    color: "#c2413b",
    match: (y) => y >= 2025,
  },
];

export type ShowcaseEntry = {
  /** Nome exato do repositório no GitHub (sem diferenciar maiúsculas). */
  repo: string;
  title: string;
  summary: string;
  tags: string[];
  category: ProjectCategory;
  highlights?: string[];
  badge?: string;
  featured?: boolean;
};

/** Ordem aqui = ordem na home. O jogo reordena por data. */
export const showcase: ShowcaseEntry[] = [
  {
    repo: "bruno-financas",
    title: "Bruno Finanças",
    summary:
      "Controle financeiro pessoal com orçamentos, metas, insights automáticos e um assistente de IA para planejar as finanças.",
    tags: ["Nuxt", "Vue", "TypeScript", "Pinia", "Prisma", "Tailwind", "Zod"],
    category: "frontend",
    featured: true,
  },
  {
    repo: "managment-clinic",
    title: "CliniqAI",
    summary: "Plataforma para médicos gerenciarem seus pacientes clínicos em um só lugar.",
    tags: ["Nuxt", "Vue", "Supabase", "Tailwind"],
    category: "frontend",
    featured: true,
  },
  {
    repo: "conecta",
    title: "Conecta",
    summary:
      "Landing page criada para divulgar o trabalho de amigos com vídeo, design e fotografia.",
    tags: ["Vue", "Vite", "Tailwind"],
    category: "frontend",
    featured: true,
  },
  {
    repo: "fullstack-barberBooking",
    title: "BarberShop",
    summary:
      "Agendamento de serviços em barbearias, com login, reservas e cancelamento de horários.",
    tags: ["Next.js", "TypeScript", "Prisma", "NextAuth", "Radix UI", "Tailwind"],
    category: "frontend",
    featured: true,
  },
  {
    repo: "DTMoney",
    title: "DT Money",
    summary: "Controle de entradas e saídas, feito para fortalecer os fundamentos de React.",
    tags: ["React", "TypeScript", "Styled Components", "MirageJS"],
    category: "frontend",
  },
  {
    repo: "new-portfolio-bruno",
    title: "Portfólio v2",
    summary: "Meu portfólio anterior, com projetos e a jornada como dev front-end.",
    tags: ["Next.js", "React", "TypeScript", "Framer Motion", "Tailwind"],
    category: "frontend",
  },
  {
    repo: "ssr-repository",
    title: "Versão SSR (Next.js)",
    summary: "Busca usuários na API do GitHub e renderiza as páginas no servidor.",
    tags: ["Next.js", "React", "Tailwind"],
    category: "frontend",
    badge: "TCC",
  },
  {
    repo: "csr-repository",
    title: "Versão CSR (React)",
    summary: "A mesma busca de usuários, renderizada inteira no navegador.",
    tags: ["React", "React Router"],
    category: "frontend",
    badge: "TCC",
  },
  {
    repo: "springboot-tests",
    title: "Laboratório Spring Boot",
    summary:
      "Coleção de projetos para explorar o ecossistema Spring: segurança, OAuth2, clientes HTTP reativos e integração com Pix.",
    highlights: [
      "Spring Security e cliente OAuth2",
      "WebClient e WebFlux (programação reativa)",
      "Cliente da API Pix (Bacen/Gerencianet) e webhooks",
      "Clientes de API gerados com Swagger Codegen",
    ],
    tags: ["Java", "Spring Boot", "Spring Security", "OAuth2", "WebFlux"],
    category: "backend",
  },
  {
    repo: "Projeto_Site_Impulse",
    title: "API Interna Impulse",
    summary:
      "API REST para o sistema interno da Impulse, com cadastro de funcionários, clientes e produtos.",
    highlights: [
      "Modelagem com Prisma e migrations versionadas",
      "CRUD de funcionários e clientes com campos únicos (CPF, CNPJ, e-mail)",
      "Seed de dados e deploy no Heroku via Procfile",
    ],
    tags: ["Node.js", "Express", "Prisma", "PostgreSQL"],
    category: "backend",
  },
  {
    repo: "petshop_BrunoApp",
    title: "Petshop API",
    summary:
      "API REST em Spring Boot para o cadastro de clientes de um petshop, consumida por um front-end separado.",
    highlights: [
      "Camadas de controller, entidade e repositório com Spring Data JPA",
      "Endpoints expostos com Spring Data REST",
      "Configuração de CORS e Spring Security",
    ],
    tags: ["Java", "Spring Boot", "JPA", "PostgreSQL"],
    category: "backend",
  },
  {
    repo: "BrMovie-SpringReact",
    title: "BrMovie",
    summary:
      "Avaliação de filmes: o usuário informa o e-mail e dá uma nota de 1 a 5, e a API em Spring Boot registra a avaliação e atualiza a nota do filme.",
    highlights: [
      "API REST em Spring Boot com JPA e PostgreSQL",
      "Front-end em React com TypeScript consumindo a API",
      "Deploy do back-end no Heroku",
    ],
    tags: ["Java", "Spring Boot", "PostgreSQL", "React", "TypeScript"],
    category: "backend",
  },
];

/** Card único que apresenta os dois repositórios do TCC. */
export const tcc = {
  title: "CSR × SSR na prática",
  summary:
    "No meu TCC em Sistemas de Informação, construí a mesma aplicação (busca de usuários na API do GitHub) em duas arquiteturas de front-end: Client-Side Rendering com React e Server-Side Rendering com Next.js. As duas versões serviram de base para analisar como cada abordagem se comporta.",
  highlights: [
    "Mesma interface e mesmos dados nas duas versões, isolando a arquitetura como variável",
    "Comparação de carregamento inicial, performance percebida e SEO",
    "CSR com React e React Router; SSR com Next.js",
  ],
};

/** Logos do Simple Icons para as tecnologias mais usadas. */
export const techIcons: Record<string, string> = {
  React: "react",
  "Next.js": "nextdotjs",
  Vue: "vuedotjs",
  Nuxt: "nuxt",
  TypeScript: "typescript",
  JavaScript: "javascript",
  Tailwind: "tailwindcss",
  WordPress: "wordpress",
  Java: "openjdk",
  "Spring Boot": "springboot",
  "Node.js": "nodedotjs",
  Prisma: "prisma",
  PostgreSQL: "postgresql",
  Supabase: "supabase",
  Firebase: "firebase",
  GSAP: "greensock",
  HTML: "html5",
  CSS: "css",
  "Styled Components": "styledcomponents",
  Python: "python",
};
```

- [ ] **Step 8: Criar `src/lib/build-projects.ts`**

```ts
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
  /** Prints reais do projeto (o primeiro é a capa). */
  images: string[];
  /** Capa usada no mundo 3D e nos cards: print ou card do GitHub. */
  cover: string;
  liveUrl: string | null;
  repoUrl: string | null;
  language: string | null;
  stars: number;
};

export type ProjectAssets = {
  /** slug -> print do site no ar. */
  shots: Record<string, string>;
  /** slug -> card do GitHub salvo localmente. */
  cards: Record<string, string>;
  githubUser: string;
};

const worldFor = (year: number) =>
  (worlds.find((w) => w.match(year)) ?? worlds[worlds.length - 1]).id;

const normalizeUrl = (url: string | null) =>
  !url ? null : url.startsWith("http") ? url : `https://${url}`;

/** Monta os projetos da vitrine, na ordem da vitrine. Função pura: testável sem Next. */
export function buildProjects(
  repos: Repo[],
  entries: ShowcaseEntry[],
  assets: ProjectAssets,
): Project[] {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

  return entries.flatMap((e) => {
    const r = byName.get(e.repo.toLowerCase());
    if (!r) {
      // Repositório renomeado ou apagado não derruba o site: só some da vitrine.
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
      // Deploys fora do ar (sem print) não ganham link de site.
      liveUrl: shot ? normalizeUrl(r.homepage) : null,
      repoUrl: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
    };
    return [project];
  });
}

/** Ordem cronológica, usada pelo jogo. */
export const sortByDate = (projects: Project[]) =>
  [...projects].sort((a, b) => a.date.localeCompare(b.date));
```

- [ ] **Step 9: Reescrever `src/lib/projects.ts`**

```ts
import { cacheLife } from "next/cache";
import { GITHUB_USER } from "@/data/profile";
import { showcase } from "@/data/projects";
import githubCards from "@/data/github-cards.json";
import screenshots from "@/data/screenshots.json";
import { buildProjects, type Project } from "./build-projects";
import { getRepos } from "./github";

export { sortByDate, type Project } from "./build-projects";

/** Projetos da vitrine, na ordem de curadoria de `showcase`. */
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
```

- [ ] **Step 10: Rodar e ver passar**

Run: `npm test`
Expected: PASS (todos os testes de `build-projects.test.ts` e `data.test.ts`).

Run: `npx tsc --noEmit 2>&1 | grep -E "src/(lib|data)/"`
Expected: nenhuma linha (erros em `src/components/game/ui/*` e `src/app/projetos` são esperados e resolvidos na Task 2/3).

- [ ] **Step 11: Não commitar** — reportar ao controlador os arquivos alterados.

---

### Task 2: Jogo em `/jogo`, redirecionamento e painéis atualizados

(Pode rodar em paralelo com a Task 3. Não toque em `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css` nem em `src/components/site/`.)

**Files:**
- Create: `src/app/jogo/page.tsx`
- Delete: `src/app/projetos/page.tsx` (e a pasta)
- Modify: `next.config.ts` (redirect)
- Modify: `src/components/game/Game.tsx` (QuestsPanel sem props; NoWebGL aponta para `/`)
- Modify: `src/components/game/ui/Hud.tsx` (link do menu para `/`)
- Modify: `src/components/game/ui/TitleScreen.tsx` (opção "Portfólio")
- Modify: `src/components/game/ui/LevelPanel.tsx` (categoria + selo no lugar de `kind`)
- Modify: `src/components/game/ui/AchievementsPanel.tsx` (usa `jobs`/`careerStart`)
- Modify: `src/components/game/ui/QuestsPanel.tsx` (reescrita)
- Modify: `src/components/game/ui/ContactPanel.tsx` (reescrita)

**Interfaces:**
- Consumes (Task 1): `getProjects`, `getStats`, `sortByDate`, `Project` de `@/lib/projects`; `profile`, `GITHUB_USER` de `@/data/profile`; `jobs`, `careerStart` de `@/data/experience`.
- Produces: rota `/jogo`; `/projetos` → `/#projetos` (307).

- [ ] **Step 1: Criar `src/app/jogo/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GameLoader } from "@/components/game/GameLoader";
import { profile } from "@/data/profile";
import { getProjects, getStats, sortByDate } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Modo jogo | Bruno Andrade",
  description: "A jornada de Bruno Andrade como dev em um mundo 3D: cada projeto é uma fase.",
};

export default async function GamePage() {
  // No jogo, as fases seguem a ordem em que os projetos nasceram.
  const projects = sortByDate(await getProjects());
  const stats = await getStats(projects);

  return (
    <>
      {/* Conteúdo para leitores de tela e buscadores; o jogo é só visual. */}
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
```

- [ ] **Step 2: Remover `/projetos` e redirecionar**

```bash
git rm -r src/app/projetos
```

Substituir `next.config.ts` por:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      // Card gerado pelo GitHub para repositórios sem deploy.
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
    ],
  },
  async redirects() {
    // O antigo "modo clássico" virou a seção de projetos da home.
    return [{ source: "/projetos", destination: "/#projetos", permanent: false }];
  },
};

export default nextConfig;
```

Confira a API em `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md` (ou `grep -rl "async redirects" node_modules/next/dist/docs`).

- [ ] **Step 3: `Game.tsx`**

- Linha `{panel === "quests" && <QuestsPanel projects={projects} />}` → `{panel === "quests" && <QuestsPanel />}`.
- Em `NoWebGL`, trocar o texto e o link:

```tsx
        <p className="mt-3 text-muted">
          O WebGL está desativado ou indisponível. O currículo e todos os projetos estão na versão em página.
        </p>
        <Link href="/" className="pixel-btn mt-5" data-variant="primary">
          Abrir portfólio
        </Link>
```

- [ ] **Step 4: `Hud.tsx`**

Trocar o import `ListBullets` por `House` e o link do menu:

```tsx
      <Link href="/" className="pixel-btn !px-2.5" title="Voltar ao portfólio">
        <House size={18} weight="bold" />
        <span className="sr-only">Voltar ao portfólio</span>
      </Link>
```

- [ ] **Step 5: `TitleScreen.tsx`**

Trocar a terceira opção:

```tsx
    { label: "Portfólio", hint: "Currículo e projetos em uma página, sem 3D", run: () => router.push("/") },
```

E o parágrafo de introdução:

```tsx
        <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-muted">
          {count} projetos viraram fases em {worlds.length} mundos. Explore minha jornada como dev
          jogando.
        </p>
```

- [ ] **Step 6: `LevelPanel.tsx`**

Substituir `KIND_LABEL` por:

```tsx
const CATEGORY_LABEL = {
  frontend: "Front-end",
  backend: "Back-end",
} as const;
```

e o `<dd>` do tipo por:

```tsx
            <dd className="mt-1 text-text">
              {CATEGORY_LABEL[project.category]}
              {project.badge ? ` · ${project.badge}` : ""}
            </dd>
```

Trocar o texto `Projeto privado de cliente: só os prints podem ser mostrados.` por `Código privado.` (não há mais projetos sem repositório, mas o ramo continua seguro).

- [ ] **Step 7: `AchievementsPanel.tsx`**

Trocar `import { mainQuest } from "@/data/profile";` por `import { careerStart, jobs } from "@/data/experience";` e a conquista "Contratado" por:

```tsx
    {
      icon: Briefcase,
      title: "Contratado",
      text: `Primeiro emprego como dev na ${jobs[jobs.length - 1].company} em ${monthYear(careerStart)}.`,
    },
```

- [ ] **Step 8: Reescrever `QuestsPanel.tsx`**

```tsx
"use client";

import { CheckSquare, Flag } from "@phosphor-icons/react";
import Image from "next/image";
import { jobs } from "@/data/experience";
import { profile } from "@/data/profile";
import { useGame } from "../store";
import { Window } from "./Window";

export function QuestsPanel() {
  const close = useGame((s) => s.close);
  const [current, ...previous] = jobs;
  const role = current.roles[0];
  // Cargos anteriores, inclusive os da empresa atual (a promoção conta como missão concluída).
  const done = [
    ...current.roles.slice(1).map((r) => ({ ...r, org: current.company })),
    ...previous.flatMap((j) => j.roles.map((r) => ({ ...r, org: j.company }))),
  ];

  return (
    <Window title="Missões" onClose={close}>
      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative aspect-[4/5] max-h-[420px] overflow-hidden border-2 border-line">
          <Image
            src={profile.photos.desk}
            alt="Bruno trabalhando no escritório"
            fill
            sizes="(min-width: 1024px) 340px, 100vw"
            className="object-cover object-[70%_center]"
          />
        </div>
        <div>
          <p className="font-mono text-xs text-accent-text">Missão principal em andamento</p>
          <h3 className="mt-1 font-pixel text-3xl leading-tight">
            {role.title} na {current.company}
          </h3>
          <p className="mt-1 font-mono text-xs text-muted">{role.period}</p>
          <ul className="mt-4 grid gap-2">
            {role.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm leading-relaxed">
                <CheckSquare size={18} weight="fill" className="mt-px shrink-0 text-accent-text" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="font-pixel text-xl">Missões concluídas</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {done.map((q) => (
            <li key={`${q.org}-${q.title}`} className="border-2 border-line bg-panel-2 p-4">
              <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
                <Flag size={12} weight="fill" /> {q.period}
              </p>
              <p className="mt-1 font-pixel text-lg leading-tight">{q.title}</p>
              <p className="text-sm text-muted">{q.org}</p>
              <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-muted">
                {q.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </Window>
  );
}
```

- [ ] **Step 9: Reescrever `ContactPanel.tsx`**

```tsx
"use client";

import {
  DownloadSimple,
  Envelope,
  GithubLogo,
  LinkedinLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import Image from "next/image";
import { profile } from "@/data/profile";
import { useGame } from "../store";
import { Window } from "./Window";

export function ContactPanel() {
  const close = useGame((s) => s.close);

  return (
    <Window title="Próxima fase" onClose={close}>
      <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr]">
        <div>
          <h3 className="font-pixel text-4xl leading-tight sm:text-5xl">
            Vamos jogar a próxima fase juntos?
          </h3>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-muted">
            Estou aberto a novas oportunidades e projetos desafiadores. Me chama para uma conversa.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="pixel-btn" data-variant="primary">
                <Envelope size={16} weight="bold" /> E-mail
              </a>
            )}
            {profile.whatsapp && (
              <a href={profile.whatsapp} target="_blank" rel="noreferrer" className="pixel-btn">
                <WhatsappLogo size={16} weight="bold" /> WhatsApp
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="pixel-btn">
                <LinkedinLogo size={16} weight="bold" /> LinkedIn
              </a>
            )}
            <a href={profile.github} target="_blank" rel="noreferrer" className="pixel-btn">
              <GithubLogo size={16} weight="bold" /> GitHub
            </a>
            <a href={profile.resume} download className="pixel-btn">
              <DownloadSimple size={16} weight="bold" /> Currículo
            </a>
          </div>
          {profile.email && (
            <p className="mt-4 font-mono text-xs text-muted">
              {profile.email}
              {profile.phone && ` · ${profile.phone}`}
            </p>
          )}
        </div>
        <div className="relative aspect-square overflow-hidden border-2 border-line">
          <Image
            src={profile.photos.desk}
            alt="Bruno no escritório, com o fone no pescoço"
            fill
            sizes="(min-width: 768px) 460px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </Window>
  );
}
```

- [ ] **Step 10: Verificar**

Run: `npx tsc --noEmit 2>&1 | grep -E "src/(components/game|app/jogo)|next.config"`
Expected: nenhuma linha.

Run: `npx eslint src/components/game src/app/jogo next.config.ts`
Expected: sem erros.

Run: `grep -rn "mainQuest\|/projetos\|\.kind\b" src/components/game src/app/jogo`
Expected: nenhuma linha.

- [ ] **Step 11: Não commitar** — reportar arquivos alterados.

---

### Task 3: Home profissional (`/`)

(Pode rodar em paralelo com a Task 2. Não toque em `src/components/game/`, `src/app/jogo/` nem em `next.config.ts`.)

**Files:**
- Create: `src/components/site/ui.tsx` (Section, Tag, BulletList, ProjectLinks)
- Create: `src/components/site/SiteHeader.tsx`
- Create: `src/components/site/Hero.tsx`
- Create: `src/components/site/ExperienceTimeline.tsx`
- Create: `src/components/site/About.tsx`
- Create: `src/components/site/FrontendProjects.tsx`
- Create: `src/components/site/BackendProjects.tsx`
- Create: `src/components/site/Contact.tsx`
- Create: `src/components/site/SiteFooter.tsx`
- Modify: `src/app/page.tsx` (reescrita)
- Modify: `src/app/layout.tsx` (metadata)
- Modify: `src/app/globals.css` (scroll suave)

**Interfaces:**
- Consumes (Task 1): `profile`, `GITHUB_USER`; `jobs`, `education`, `skills`, `languages`, `highlights` de `@/data/experience`; `tcc` de `@/data/projects`; `getProjects`, `Project` de `@/lib/projects`.
- Produces: âncoras `#inicio`, `#experiencia`, `#sobre`, `#projetos`, `#back-end`, `#contato` (o redirect da Task 2 depende de `#projetos`). Atributos para o E2E: cada card de projeto tem `data-project="<slug>"`; card do TCC tem `data-tcc`; cada cargo tem `data-role="<título>"`.

- [ ] **Step 1: `src/components/site/ui.tsx`**

```tsx
import { ArrowSquareOut, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import type { Project } from "@/lib/projects";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-28 border-t-2 border-line py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">{eyebrow}</p>
        <h2 id={`${id}-titulo`} className="mt-2 font-pixel text-3xl leading-tight sm:text-4xl">
          {title}
        </h2>
        {intro && <p className="mt-3 max-w-[62ch] leading-relaxed text-muted">{intro}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border-2 border-line bg-panel-2 px-2 py-0.5 font-mono text-xs text-text">
      {children}
    </span>
  );
}

export function TagList({ items, label = "Tecnologias" }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t}>
          <Tag>{t}</Tag>
        </li>
      ))}
    </ul>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((b) => (
        <li key={b} className="flex gap-3 leading-relaxed text-muted">
          <span aria-hidden className="mt-2.5 size-1.5 shrink-0 bg-accent-text" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProjectLinks({ project }: { project: Project }) {
  if (!project.liveUrl && !project.repoUrl) return null;
  return (
    <div className="mt-auto flex flex-wrap gap-2 pt-5">
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="pixel-btn !py-1.5 !text-sm"
          data-variant="primary"
          aria-label={`Ver site do projeto ${project.title}`}
        >
          <ArrowSquareOut size={16} weight="bold" /> Ver site
        </a>
      )}
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="pixel-btn !py-1.5 !text-sm"
          aria-label={`Ver código do projeto ${project.title}`}
        >
          <GithubLogo size={16} weight="bold" /> Código
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `SiteHeader.tsx`**

```tsx
import { DownloadSimple, GameController } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { profile } from "@/data/profile";

const NAV = [
  { href: "#experiencia", label: "Experiência" },
  { href: "#sobre", label: "Sobre" },
  { href: "#projetos", label: "Projetos" },
  { href: "#back-end", label: "Back-end" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <a href="#inicio" className="font-pixel text-lg leading-none">
          {profile.name}
        </a>
        <nav aria-label="Seções" className="hidden md:block">
          <ul className="flex gap-6 text-sm text-muted">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-text">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 gap-2">
          <a href={profile.resume} download className="pixel-btn !px-3 !py-1.5 !text-sm">
            <DownloadSimple size={16} weight="bold" />
            <span className="hidden sm:inline">Currículo</span>
            <span className="sr-only sm:hidden">Baixar currículo</span>
          </a>
          <Link href="/jogo" className="pixel-btn !px-3 !py-1.5 !text-sm" data-variant="primary">
            <GameController size={16} weight="bold" />
            <span className="hidden sm:inline">Modo jogo</span>
            <span className="sr-only sm:hidden">Modo jogo</span>
          </Link>
        </div>
      </div>
      {/* No celular, a navegação vira uma faixa rolável abaixo do topo. */}
      <nav aria-label="Seções" className="border-t-2 border-line md:hidden">
        <ul className="flex gap-5 overflow-x-auto px-4 py-2 text-sm text-muted">
          {NAV.map((n) => (
            <li key={n.href} className="shrink-0">
              <a href={n.href} className="hover:text-text">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: `Hero.tsx`**

```tsx
import { ArrowDown, ChatCircleDots, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { highlights } from "@/data/experience";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section
      id="inicio"
      className="mx-auto grid max-w-6xl scroll-mt-28 gap-10 px-4 pb-16 pt-12 sm:px-8 sm:pt-20 md:grid-cols-[1.4fr_1fr] md:items-center"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">{profile.location}</p>
        <h1 className="mt-3 font-pixel text-5xl leading-[0.95] sm:text-7xl">{profile.name}</h1>
        <p className="mt-4 text-xl text-text sm:text-2xl">{profile.role}</p>
        <p className="mt-1 font-mono text-sm text-muted">{profile.headline}</p>
        <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted">{profile.bio}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#contato" className="pixel-btn" data-variant="primary">
            <ChatCircleDots size={18} weight="bold" /> Falar comigo
          </a>
          <a href={profile.resume} download className="pixel-btn">
            <DownloadSimple size={18} weight="bold" /> Baixar currículo
          </a>
          <a href="#projetos" className="pixel-btn">
            <ArrowDown size={18} weight="bold" /> Ver projetos
          </a>
        </div>
      </div>

      <figure className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden border-2 border-line shadow-[6px_6px_0_var(--shadow)]">
        <Image
          src={profile.photos.portrait}
          alt="Bruno Andrade programando no notebook"
          fill
          preload
          sizes="(min-width: 768px) 384px, 100vw"
          className="object-cover"
        />
      </figure>

      <dl className="grid grid-cols-2 gap-3 md:col-span-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div key={h.value} className="pixel-box flex flex-col-reverse p-4">
            <dt className="mt-1 text-sm leading-snug text-muted">{h.label}</dt>
            <dd className="font-pixel text-2xl text-text">{h.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: `ExperienceTimeline.tsx`**

```tsx
import Image from "next/image";
import { jobs, type Job } from "@/data/experience";
import { BulletList, Section, TagList } from "./ui";

export function ExperienceTimeline() {
  return (
    <Section
      id="experiencia"
      eyebrow="Carreira"
      title="Experiência profissional"
      intro="Quase 4 anos construindo produtos web. Hoje sou Pleno na Single Software, onde entrei como Júnior."
    >
      {/* Linha vertical: o marcador de cada empresa fica centralizado sobre a borda. */}
      <ol className="grid gap-10 border-l-2 border-line pl-6 sm:pl-10">
        {jobs.map((job) => (
          <li key={job.id} className="relative">
            <span
              aria-hidden
              className={`absolute -left-[33px] top-6 size-4 border-2 border-accent sm:-left-[49px] ${
                job.current ? "bg-accent" : "bg-bg"
              }`}
            />
            <JobCard job={job} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <article className="pixel-box p-5 sm:p-7">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-pixel text-2xl leading-tight sm:text-3xl">{job.company}</h3>
        <p className="font-mono text-sm text-muted">{job.period}</p>
      </header>
      <p className="mt-1 text-sm text-muted">
        {job.team ? `${job.team} · ` : ""}
        {job.location}
      </p>

      <ol className="mt-6 grid gap-7">
        {job.roles.map((role) => (
          <li key={role.title} data-role={role.title}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h4 className="text-lg font-semibold text-text">{role.title}</h4>
              {role.end === null && (
                <span className="border-2 border-accent px-2 py-0.5 font-mono text-[11px] text-accent-text">
                  Atual
                </span>
              )}
              <span className="font-mono text-xs text-muted">{role.period}</span>
            </div>
            <div className="mt-3">
              <BulletList items={role.bullets} />
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <TagList items={job.stack} />
      </div>

      {job.gallery && (
        <div className="mt-7 border-t-2 border-line pt-5">
          <h4 className="font-pixel text-lg">Trabalhos para clientes</h4>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {job.gallery.map((g) => (
              <li key={g.src}>
                <figure>
                  <div className="relative aspect-[16/10] overflow-hidden border-2 border-line bg-panel-2">
                    <Image
                      src={g.src}
                      alt={`Tela do projeto ${g.title}`}
                      fill
                      sizes="(min-width: 640px) 300px, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <figcaption className="mt-2">
                    <span className="block font-semibold text-text">
                      {g.href ? (
                        <a href={g.href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-accent-text">
                          {g.title}
                        </a>
                      ) : (
                        g.title
                      )}
                    </span>
                    <span className="text-sm leading-snug text-muted">{g.caption}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 5: `About.tsx`**

```tsx
import { education, languages, skills } from "@/data/experience";
import { profile } from "@/data/profile";
import { Section, TagList } from "./ui";

export function About() {
  return (
    <Section id="sobre" eyebrow="Perfil" title="Sobre mim">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid max-w-[65ch] content-start gap-4 text-lg leading-relaxed text-muted">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="grid content-start gap-4">
          <div className="pixel-box p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">Formação</h3>
            <p className="mt-2 font-semibold text-text">{education.course}</p>
            <p className="text-sm text-muted">
              {education.school} · {education.period}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{education.summary}</p>
          </div>
          <div className="pixel-box p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">Idiomas</h3>
            <ul className="mt-2 grid gap-1">
              {languages.map((l) => (
                <li key={l.name} className="flex justify-between gap-4">
                  <span className="text-text">{l.name}</span>
                  <span className="text-right text-sm text-muted">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <h3 className="mt-14 font-pixel text-2xl">Competências técnicas</h3>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {skills.map((s) => (
          <li key={s.group} className="pixel-box p-5">
            <h4 className="font-semibold text-text">{s.group}</h4>
            <div className="mt-3">
              <TagList items={s.items} label={s.group} />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

- [ ] **Step 6: `FrontendProjects.tsx`**

```tsx
import Image from "next/image";
import { tcc } from "@/data/projects";
import type { Project } from "@/lib/projects";
import { BulletList, ProjectLinks, Section, TagList } from "./ui";

export function FrontendProjects({ projects }: { projects: Project[] }) {
  const front = projects.filter((p) => p.category === "frontend");
  const main = front.filter((p) => p.badge !== "TCC");
  const tccRepos = front.filter((p) => p.badge === "TCC");

  return (
    <Section
      id="projetos"
      eyebrow="Front-end"
      title="Projetos"
      intro="Uma seleção do que construí fora do trabalho: produtos próprios, projetos para amigos e o meu TCC."
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {main.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
      {tccRepos.length > 0 && <TccCard repos={tccRepos} />}
    </Section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article data-project={p.slug} className="pixel-box flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-line bg-panel-2">
        <Image
          src={p.cover}
          alt={`Tela do projeto ${p.title}`}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className={p.images.length ? "object-cover object-top" : "object-contain"}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-pixel text-2xl leading-tight">{p.title}</h3>
        <p className="mt-2 leading-relaxed text-muted">{p.summary}</p>
        <div className="mt-4">
          <TagList items={p.tags} />
        </div>
        <ProjectLinks project={p} />
      </div>
    </article>
  );
}

function TccCard({ repos }: { repos: Project[] }) {
  return (
    <article data-tcc className="pixel-box mt-6 grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">
          Trabalho de conclusão de curso
        </p>
        <h3 className="mt-2 font-pixel text-3xl leading-tight">{tcc.title}</h3>
        <p className="mt-3 leading-relaxed text-muted">{tcc.summary}</p>
        <div className="mt-4">
          <BulletList items={tcc.highlights} />
        </div>
      </div>
      <ul className="grid content-start gap-3">
        {repos.map((p) => (
          <li key={p.slug} data-project={p.slug} className="flex flex-col border-2 border-line bg-panel-2 p-4">
            <p className="font-semibold text-text">{p.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{p.summary}</p>
            <div className="mt-3">
              <TagList items={p.tags} />
            </div>
            <ProjectLinks project={p} />
          </li>
        ))}
      </ul>
    </article>
  );
}
```

- [ ] **Step 7: `BackendProjects.tsx`**

```tsx
import type { Project } from "@/lib/projects";
import { BulletList, ProjectLinks, Section, TagList } from "./ui";

export function BackendProjects({ projects }: { projects: Project[] }) {
  const list = projects.filter((p) => p.category === "backend");
  if (!list.length) return null;

  return (
    <Section
      id="back-end"
      eyebrow="Back-end"
      title="Projetos de back-end"
      intro="Minha formação começou pelo back-end: APIs REST com Java e Spring Boot e, no trabalho, Node.js com Prisma. Essa base facilita a conversa com o time e a integração de APIs no front."
    >
      <ul className="grid gap-6 md:grid-cols-2">
        {list.map((p) => (
          <li key={p.slug}>
            <article data-project={p.slug} className="pixel-box flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-pixel text-2xl leading-tight">{p.title}</h3>
                <span className="shrink-0 font-mono text-xs text-muted">{p.year}</span>
              </div>
              <p className="mt-2 leading-relaxed text-muted">{p.summary}</p>
              {p.highlights.length > 0 && (
                <div className="mt-4">
                  <BulletList items={p.highlights} />
                </div>
              )}
              <div className="mt-5">
                <TagList items={p.tags} />
              </div>
              <ProjectLinks project={p} />
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

- [ ] **Step 8: `Contact.tsx`**

```tsx
import {
  DownloadSimple,
  Envelope,
  GithubLogo,
  LinkedinLogo,
  WhatsappLogo,
  type Icon,
} from "@phosphor-icons/react/dist/ssr";
import { GITHUB_USER, profile } from "@/data/profile";
import { Section } from "./ui";

type Channel = { href: string; label: string; value: string; icon: Icon; external: boolean };

export function Contact() {
  const channels: Channel[] = [];
  if (profile.email)
    channels.push({ href: `mailto:${profile.email}`, label: "E-mail", value: profile.email, icon: Envelope, external: false });
  if (profile.whatsapp)
    channels.push({ href: profile.whatsapp, label: "WhatsApp", value: profile.phone ?? "Conversar", icon: WhatsappLogo, external: true });
  if (profile.linkedin)
    channels.push({
      href: profile.linkedin,
      label: "LinkedIn",
      value: profile.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
      icon: LinkedinLogo,
      external: true,
    });
  channels.push({ href: profile.github, label: "GitHub", value: `github.com/${GITHUB_USER}`, icon: GithubLogo, external: true });

  return (
    <Section
      id="contato"
      eyebrow="Contato"
      title="Vamos conversar?"
      intro="Estou aberto a novas oportunidades e projetos desafiadores. O jeito mais rápido de falar comigo é por e-mail ou WhatsApp."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map(({ href, label, value, icon: ChannelIcon, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="pixel-box group flex h-full flex-col gap-3 p-5 transition-colors hover:border-muted"
            >
              <ChannelIcon size={28} weight="bold" className="text-accent-text" />
              <span>
                <span className="block font-semibold text-text">{label}</span>
                <span className="block break-all text-sm text-muted group-hover:text-text">{value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a href={profile.resume} download className="pixel-btn mt-8" data-variant="primary">
        <DownloadSimple size={18} weight="bold" /> Baixar currículo em PDF
      </a>
    </Section>
  );
}
```

Se `type Icon` não for exportado por `@phosphor-icons/react/dist/ssr`, importe-o com `import type { Icon } from "@phosphor-icons/react";` (import só de tipo, seguro em server component).

- [ ] **Step 9: `SiteFooter.tsx`**

```tsx
import { GameController } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-8">
        <p>
          {profile.name} · {profile.role} · {profile.location}
        </p>
        <Link href="/jogo" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-text">
          <GameController size={16} weight="bold" /> Este portfólio também é um jogo 3D
        </Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 10: Reescrever `src/app/page.tsx`**

```tsx
import { About } from "@/components/site/About";
import { BackendProjects } from "@/components/site/BackendProjects";
import { Contact } from "@/components/site/Contact";
import { ExperienceTimeline } from "@/components/site/ExperienceTimeline";
import { FrontendProjects } from "@/components/site/FrontendProjects";
import { Hero } from "@/components/site/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ExperienceTimeline />
        <About />
        <FrontendProjects projects={projects} />
        <BackendProjects projects={projects} />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 11: `layout.tsx` — metadata**

Substituir o objeto `metadata` por:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bruno Andrade | Desenvolvedor Front-end",
  description:
    "Bruno Andrade, desenvolvedor front-end Pleno em Vue 3 e Nuxt na Single Software. Experiência, projetos e contato.",
  openGraph: {
    title: "Bruno Andrade | Desenvolvedor Front-end",
    description: "Vue 3 & Nuxt · Arquitetura, performance e SSR. Experiência, projetos e contato.",
    images: ["/me/desk.jpg"],
    locale: "pt_BR",
    type: "website",
  },
};
```

- [ ] **Step 12: `globals.css` — scroll suave**

Dentro do bloco `@media (prefers-reduced-motion: no-preference) { ... }` existente, adicionar:

```css
  html {
    scroll-behavior: smooth;
  }
```

E atualizar o comentário do topo: `Tema único escuro, compartilhado pela home e pelo jogo.`

- [ ] **Step 13: Verificar**

Run: `npx tsc --noEmit 2>&1 | grep -E "src/(components/site|app/page|app/layout)"`
Expected: nenhuma linha.

Run: `npx eslint src/components/site src/app/page.tsx src/app/layout.tsx`
Expected: sem erros.

- [ ] **Step 14: Não commitar** — reportar arquivos alterados.

---

### Task 4: README, verificação completa e E2E com agent-browser

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Atualizar `README.md`**

Substituir a seção de rotas e de dados por:

```markdown
# Bruno Andrade · Portfólio

Portfólio de Bruno Andrade, desenvolvedor front-end Pleno (Vue 3 & Nuxt). A home apresenta currículo, projetos e contato; o modo jogo transforma os mesmos projetos em fases de um mundo 3D (three.js + React Three Fiber).

## Rodando

```bash
npm install
npm run dev
npm test          # testes de dados e da vitrine (Vitest)
```

- `/`: currículo, experiência, projetos front-end e back-end, contato
- `/jogo`: modo jogo (← → andar, Enter abrir fase, P/M/C/K menus, Esc fechar)
- `/projetos`: redireciona para `/#projetos`

## De onde vêm os dados

- **Currículo**: `src/data/experience.ts` (empresas, cargos, formação, competências) e `src/data/profile.ts` (contatos, resumo, foto). O PDF fica em `public/curriculo-bruno-andrade.pdf`.
- **Projetos**: só os repositórios listados em `showcase` (`src/data/projects.ts`) aparecem. A ordem da lista é a ordem da home; o jogo reordena por data.
- **GitHub**: `src/lib/github.ts` busca os repositórios com cache de 1 dia e cai em `src/data/repos-snapshot.json` se a API falhar. Defina `GITHUB_TOKEN` para evitar rate limit.
```

Mantenha a seção "Prints dos projetos" que já existe.

- [ ] **Step 2: Verificação completa**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tudo sem erros. No build, as rotas `/` e `/jogo` aparecem e `/projetos` não.

- [ ] **Step 3: Subir o servidor de produção**

`npx next start -p 3100` (em background).

- [ ] **Step 4: E2E com agent-browser**

```bash
npx -y agent-browser install            # baixa o Chromium na primeira vez
npx agent-browser open http://localhost:3100/
npx agent-browser eval "[...document.querySelectorAll('[data-role]')].map(e=>e.dataset.role).join('|')"
# esperado: Desenvolvedor Front-end Pleno|Desenvolvedor Front-end Júnior|Desenvolvedor Front-end
npx agent-browser eval "[...document.querySelectorAll('#projetos [data-project]')].map(e=>e.dataset.project).join(',')"
# esperado: bruno-financas,managment-clinic,conecta,fullstack-barberbooking,dtmoney,new-portfolio-bruno,ssr-repository,csr-repository
npx agent-browser eval "[...document.querySelectorAll('#back-end [data-project]')].map(e=>e.dataset.project).join(',')"
# esperado: springboot-tests,projeto_site_impulse,petshop_brunoapp,brmovie-springreact
npx agent-browser eval "!!document.querySelector('[data-tcc]') && !/Líder Açaí|Mario Card|ig\.news/.test(document.body.innerText)"
# esperado: true
npx agent-browser eval "[...document.querySelectorAll('#contato a')].map(a=>a.getAttribute('href')).join(' ')"
# esperado: mailto:brunoa71240@gmail.com https://wa.me/5583982121351 https://www.linkedin.com/in/brunoandrade-386b331b6 https://github.com/Bruno-Andrade49 /curriculo-bruno-andrade.pdf
npx agent-browser screenshot --full $SCRATCH/home-desktop.png
npx agent-browser set viewport 375 812
npx agent-browser reload
npx agent-browser eval "document.documentElement.scrollWidth <= window.innerWidth"
# esperado: true
npx agent-browser screenshot --full $SCRATCH/home-mobile.png
npx agent-browser open http://localhost:3100/projetos
npx agent-browser get url
# esperado: termina em /#projetos
npx agent-browser open http://localhost:3100/jogo
npx agent-browser screenshot $SCRATCH/jogo.png
npx agent-browser close
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3100/curriculo-bruno-andrade.pdf
# esperado: 200 application/pdf
```

Se a sintaxe de algum subcomando divergir, rode `npx agent-browser --help` e ajuste. Em `/jogo`, aceite o jogo ou o fallback sem WebGL; no fallback, confirme que o link "Abrir portfólio" aponta para `/`. Se o jogo carregar, pressione Enter na tela de título, abra Missões (tecla `m`) e confirme que aparece "Single Software".

- [ ] **Step 5: Revisar as screenshots** (abrir os PNGs e checar hierarquia, cortes, sobreposição e legibilidade no mobile). Corrigir o que estiver quebrado e repetir os passos 2–4.

- [ ] **Step 6: Commit final** (controlador).
