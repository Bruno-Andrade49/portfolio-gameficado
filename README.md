# Bruno Andrade · Portfólio

Meu portfólio, desenvolvedor front-end Pleno (Vue 3 & Nuxt). A home apresenta currículo, projetos e contato; o modo jogo transforma os mesmos projetos em fases de um mundo 3D (three.js + React Three Fiber).

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

## Prints dos projetos

```bash
npx playwright install chromium   # só na primeira vez
npm run screenshots                # prints + cards do GitHub
node scripts/screenshots.mjs --cards-only
```

O script abre cada `homepage` dos repositórios em um Chromium headless e salva o print em `public/projects/`. Deploys fora do ar são descartados, e esses projetos usam o card do GitHub (salvo em `public/projects/github/`). Rode de novo sempre que publicar um projeto novo.

## SEO

- Textos de título, descrição e palavras-chave: `src/data/seo.ts`.
- A URL do site vem da Vercel (`VERCEL_PROJECT_PRODUCTION_URL`); fora dela, defina `NEXT_PUBLIC_SITE_URL` ou edite `fallbackUrl`.
- Imagens de compartilhamento geradas em `src/app/opengraph-image.tsx` e `src/app/jogo/opengraph-image.tsx`; também há `sitemap.xml`, `robots.txt`, `manifest.webmanifest` e JSON-LD de Person na home.

## Tema

O botão de sol/lua alterna entre claro e escuro na home e no jogo. Sem escolha salva, o site segue o tema do sistema.
