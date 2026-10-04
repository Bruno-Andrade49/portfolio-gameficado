export const GITHUB_USER = "Bruno-Andrade49";

export const profile = {
  name: "Bruno Andrade",
  role: "Desenvolvedor Front-end Pleno",
  headline: "Front-end | Vue 3 & Nuxt | React & Nuxt | Wordpress",
  location: "Campina Grande, PB",
  address: { locality: "Campina Grande", region: "PB", country: "BR" },
  bio: "Opa! Sou o Bruno, desenvolvedor frontend movido por curiosidade. Gosto de entender como as coisas funcionam e estou sempre buscando aprender algo novo e encarar desafios que me façam crescer.",
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

/** Atributos da ficha do personagem no modo jogo, de 0 a 10. */
export const attributes: { name: string; level: number }[] = [
  { name: "Vue", level: 8 },
  { name: "Nuxt", level: 8 },
  { name: "TypeScript", level: 7 },
  { name: "React", level: 7 },
  { name: "Next.js", level: 7 },
  { name: "Tailwind", level: 7 },
  { name: "Java", level: 6 },
  { name: "Spring Boot", level: 5 },
  { name: "Prisma", level: 5 },
  { name: "PostgreSQL", level: 5 },
];
