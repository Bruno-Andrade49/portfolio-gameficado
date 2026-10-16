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
    period: "mai/2024 a out/2026",
    current: false,
    roles: [
      {
        title: "Desenvolvedor Front-end Pleno",
        period: "mai/2025 a out/2026",
        start: "2025-05-01T12:00:00",
        end: "2026-10-16T12:00:00",
        bullets: [
          "Atuei na plataforma multi-marca da Single (Vue 3, Nuxt, TypeScript, Pinia, PrimeVue e Tailwind), com aplicações SSR de alto volume de tráfego.",
          "Participei da evolução da arquitetura de configuração multi-marca, reduzindo o esforço de manutenção e de criação de novas marcas.",
          "Contribuí com iniciativas de performance guiadas pelo Google Lighthouse: renderização lazy/idle, cache de dados em nível de sessão e otimização do carregamento de fontes.",
          "Desenvolvi componentes base do design system, reutilizados por todas as marcas.",
          "Fiz revisão de código no fluxo de entrega das demandas.",
        ],
      },
      {
        title: "Desenvolvedor Front-end Júnior",
        period: "mai/2024 a mai/2025",
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
    period: "nov/2022 a set/2023",
    current: false,
    roles: [
      {
        title: "Desenvolvedor Front-end",
        period: "nov/2022 a set/2023",
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
  period: "jun/2020 a dez/2024",
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
    items: ["SSR e hidratação", "Google Lighthouse", "Design systems", "Componentização"],
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

export const languages: { name: string; level: string }[] = [
  { name: "Português", level: "Nativo" },
  { name: "Inglês", level: "Básico, em desenvolvimento" },
];

/** Faixa de números do topo da home. */
export const highlights: { value: string; label: string }[] = [
  { value: "Desde 2022", label: "construindo interfaces para a web" },
  { value: "Pleno", label: "front-end com foco em Vue e Nuxt" },
  { value: "Vue · Nuxt", label: "stack principal, com TypeScript" },
  { value: "Estudante", label: "Buscando sempre evoluir" },
];
