# Portfólio: currículo claro + projetos curados

Data: 2026-10-04 · Status: aprovado (aprovação delegada pelo Bruno)

## Objetivo

Quem chega no portfólio (recrutador, tech lead) precisa entender em segundos **quem é o Bruno, onde trabalha, o que já fez e como contatá-lo**. Hoje a home é direto um jogo 3D, a experiência fica escondida no menu "Missões", está desatualizada (diz "Impulse, dez 2022 – atual", sem Single Software) e são listados ~45 repositórios, muitos de estudo.

## Decisões do Bruno

- Home vira **página profissional clara**; o jogo 3D continua disponível como **"Modo jogo"** em `/jogo`.
- Projetos front-end mantidos (somente estes): `bruno-financas`, `conecta`, `managment-clinic`, `csr-repository` + `ssr-repository` (TCC: análise comparativa CSR vs SSR), `fullstack-barberBooking`, `DTMoney`, `new-portfolio-bruno`.
- Projetos back-end (4): `springboot-tests`, `Projeto_Site_Impulse`, `petshop_BrunoApp`, `BrMovie-SpringReact`.
- Trabalhos privados da Impulse (CRM Impulse, Site EasyData, Lojas Tem Jeito) **saem da lista de projetos** e viram galeria dentro do card da Impulse na linha do tempo.
- Contatos públicos: e-mail, LinkedIn, WhatsApp/telefone e botão para baixar o currículo em PDF.

## Fonte de verdade do currículo

Currículo PDF (Downloads/Curriculo-Bruno-Andrade (2).pdf), copiado para `public/curriculo-bruno-andrade.pdf`:

- Desenvolvedor Front-end Pleno · Single Software · mai/2025 – atual (plataforma multi-marca Vue 3/Nuxt/TS/Pinia/PrimeVue+Tailwind, SSR alto tráfego; arquitetura de configuração multi-marca; performance/Core Web Vitals, lazy/idle, cache de sessão, fontes; componentes base do design system; code review).
- Desenvolvedor Front-end Júnior · Single Software · mai/2024 – mai/2025 (WordPress → plataforma Vue.js; entregas de produto → arquitetura/performance → promoção).
- Desenvolvedor Front-end · Impulse Business Solutions · nov/2022 – set/2023 (React, JS, HTML/CSS, WordPress; CMS interno; landing pages).
- Bacharelado em Sistemas de Informação · Unifacisa · jun/2020 – dez/2024.
- Competências em 4 grupos (Front-end; Arquitetura & Performance; Back-end & Dados; Práticas). Idiomas: Português nativo, Inglês básico.
- Contato: brunoa71240@gmail.com · (83) 98212-1351 · linkedin.com/in/brunoandrade-386b331b6.

## Arquitetura

### Dados (`src/data`)

- `profile.ts`: `profile` atualizado (nome, cargo "Desenvolvedor Front-end Pleno", headline "Vue 3 & Nuxt · Arquitetura, performance e SSR", local, bio curta, `about` (resumo do CV), email, linkedin, whatsapp `https://wa.me/5583982121351`, phone `(83) 98212-1351`, `resume: "/curriculo-bruno-andrade.pdf"`, github, photos). `mainQuest` removido.
- **novo** `experience.ts`: `jobs: Job[]` (empresa, local, roles[] com título/período/start/end/bullets, stack, `gallery?` com `{src,title,caption,href?}`), `education`, `skills` (grupos), `languages`, helper `careerStart` (ISO do primeiro emprego).
- `projects.ts`: `overrides` + auto-inclusão substituídos por **allowlist** `showcase: ShowcaseEntry[]` (`repo`, `title`, `summary`, `highlights?`, `tags`, `category: "frontend" | "backend"`, `badge?: string`, `featured?`). `extraProjects` removido. `worlds` com intros revisadas. `techIcons` mantido.

### Lógica (`src/lib/projects.ts`)

- `getProjects()` monta **apenas** os repositórios do `showcase`, enriquecidos com dados do GitHub (API ou snapshot). Entrada sem repo encontrado é ignorada com `console.warn` (não quebra o build).
- `Project` ganha `category`, `badge`, `highlights`; `kind` é removido. Ordem cronológica (usada pelo jogo); a home ordena por curadoria (`showcase` order).
- `getStats()` mantém o contrato.

### Páginas

- `/` — **nova** página server-rendered (sem 3D), seções com âncoras:
  1. **Header fixo**: nome, links (Experiência, Projetos, Back-end, Contato), botões "Currículo PDF" e "Modo jogo".
  2. **Hero**: foto, nome, cargo, headline, local, resumo; CTAs (Baixar currículo, Falar comigo, Ver projetos); faixa de destaques ("Quase 4 anos de experiência", "Pleno na Single Software", "Bacharel em SI", stack principal).
  3. **Experiência**: linha do tempo vertical. Single Software com os dois cargos aninhados (promoção visível), Impulse com galeria dos 3 trabalhos de cliente.
  4. **Competências**: 4 grupos + idiomas e formação.
  5. **Projetos front-end**: cards com print, resumo, stack, links (site/código). TCC (CSR × SSR) em um card largo único explicando a pesquisa, com link para os dois repositórios.
  6. **Projetos back-end**: 4 cards focados em texto (o que faz, destaques técnicos, stack, link do código).
  7. **Contato**: e-mail, WhatsApp, LinkedIn, GitHub, PDF.
- `/jogo` — o jogo atual (conteúdo de `page.tsx` antigo). Links internos de "modo clássico" passam a apontar para `/`.
- `/projetos` — removida; `next.config.ts` redireciona `/projetos` → `/#projetos` (não permanente).

### Componentes

Novo diretório `src/components/site/` com um componente por seção (`SiteHeader`, `Hero`, `ExperienceTimeline`, `Skills`, `FrontendProjects`, `BackendProjects`, `Contact`, `SiteFooter`), todos server components; nada de estado no cliente na home.

### Jogo

- `QuestsPanel`: missão principal = cargo atual (Single Software); "Missões concluídas" = cargos anteriores; sem atalhos para fases removidas.
- `ContactPanel`: e-mail, WhatsApp, LinkedIn, GitHub, PDF.
- `AchievementsPanel`: "Contratado" usa o primeiro emprego (Impulse, nov/2022).
- `TitleScreen`/`Hud`/`NoWebGL`: "Modo clássico" → "Portfólio" (`/`).
- `LevelPanel`: rótulo de tipo usa `category` + `badge`.

## Visual

Mantém a identidade atual (tema escuro, vermelho da marca, `pixel-box`, Pixelify para títulos/rótulos) para dar unidade com o jogo, mas com **Geist para todo texto corrido**, hierarquia clara, largura de leitura confortável, responsivo a partir de 360 px sem scroll horizontal, foco visível e contraste AA. Sem efeito CRT na home.

## Erros e bordas

- API do GitHub fora → snapshot (já existe).
- Repo do showcase ausente → warn e segue.
- Projeto sem print → card do GitHub local (`public/projects/github/*`) ou, no back-end, card só de texto.
- Contatos ausentes no `profile` ficam ocultos.

## Testes / validação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` sem erros.
- E2E com **agent-browser (Vercel)** em `next start`:
  - `/` mostra Hero, Experiência (Single Pleno, Single Júnior, Impulse), 6 cards front-end + card TCC, 4 cards back-end, Contato com 4 canais + PDF.
  - Nenhum projeto fora da allowlist aparece (ex.: "Líder Açaí", "Mario Card").
  - `/curriculo-bruno-andrade.pdf` responde 200.
  - `/projetos` redireciona para `/#projetos`.
  - `/jogo` renderiza (jogo ou fallback sem WebGL) e o painel Missões mostra Single Software.
  - Viewport 375 px sem scroll horizontal; screenshots desktop e mobile revisados.
