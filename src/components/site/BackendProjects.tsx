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
