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
