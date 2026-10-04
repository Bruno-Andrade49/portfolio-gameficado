# Jogo no mobile, SEO completo e tema claro/escuro

Data: 2026-10-04 · Status: aprovado (aprovação delegada pelo Bruno)

## Decisões do Bruno

- URL de produção: detectada da Vercel (`VERCEL_PROJECT_PRODUCTION_URL`), com fallback configurável em `src/data/seo.ts`.
- Tema: home + interface do jogo (HUD e janelas) alternam; o mundo 3D ganha versão "dia".
- Tema padrão: segue o sistema até o visitante escolher; a escolha fica salva.
- og-image: gerada pelo Next (`next/og`) no estilo do site, uma para a home e outra para `/jogo`.

## 1. Jogo no mobile

Problemas observados em 375×812 (screenshots da exploração):

- Card da fase transborda à direita; botão "Abrir fase" cortado.
- Minimapa escondido no rodapé; controles de toque não aparecem (dependem de `pointer: coarse`).
- Menu de ícones quebra em duas linhas.
- Janelas: contorno vermelho de foco no diálogo inteiro; fotos ocupam a tela inteira antes do conteúdo (Personagem, Missões, Contato).
- Tela de título: rótulos 3D do cenário aparecem por cima do texto.

Requisitos:

- **Sem scroll horizontal** e nenhum elemento interativo fora da viewport em 360×740, 375×812, 390×844 e em paisagem 812×375.
- **HUD mobile (< 640 px)**: topo com avatar compacto + botão "Menu" que abre uma lista (Personagem, Missões, Conquistas, Contato, Portfólio, Som, Tema). ≥ 640 px mantém a barra de botões atual.
- **Rodapé mobile**: card da fase em largura total (título, resumo em 2 linhas, sem tags) com botões ◀ Abrir ▶ sempre visíveis; minimapa compacto. Controles de toque aparecem por largura (`< 1024 px`) **ou** `pointer: coarse`.
- **Gestos**: deslizar horizontalmente no cenário troca de fase.
- **Janelas** viram folha de tela cheia no mobile (respeitando safe-area), sem contorno de foco no contêiner; fotos limitadas (Personagem: avatar pequeno ao lado do nome; Missões e Contato: foto oculta abaixo de `md`).
- **Paisagem baixa** (altura < 500 px): HUD compacto (sem resumo no card, menu em ícones).
- **Título**: overlay cobre a largura toda no mobile para o texto não disputar com o cenário.

## 2. SEO

- `src/data/seo.ts` (editável): nome do site, título padrão, template, descrição, palavras-chave, autor, locale, `fallbackUrl`.
- `src/lib/site-url.ts`: `siteUrl()` → `https://${VERCEL_PROJECT_PRODUCTION_URL}` → `NEXT_PUBLIC_SITE_URL` → `seo.fallbackUrl`.
- `layout.tsx` metadata: `metadataBase`, `title { default, template }`, `description`, `keywords`, `authors`, `creator`, `applicationName`, `alternates.canonical`, `openGraph` (website, pt_BR, siteName, url), `twitter` (`summary_large_image`), `robots` (index/follow, `max-image-preview: large`), `formatDetection.telephone: false`, `category`.
- `/jogo`: título "Modo jogo", descrição própria, canonical `/jogo`.
- Arquivos de metadados: `app/opengraph-image.tsx`, `app/jogo/opengraph-image.tsx` (1200×630, fonte pixel, nome, cargo, stack, foto), `app/icon.tsx` + `app/apple-icon.tsx` (monograma "BA" pixel), `app/manifest.ts`, `app/sitemap.ts` (`/`, `/jogo`), `app/robots.ts`.
- JSON-LD na home: `Person` (nome, cargo, url, imagem, `sameAs` GitHub/LinkedIn, `worksFor` Single Software, `alumniOf` Unifacisa, endereço, `knowsAbout`) + `WebSite`.
- `viewport.themeColor` por esquema de cor; `<html data-scroll-behavior="smooth">` (aviso atual do Next).

## 3. Tema claro/escuro

- Tokens em `globals.css`: escuro (atual) em `:root`, claro em `:root[data-theme="light"]`; `color-scheme` acompanha.
- Script inline no `<head>` define `data-theme` antes da pintura (localStorage `theme` → senão `prefers-color-scheme`); sem flash e sem erro de hidratação (`suppressHydrationWarning` no `<html>`). Sem preferência salva, acompanha mudanças do sistema.
- `src/lib/theme.ts`: `useTheme()` (useSyncExternalStore observando `data-theme`) e `setTheme()`.
- `ThemeToggle` (botão sol/lua, `aria-label` dinâmico) no header da home e no menu do jogo.
- Cores fixas no código viram tokens (gradiente do título, ícones do inventário `cdn.simpleicons.org/<slug>/<cor>`, scanlines, borda do `kbd`).
- Cena 3D: fundo/névoa/luzes/estrelas/brilhos/cor dos rótulos dependem do tema (dia: fundo areia claro, sem estrelas, rótulos escuros).

## Testes

- Vitest: `siteUrl()` (prioridades), JSON-LD (campos obrigatórios), `sitemap()`/`robots()`/`manifest()` (URLs absolutas), script de tema (avaliado com `localStorage`/`matchMedia` falsos: salvo vence sistema; sem salvo segue sistema).
- `tsc`, `lint`, `build` limpos.
- E2E agent-browser: tags `<head>` (title, description, canonical, og:*, twitter:*), `og-image` responde 200 `image/png`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, ícones; alternar tema muda `data-theme` e persiste após reload, sem flash; jogo em 375×812, 360×740 e 812×375 sem overflow, botão "Abrir fase" e setas dentro da viewport, menu mobile abre e fecha, swipe troca de fase; screenshots dos dois temas revisados.
