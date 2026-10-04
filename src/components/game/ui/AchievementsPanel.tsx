"use client";

import {
  Briefcase,
  Flag,
  Medal,
  Package,
  RocketLaunch,
  Sparkle,
  Stack,
  Star,
  Translate,
  Trophy,
  type Icon,
} from "@phosphor-icons/react";
import { careerStart, jobs } from "@/data/experience";
import type { JourneyStats, Project } from "@/lib/projects";
import { useGame } from "../store";
import type { PlayerLevel } from "../useLevel";
import { Window } from "./Window";

type Achievement = {
  icon: Icon;
  title: string;
  text: string;
  goal?: [number, number];
};

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(iso));

export function buildAchievements(
  stats: JourneyStats,
  projects: Project[],
  level: PlayerLevel,
): Achievement[] {
  const has = (tag: string) => projects.some((p) => p.tags.includes(tag));
  return [
    { icon: Flag, title: "Hello, World", text: `Primeiro repositório em ${monthYear(stats.firstRepo)}.` },
    {
      icon: Briefcase,
      title: "Contratado",
      text: `Primeiro emprego como dev na ${jobs[jobs.length - 1].company} em ${monthYear(careerStart)}.`,
    },
    { icon: Medal, title: "Veterano", text: `${level.level} anos de jornada no código.`, goal: [level.level, 5] },
    { icon: Package, title: "Colecionador", text: `${stats.repoCount} repositórios públicos.`, goal: [stats.repoCount, 25] },
    { icon: RocketLaunch, title: "Deploy em série", text: `${stats.liveCount} projetos no ar.`, goal: [stats.liveCount, 10] },
    {
      icon: Translate,
      title: "Poliglota",
      text: `${stats.languages.length} linguagens: ${stats.languages.join(", ")}.`,
      goal: [stats.languages.length, 5],
    },
    {
      icon: Stack,
      title: "Full-stack",
      text: "Back-end com Spring Boot e com Prisma em projetos completos.",
      goal: [Number(has("Spring Boot")) + Number(has("Prisma")), 2],
    },
    { icon: Sparkle, title: "Animador", text: "Interfaces animadas com GSAP e Framer Motion.", goal: [Number(has("GSAP") || has("Framer Motion")), 1] },
    { icon: Trophy, title: "Centenário", text: "Chegar a 100 repositórios públicos.", goal: [stats.repoCount, 100] },
    { icon: Star, title: "Estrela do GitHub", text: "Receber 50 estrelas nos repositórios.", goal: [stats.stars, 50] },
  ];
}

export function AchievementsPanel({
  stats,
  projects,
  level,
}: {
  stats: JourneyStats;
  projects: Project[];
  level: PlayerLevel;
}) {
  const close = useGame((s) => s.close);
  const list = buildAchievements(stats, projects, level);
  const unlocked = list.filter((a) => !a.goal || a.goal[0] >= a.goal[1]).length;

  return (
    <Window title="Conquistas" onClose={close}>
      <p className="font-mono text-sm text-muted">
        {unlocked} de {list.length} desbloqueadas, calculadas a partir do GitHub.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {list.map((a) => {
          const done = !a.goal || a.goal[0] >= a.goal[1];
          const Icon = a.icon;
          return (
            <li
              key={a.title}
              className={`flex gap-4 border-2 p-4 ${
                done ? "border-line bg-panel-2" : "border-dashed border-line opacity-60"
              }`}
            >
              <span
                className={`grid size-12 shrink-0 place-items-center border-2 ${
                  done ? "border-accent bg-accent text-white" : "border-line text-muted"
                }`}
              >
                <Icon size={24} weight={done ? "fill" : "regular"} />
              </span>
              <div className="min-w-0">
                <p className="font-pixel text-lg leading-tight">{a.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.text}</p>
                {!done && a.goal && (
                  <p className="mt-1 font-mono text-xs text-muted">
                    Bloqueada: {a.goal[0]} de {a.goal[1]}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Window>
  );
}
