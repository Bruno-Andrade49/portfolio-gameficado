"use client";

import {
  ArrowLeft,
  ArrowRight,
  GithubLogo,
  Play,
  Star,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import { worlds } from "@/data/projects";
import type { Project } from "@/lib/projects";
import { useGame } from "../store";
import { Window } from "./Window";

const CATEGORY_LABEL = {
  frontend: "Front-end",
  backend: "Back-end",
} as const;

const dateFmt = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" });

export function LevelPanel({ projects }: { projects: Project[] }) {
  const index = useGame((s) => s.index);
  const close = useGame((s) => s.close);
  const move = useGame((s) => s.move);
  const project = projects[index];
  if (!project) return null;

  return (
    <Window title={`Fase ${index + 1} de ${projects.length}`} onClose={close}>
      <LevelBody key={project.slug} project={project} />
      <nav className="mt-6 flex items-center justify-between gap-3 border-t-2 border-line pt-4">
        <button
          className="pixel-btn"
          onClick={() => move(-1)}
          aria-disabled={index === 0}
        >
          <ArrowLeft size={16} weight="bold" />
          Fase anterior
        </button>
        <button
          className="pixel-btn"
          onClick={() => move(1)}
        >
          {index === projects.length - 1 ? "Bandeira final" : "Próxima fase"}
          <ArrowRight size={16} weight="bold" />
        </button>
      </nav>
    </Window>
  );
}

function LevelBody({ project }: { project: Project }) {
  const world = worlds.find((w) => w.id === project.worldId)!;
  const gallery = project.images.length ? project.images : [project.cover];
  const [current, setCurrent] = useState(0);
  const isGithubCard = !project.images.length;

  return (
    <div className="grid gap-6 md:grid-cols-[1.45fr_1fr]">
      <div className="min-w-0">
        <div className="relative aspect-[16/10] overflow-hidden border-2 border-line bg-panel-2">
          <Image
            src={gallery[current]}
            alt={`Tela do projeto ${project.title}`}
            fill
            sizes="(min-width: 768px) 560px, 100vw"
            className={isGithubCard ? "object-contain" : "object-cover object-top"}
            preload
          />
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setCurrent(i)}
                aria-label={`Ver tela ${i + 1}`}
                aria-pressed={i === current}
                className={`relative aspect-[16/10] overflow-hidden border-2 transition-colors ${
                  i === current ? "border-accent" : "border-line hover:border-muted"
                }`}
              >
                <Image src={src} alt="" fill sizes="180px" className="object-cover object-top" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <p className="font-mono text-xs text-muted">
          Mundo {world.id}: {world.name}
        </p>
        <h3 className="mt-1 font-pixel text-3xl leading-tight text-text sm:text-4xl">
          {project.title}
        </h3>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-muted">{project.summary}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tecnologias">
          {project.tags.map((t) => (
            <li key={t} className="border-2 border-line bg-panel-2 px-2 py-0.5 font-mono text-xs text-text">
              {t}
            </li>
          ))}
        </ul>

        <dl className="mt-5 grid grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <dt className="text-muted">Tipo</dt>
            <dd className="mt-1 text-text">
              {CATEGORY_LABEL[project.category]}
              {project.badge ? ` · ${project.badge}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Início</dt>
            <dd className="mt-1 text-text">{dateFmt.format(new Date(project.date))}</dd>
          </div>
          <div>
            <dt className="text-muted">Estrelas</dt>
            <dd className="mt-1 flex items-center gap-1 text-text">
              <Star size={12} weight="fill" /> {project.stars}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="pixel-btn"
              data-variant="primary"
            >
              <Play size={16} weight="fill" />
              Jogar
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="pixel-btn">
              <GithubLogo size={16} weight="bold" />
              Ver código
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
