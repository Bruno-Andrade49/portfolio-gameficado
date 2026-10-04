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
