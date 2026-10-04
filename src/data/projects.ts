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
