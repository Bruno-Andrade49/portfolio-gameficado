# Jogo mobile, SEO e tema claro/escuro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o modo jogo usável em celulares, completar o SEO do site e adicionar um seletor de tema claro/escuro que vale para a home, a interface do jogo e o cenário 3D.

**Architecture:** O tema é um atributo `data-theme` no `<html>`, definido antes da pintura por um script inline e trocado por um hook (`useTheme`/`setTheme`); todas as cores passam por tokens CSS, e a cena 3D lê o tema por prop. SEO usa as convenções de arquivo do App Router (`opengraph-image`, `icon`, `manifest`, `sitemap`, `robots`) alimentadas por `src/data/seo.ts` e `siteUrl()`. O HUD do jogo ganha um layout próprio abaixo de 640 px.

**Tech Stack:** Next.js 16.3 (App Router, `cacheComponents`), React 19, Tailwind 4, React Three Fiber 9 + drei 10, `next/og`, Vitest 4, agent-browser.

**Spec:** `docs/superpowers/specs/2026-10-04-mobile-seo-tema-design.md`

## Global Constraints

- Texto visível em português do Brasil, **sem travessões** (`–`, `—`) em textos.
- **Sem comentários de código** fora de `src/data/` (regra do Bruno). Única exceção: diretivas `eslint-disable-*` estritamente necessárias.
- Next.js 16 difere do seu treino: antes de usar uma API do Next, leia o guia em `node_modules/next/dist/docs/` (metadados: `01-app/03-api-reference/03-file-conventions/01-metadata/`). `next/image` usa `preload`. `cacheComponents: true`: nada de `new Date()` em server components.
- Server components importam ícones de `@phosphor-icons/react/dist/ssr`; client components de `@phosphor-icons/react`.
- Cores só via tokens (`bg`, `panel`, `panel-2`, `line`, `text`, `muted`, `accent`, `accent-text`, `--shadow`, `--scanline`, `--title-fade`). Texto sobre `bg-accent` é sempre branco (`text-white`).
- Sem scroll horizontal da página e nenhum controle fora da viewport em 360×740, 375×812, 390×844 e 812×375.
- Chave do localStorage do tema: `theme` (valores `light` | `dark`).
- **Implementadores não fazem `git commit`**; o controlador commita.

## Review Focus

- Visitante com tema do sistema claro e sem preferência salva → abre claro sem flash escuro (Task 1 teste do script; Task 4 E2E).
- Preferência salva corrompida/indisponível (localStorage bloqueado) → cai no escuro sem erro (Task 1 teste do script).
- Compartilhamento no LinkedIn/WhatsApp → `og:image` absoluto, 1200×630, responde `image/png` (Task 2 teste de URLs absolutas; Task 4 E2E).
- Celular em paisagem (812×375) → HUD cabe, botões alcançáveis (Task 3; Task 4 E2E).
- Toque/arrasto no cenário 3D → troca de fase sem abrir janela por acidente (Task 3; Task 4 E2E).

---

### Task 1: Base do tema claro/escuro

**Files:**
- Create: `src/lib/theme-script.ts`, `src/lib/theme.ts`, `src/components/ThemeToggle.tsx`
- Test: `src/lib/theme-script.test.ts`
- Modify: `src/app/layout.tsx` (só `<html>`, `<head>` e `viewport`; **não** mexa em `metadata`), `src/app/globals.css`, `src/components/site/SiteHeader.tsx`

**Interfaces:**
- Produces: `THEME_STORAGE_KEY = "theme"`, `type Theme = "light" | "dark"`, `themeScript: string` (de `@/lib/theme-script`); `useTheme(): Theme`, `setTheme(t: Theme): void` (de `@/lib/theme`, client); `ThemeToggle({ className?: string })` (de `@/components/ThemeToggle`, client, `data-theme-toggle` no botão); tokens CSS `--scanline`, `--title-fade`; `[role="dialog"]` sem contorno de foco.

- [ ] **Step 1: Teste do script (falhando)** — `src/lib/theme-script.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { themeScript } from "./theme-script";

type Env = { stored?: string | null; prefersLight?: boolean; storageThrows?: boolean };

function run({ stored = null, prefersLight = false, storageThrows = false }: Env) {
  const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
  const listeners: ((e: { matches: boolean }) => void)[] = [];
  const document = { documentElement: root };
  const localStorage = {
    getItem: () => {
      if (storageThrows) throw new Error("bloqueado");
      return stored;
    },
  };
  const window = {
    matchMedia: () => ({ matches: prefersLight, addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb) }),
  };
  new Function("document", "localStorage", "window", themeScript)(document, localStorage, window);
  return { root, listeners };
}

describe("themeScript", () => {
  it("usa a preferência salva acima do sistema", () => {
    expect(run({ stored: "dark", prefersLight: true }).root.dataset.theme).toBe("dark");
    expect(run({ stored: "light", prefersLight: false }).root.dataset.theme).toBe("light");
  });

  it("sem preferência salva, segue o sistema e acompanha mudanças", () => {
    const { root, listeners } = run({ prefersLight: true });
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
    listeners[0]({ matches: false });
    expect(root.dataset.theme).toBe("dark");
  });

  it("ignora valor inválido salvo", () => {
    expect(run({ stored: "roxo", prefersLight: false }).root.dataset.theme).toBe("dark");
  });

  it("cai no escuro se o localStorage estiver bloqueado", () => {
    expect(run({ storageThrows: true, prefersLight: true }).root.dataset.theme).toBe("dark");
  });
});
```

Run: `npm test -- src/lib/theme-script.test.ts` → FAIL (módulo não existe).

- [ ] **Step 2: `src/lib/theme-script.ts`**

```ts
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export const themeScript = `(function(){var d=document.documentElement;function a(t){d.dataset.theme=t;d.style.colorScheme=t;}try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var m=window.matchMedia("(prefers-color-scheme: light)");if(s==="light"||s==="dark"){a(s);return;}a(m.matches?"light":"dark");m.addEventListener("change",function(e){var c=null;try{c=localStorage.getItem("${THEME_STORAGE_KEY}");}catch(x){}if(c!=="light"&&c!=="dark")a(e.matches?"light":"dark");});}catch(e){a("dark");}})();`;
```

Run o teste → PASS.

- [ ] **Step 3: `src/lib/theme.ts`**

```ts
"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "./theme-script";

function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "dark");
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}
```

- [ ] **Step 4: `src/components/ThemeToggle.tsx`**

```tsx
"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { setTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "pixel-btn !px-2.5" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <button type="button" onClick={() => setTheme(next)} className={className} aria-label={label} title={label} data-theme-toggle>
      {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
    </button>
  );
}
```

- [ ] **Step 5: `globals.css`**

1. No `:root` atual, acrescente `--scanline: rgb(255 255 255 / 0.025);` e `--title-fade: rgb(15 13 14 / 0.86);`.
2. Logo abaixo do `:root`, acrescente:

```css
:root[data-theme="light"] {
  --bg: #f4efe8;
  --panel: #fffdf9;
  --panel-2: #efe7dd;
  --line: #d3c6b8;
  --text: #1c1618;
  --muted: #62575b;
  --accent: #c8322b;
  --accent-text: #b4271f;
  --shadow: rgb(70 48 36 / 0.22);
  --scanline: rgb(0 0 0 / 0.035);
  --title-fade: rgb(244 239 232 / 0.88);
  color-scheme: light;
}
```

3. `::selection { color: #fff; }` (troque `var(--text)` por `#fff`).
4. Depois do bloco `:focus-visible`, acrescente `[role="dialog"]:focus-visible { outline: none; }`.
5. Em `.pixel-btn[data-variant="primary"]`, acrescente `color: #fff;`.
6. No `.crt::after`, troque `rgb(255 255 255 / 0.025)` por `var(--scanline)`.
7. Acrescente `html { transition: background-color 200ms ease; }` dentro do bloco `@media (prefers-reduced-motion: no-preference)` existente.

- [ ] **Step 6: `layout.tsx` (sem tocar em `metadata`)**

- Importe `import { themeScript } from "@/lib/theme-script";`.
- `viewport`:

```ts
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0e" },
  ],
  viewportFit: "cover",
};
```

- `<html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth" className={...}>` e, antes do `<body>`:

```tsx
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
```

- [ ] **Step 7: `SiteHeader.tsx`** — `ThemeToggle` é client e pode ser usado no server component. Na `div` dos botões (Currículo / Modo jogo), adicione como **primeiro** item:

```tsx
<ThemeToggle className="pixel-btn !px-2.5 !py-1.5 !text-sm" />
```

com `import { ThemeToggle } from "@/components/ThemeToggle";`.

- [ ] **Step 8: Varredura de cores na home** — em `src/components/site/**`, qualquer `text-text` sobre `bg-accent` vira `text-white`; nenhuma cor hex/rgb literal (`grep -rn "#[0-9a-fA-F]\{3,6\}\|rgb(" src/components/site` deve voltar vazio).

- [ ] **Step 9: Verificar** — `npm test`, `npx tsc --noEmit`, `npm run lint` limpos. Não rode `next build` (outra tarefa pode estar editando).

---

### Task 2: SEO completo

(Roda em paralelo com a Task 3. Não toque em `src/components/game/**`, `src/app/globals.css`, nem no `<html>/<head>/viewport` do layout.)

**Files:**
- Create: `src/data/seo.ts`, `src/lib/site-url.ts`, `src/lib/structured-data.ts`, `src/lib/og.tsx`, `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`, `src/app/jogo/opengraph-image.tsx`, `src/app/jogo/twitter-image.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`, `src/app/manifest.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `public/fonts/PixelifySans-Bold.ttf`
- Delete: `src/app/favicon.ico`
- Modify: `src/app/layout.tsx` (**só** `metadata` e a remoção do antigo `siteUrl` local), `src/app/page.tsx` (JSON-LD), `src/app/jogo/page.tsx` (só `metadata`)
- Test: `src/lib/seo.test.ts`

**Interfaces:**
- Consumes: `profile`, `attributes` (`@/data/profile`), `jobs`, `education` (`@/data/experience`).
- Produces: `seo` (`@/data/seo`), `siteUrl(env?)` (`@/lib/site-url`), `structuredData(url)` (`@/lib/structured-data`), `renderOg(...)`/`renderMonogram(...)` (`@/lib/og`).

- [ ] **Step 1: Fonte estática para o `next/og`** (o Satori não lê fonte variável):

```bash
curl -sL -o public/fonts/PixelifySans-Bold.ttf "https://cdn.jsdelivr.net/fontsource/fonts/pixelify-sans@latest/latin-700-normal.ttf"
file public/fonts/PixelifySans-Bold.ttf   # deve ser TrueType
rm src/app/favicon.ico
```

- [ ] **Step 2: `src/data/seo.ts`**

```ts
// Textos de SEO e compartilhamento. Edite aqui para mudar título, descrição e palavras-chave.
// fallbackUrl só é usada fora da Vercel; na Vercel a URL de produção é detectada sozinha.
export const seo = {
  siteName: "Bruno Andrade",
  title: "Bruno Andrade | Desenvolvedor Front-end",
  titleTemplate: "%s | Bruno Andrade",
  description:
    "Bruno Andrade, desenvolvedor front-end Pleno em Vue 3 e Nuxt na Single Software. Arquitetura, performance e SSR em uma plataforma multi-marca de alto tráfego. Experiência, projetos e contato.",
  gameTitle: "Modo jogo",
  gameDescription:
    "A jornada de Bruno Andrade como dev em um mundo 3D: cada projeto do GitHub é uma fase para explorar.",
  keywords: [
    "Bruno Andrade",
    "desenvolvedor front-end",
    "desenvolvedor Vue",
    "Nuxt",
    "Vue 3",
    "TypeScript",
    "React",
    "Next.js",
    "SSR",
    "performance web",
    "Campina Grande",
    "portfólio",
  ],
  locale: "pt_BR",
  fallbackUrl: "http://localhost:3000",
};
```

- [ ] **Step 3: Testes (falhando)** — `src/lib/seo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
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
  it("descreve a pessoa com cargo, empresa e perfis", () => {
    expect(person).toMatchObject({
      name: "Bruno Andrade",
      jobTitle: "Desenvolvedor Front-end Pleno",
      url: "https://bruno.dev",
      worksFor: { name: "Single Software" },
    });
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
```

(Os testes rodam sem `VERCEL_PROJECT_PRODUCTION_URL`/`NEXT_PUBLIC_SITE_URL` no ambiente; se o seu shell tiver alguma, rode com elas vazias.)

Run: `npm test -- src/lib/seo.test.ts` → FAIL.

- [ ] **Step 4: `src/lib/site-url.ts`**

```ts
import { seo } from "@/data/seo";

type Env = Record<string, string | undefined>;

export function siteUrl(env: Env = process.env): string {
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return seo.fallbackUrl;
}
```

- [ ] **Step 5: `src/lib/structured-data.ts`**

```ts
import { education, jobs } from "@/data/experience";
import { attributes, profile } from "@/data/profile";
import { seo } from "@/data/seo";

type Node = Record<string, unknown> & { "@type": string };

export function structuredData(url: string): { "@context": string; "@graph": Node[] } {
  const person: Node = {
    "@type": "Person",
    "@id": `${url}/#person`,
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    url,
    image: `${url}${profile.photos.desk}`,
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
    worksFor: { "@type": "Organization", name: jobs[0].company },
    alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
    address: { "@type": "PostalAddress", addressLocality: "Campina Grande", addressRegion: "PB", addressCountry: "BR" },
    knowsAbout: attributes.map((a) => a.name),
  };
  if (profile.email) person.email = `mailto:${profile.email}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: seo.siteName,
        inLanguage: "pt-BR",
        publisher: { "@id": `${url}/#person` },
      },
    ],
  };
}
```

- [ ] **Step 6: `sitemap.ts`, `robots.ts`, `manifest.ts`** (em `src/app/`)

```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  return [
    { url: `${url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${url}/jogo`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
```

```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const url = siteUrl();
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${url}/sitemap.xml`, host: url };
}
```

```ts
import type { MetadataRoute } from "next";
import { seo } from "@/data/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seo.title,
    short_name: seo.siteName,
    description: seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0f0d0e",
    theme_color: "#c8322b",
    lang: "pt-BR",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
```

Rode os testes → PASS.

- [ ] **Step 7: `src/lib/og.tsx`** (renderizadores compartilhados; o Satori só aceita flexbox e estilos inline)

```tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

const font = () => readFile(join(process.cwd(), "public/fonts/PixelifySans-Bold.ttf"));

export async function renderOg({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const [pixel, photo] = await Promise.all([font(), readFile(join(process.cwd(), "public", profile.photos.desk))]);
  const photoUrl = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0f0d0e", color: "#f2ece6" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", width: 740 }}>
          <div style={{ fontSize: 24, color: "#f0645a", letterSpacing: 6 }}>{eyebrow}</div>
          <div style={{ fontFamily: "Pixelify", fontSize: 92, lineHeight: 1, marginTop: 18 }}>{title}</div>
          <div style={{ fontSize: 34, lineHeight: 1.3, marginTop: 26, color: "#d8cfc8" }}>{subtitle}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            {["Vue 3", "Nuxt", "TypeScript", "SSR"].map((t) => (
              <div key={t} style={{ fontSize: 24, padding: "6px 14px", border: "3px solid #3b343e", background: "#221e25" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 460,
            height: "100%",
            borderLeft: "8px solid #c8322b",
            backgroundImage: `url(${photoUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "78% center",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Pixelify", data: await pixel, weight: 700, style: "normal" }] },
  );
}

export async function renderMonogram(px: number) {
  const pixel = await font();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c8322b",
          color: "#ffffff",
          fontFamily: "Pixelify",
          fontSize: px * 0.5,
        }}
      >
        BA
      </div>
    ),
    { width: px, height: px, fonts: [{ name: "Pixelify", data: pixel, weight: 700, style: "normal" }] },
  );
}
```

(Se o Satori rejeitar `backgroundPosition` com porcentagem, use uma `<img>` com `objectFit: "cover"` e `objectPosition` e adicione exatamente `// eslint-disable-next-line @next/next/no-img-element` na linha anterior.)

- [ ] **Step 8: Arquivos de imagem** (cada um com exports literais; confira em `opengraph-image.md` e `app-icons.md`)

`src/app/opengraph-image.tsx` e `src/app/twitter-image.tsx` (mesmo conteúdo):

```tsx
import { renderOg } from "@/lib/og";

export const alt = "Bruno Andrade, desenvolvedor front-end Pleno em Vue 3 e Nuxt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "PORTFÓLIO",
    title: "Bruno Andrade",
    subtitle: "Desenvolvedor Front-end Pleno. Arquitetura, performance e SSR.",
  });
}
```

`src/app/jogo/opengraph-image.tsx` e `src/app/jogo/twitter-image.tsx`:

```tsx
import { renderOg } from "@/lib/og";

export const alt = "Modo jogo do portfólio de Bruno Andrade";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "MODO JOGO",
    title: "Dev Journey",
    subtitle: "12 projetos viraram fases em 5 mundos. Explore jogando.",
  });
}
```

`src/app/icon.tsx`:

```tsx
import { renderMonogram } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return renderMonogram(64);
}
```

`src/app/apple-icon.tsx`: igual, com `size = { width: 180, height: 180 }` e `renderMonogram(180)`, função `AppleIcon`.

- [ ] **Step 9: `layout.tsx` — só `metadata`** (remova a const local `siteUrl` antiga; importe `siteUrl` de `@/lib/site-url`, `seo` de `@/data/seo`, `profile` de `@/data/profile`):

```ts
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: seo.title, template: seo.titleTemplate },
  description: seo.description,
  applicationName: seo.siteName,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  keywords: seo.keywords,
  category: "technology",
  alternates: { canonical: "/" },
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
```

- [ ] **Step 10: `jogo/page.tsx` — só `metadata`**

```ts
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
```

- [ ] **Step 11: JSON-LD na home** — em `src/app/page.tsx`, dentro do fragmento, antes do `<SiteHeader />`:

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(siteUrl())).replace(/</g, "\\u003c") }}
      />
```

- [ ] **Step 12: Verificar** — `npm test`, `npx tsc --noEmit`, `npm run lint` limpos. Não rode `next build`.

---

### Task 3: Modo jogo no mobile + tema no jogo

(Roda em paralelo com a Task 2. Não toque em `src/app/**`, `src/lib/**` (exceto ler), `src/data/**`, `src/components/site/**`, `globals.css`.)

**Files:**
- Modify: `src/components/game/Game.tsx`, `src/components/game/Scene.tsx`, `src/components/game/ui/Hud.tsx`, `src/components/game/ui/Window.tsx`, `src/components/game/ui/TitleScreen.tsx`, `src/components/game/ui/CharacterPanel.tsx`, `src/components/game/ui/QuestsPanel.tsx`, `src/components/game/ui/ContactPanel.tsx`, `src/components/game/ui/AchievementsPanel.tsx`
- Create: `src/components/game/useSwipe.ts`

**Interfaces:**
- Consumes (Task 1): `useTheme(): Theme` de `@/lib/theme`; `ThemeToggle` de `@/components/ThemeToggle`; tokens `--title-fade`, `--scanline`; diálogo já sem contorno de foco.

Requisitos (cada um verificável em 360×740, 375×812, 390×844 e 812×375; antes de mexer, tire screenshots dessas viewports com `npx agent-browser` contra `http://localhost:3000/jogo`, já que o `next dev` do Bruno roda nessa porta, para comparar depois):

- [ ] **Step 1: Tema na cena** — `Game.tsx` lê `const theme = useTheme()` e passa `theme` para `<Scene>`. Em `Scene.tsx`, troque as constantes de cor fixas por uma paleta:

```ts
const PALETTES = {
  dark: {
    bg: "#0f0d0e", ambient: 0.5, sky: "#ffe6d2", ground: "#1b1420", hemi: 0.75, sun: 1.7,
    stars: true, sparkle: "#f3cfa8", text: "#f2ece6", muted: "#aaa1a6", accentText: "#f0645a",
    trail: "#6d6168", trailGlow: "#3a2f35", stone: "#2a2429", frame: "#2a2429", placeholder: "#221e25",
  },
  light: {
    bg: "#f4efe8", ambient: 0.85, sky: "#ffffff", ground: "#d9cbbb", hemi: 0.9, sun: 1.35,
    stars: false, sparkle: "#c8322b", text: "#1c1618", muted: "#62575b", accentText: "#b4271f",
    trail: "#b9aca1", trailGlow: "#e6dbcf", stone: "#cbbdae", frame: "#d3c6b8", placeholder: "#efe7dd",
  },
} as const;
type Palette = (typeof PALETTES)[keyof typeof PALETTES];
```

`Scene` recebe `theme`, calcula `const palette = PALETTES[theme]` e o repassa (prop `palette`) a `Level`, `Screen`/`ScreenPlaceholder`, `Trail`, `Rocks` (a mistura com o fundo usa `palette.bg`), `WorldGate`, `Flag`. Fundo e névoa usam `palette.bg`; `<Stars>` só quando `palette.stars`; `Sparkles` usa `palette.sparkle`; rótulos `Text` usam `palette.text/muted/accentText`. O `Rocks` precisa refazer as cores quando a paleta muda (inclua `palette.bg` nas dependências do `useLayoutEffect`).

- [ ] **Step 2: Janela como folha no mobile** — `Window.tsx`:
  - overlay: `fixed inset-0 z-40 grid place-items-center bg-bg/70 sm:p-6`
  - diálogo: `pixel-box pop-in flex h-dvh w-full flex-col outline-none sm:h-auto sm:max-h-[min(90dvh,860px)] sm:max-w-5xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0`
  - corpo rolável: `min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6`
  - o botão de fechar tem área de toque ≥ 44×44 px no mobile.

- [ ] **Step 3: Fotos dos painéis**
  - `CharacterPanel`: a `figure` grande ganha `hidden md:block`; acima do nome, um avatar `md:hidden` (`relative size-16 shrink-0 overflow-hidden border-2 border-line`, `Image` de `profile.photos.desk` com `className="object-cover object-[78%_center]"`, `sizes="64px"`) em linha com o `h3`. A cor dos ícones do inventário segue o tema: `https://cdn.simpleicons.org/${slug}/${theme === "light" ? "1c1618" : "f2ece6"}` (use `useTheme()`).
  - `QuestsPanel` e `ContactPanel`: o contêiner da foto ganha `hidden md:block`; a grade passa a 1 coluna no mobile sem espaço vazio.
  - `AchievementsPanel`: ícone desbloqueado usa `text-white` no lugar de `text-text`.

- [ ] **Step 4: Tela de título** — fundo: `bg-[var(--title-fade)] md:bg-[linear-gradient(90deg,var(--bg)_0%,var(--title-fade)_38%,transparent_75%)]` (sem cor literal). Título `text-5xl sm:text-8xl`; o bloco respeita `px-5` e não estoura em 360 px.

- [ ] **Step 5: HUD responsivo** — em `Hud.tsx`:
  - Contêiner: `pointer-events-none fixed inset-0 z-20 flex flex-col justify-between gap-2 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-[max(env(safe-area-inset-top),0.75rem)] sm:p-5`.
  - **Topo**: `PlayerCard` (só avatar abaixo de `sm`, como hoje), `WorldBanner` (`md:block`), e menu:
    - `≥ sm`: a barra atual (`hidden sm:flex`) **mais** `<ThemeToggle />` antes do botão de som.
    - `< sm`: componente `MobileMenu` (`sm:hidden`): um `pixel-btn` "Menu" (ícone `List`, `aria-expanded`, `aria-controls="menu-jogo"`) que abre, logo abaixo e alinhado à direita, uma lista `pixel-box` (`id="menu-jogo"`) com itens de largura total e altura ≥ 44 px: Personagem, Missões, Conquistas, Contato (abrem o painel e fecham o menu), Portfólio (`Link href="/"`), Som (liga/desliga, rótulo reflete o estado) e Tema (`ThemeToggle` com classe de item, mostrando também o texto "Modo claro"/"Modo escuro"). Fecha com Esc, clique fora ou ao escolher um item.
  - **Rodapé** (`grid min-w-0 gap-2 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-end`):
    - `LevelCard`: `pixel-box pointer-events-auto min-w-0 p-3 sm:p-4`; título `truncate`; resumo `line-clamp-2` e escondido em paisagem baixa (`[@media(max-height:500px)]:hidden`); a linha de tags fica `hidden sm:block`; o botão "Abrir fase" nunca encolhe nem sai do card (linha com `min-w-0` e o texto das tags com `min-w-0 truncate`). A borda do `kbd` usa `!border-white/60`.
    - `MiniMap`: visível em todos os tamanhos, `h-4` nas barras abaixo de `sm`, escondido em paisagem baixa.
    - `Controls`: dica de teclado `hidden lg:flex [@media(pointer:coarse)]:!hidden`; controles de toque `pointer-events-auto flex justify-between gap-3 lg:hidden [@media(pointer:coarse)]:!flex` com botões ≥ 48 px de altura; o botão central "Abrir fase" ocupa o espaço do meio (`flex-1`).
  - Em paisagem baixa, o rodapé vira uma linha (`[@media(max-height:500px)]:grid-cols-[minmax(0,1fr)_auto]`), com card compacto à esquerda e controles à direita.

- [ ] **Step 6: Gesto de deslizar** — `src/components/game/useSwipe.ts`:

```ts
import { useEffect } from "react";
import { useGame } from "./store";

const MIN_DISTANCE = 50;
const MAX_DURATION = 700;

export function useSwipe(target: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let start: { x: number; y: number; t: number } | null = null;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      start = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerType !== "touch") return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const fast = performance.now() - start.t < MAX_DURATION;
      start = null;
      const game = useGame.getState();
      if (game.screen !== "play" || game.panel) return;
      if (fast && Math.abs(dx) > MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) {
        game.move(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
    };
  }, [target]);
}
```

Em `Game.tsx`, o `div` que envolve o `<Scene>` recebe um `ref` e `useSwipe(ref)`; adicione `touch-action: pan-y` (`touch-none` não, para não travar a rolagem do navegador) nesse `div`. Em `Scene.tsx`, o `onClick` de `Level` só age se `e.delta <= 8` (evento do R3F: distância em px entre down e up), para um deslize não virar clique.

- [ ] **Step 7: Verificar** — `npx tsc --noEmit` e `npx eslint src/components/game` limpos; nenhum comentário novo (`grep -rnE "^\s*(//|/\*)|\{/\*" src/components/game` só pode mostrar as duas diretivas `eslint-disable` já existentes). Tire de novo os screenshots das 4 viewports nos dois temas (para trocar o tema no navegador: `npx agent-browser eval "localStorage.setItem('theme','light');location.reload()"`), abra com Read e confirme: nada cortado, botão "Abrir fase" e setas visíveis, menu mobile abre/fecha, janelas em tela cheia, cena 3D clara no tema claro. Corrija o que estiver quebrado. Liste no relatório o que viu em cada screenshot.

---

### Task 4: Verificação final, E2E e README

**Files:** Modify `README.md` (seções "SEO" e "Tema"; sem travessões).

- [ ] **Step 1: README** — acrescente:

```markdown
## SEO

- Textos de título, descrição e palavras-chave: `src/data/seo.ts`.
- A URL do site vem da Vercel (`VERCEL_PROJECT_PRODUCTION_URL`); fora dela, defina `NEXT_PUBLIC_SITE_URL` ou edite `fallbackUrl`.
- Imagens de compartilhamento geradas em `src/app/opengraph-image.tsx` e `src/app/jogo/opengraph-image.tsx`; também há `sitemap.xml`, `robots.txt`, `manifest.webmanifest` e JSON-LD de Person na home.

## Tema

O botão de sol/lua alterna entre claro e escuro na home e no jogo. Sem escolha salva, o site segue o tema do sistema.
```

- [ ] **Step 2: Gates** — `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` (rotas esperadas: `/`, `/jogo`, `/opengraph-image`, `/twitter-image`, `/jogo/opengraph-image`, `/jogo/twitter-image`, `/icon`, `/apple-icon`, `/manifest.webmanifest`, `/sitemap.xml`, `/robots.txt`). Se o build falhar por tipos obsoletos em `.next`, apague `.next` e refaça.

- [ ] **Step 3: E2E** com `npx next start -p 3100` (pare no fim) e `npx agent-browser` (screenshots no scratchpad, nunca no repo):
  1. `<head>` da home: `title`, `meta[name=description]`, `link[rel=canonical]` absoluto, `og:title`, `og:description`, `og:image` absoluto, `og:locale=pt_BR`, `twitter:card=summary_large_image`, `twitter:image`, `script[type="application/ld+json"]` com JSON válido contendo `Person`.
  2. `/jogo`: title `Modo jogo | Bruno Andrade`, canonical `/jogo`, `og:image` do jogo.
  3. `curl -s -o /dev/null -w "%{http_code} %{content_type}"` para a URL do `og:image` (home e jogo), `/icon`, `/apple-icon`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`: todos 200 com o tipo certo. Abra os PNGs de og com Read e avalie.
  4. Tema: com `localStorage` limpo e `prefers-color-scheme: light` (`npx agent-browser set media light`, ou equivalente do `--help`), a home abre com `data-theme="light"`; clicar em `[data-theme-toggle]` vira `dark`; após reload continua `dark`. Screenshots da home nos dois temas (desktop 1280 e mobile 375).
  5. Jogo mobile nas 4 viewports (360×740, 375×812, 390×844, 812×375) nos dois temas: `document.documentElement.scrollWidth <= innerWidth`; o retângulo do botão "Abrir fase" e das setas está dentro da viewport; o menu mobile abre, lista os 7 itens e fecha com Esc; abrir Personagem mostra janela em tela cheia sem foto grande; screenshots revisados.
  6. Swipe: simule um deslize de toque na cena (por exemplo, `eval` disparando `PointerEvent`s com `pointerType: "touch"` no elemento da cena) e confirme que o "Fase 1 de 12" vira "Fase 2 de 12".
  7. Console sem erros em `/` e `/jogo`.

- [ ] **Step 4: Corrija o que estiver quebrado** nos arquivos do respectivo componente e repita os passos 2 e 3. Não commite.
