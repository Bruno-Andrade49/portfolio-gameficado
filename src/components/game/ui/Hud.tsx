"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChatCircleDots,
  House,
  List,
  Moon,
  Scroll,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  Trophy,
  User,
  type Icon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { profile } from "@/data/profile";
import { worlds } from "@/data/projects";
import type { Project } from "@/lib/projects";
import { setTheme, useTheme } from "@/lib/theme";
import { useGame, type Panel } from "../store";
import type { PlayerLevel } from "../useLevel";

export function Hud({ projects, level }: { projects: Project[]; level: PlayerLevel }) {
  const index = useGame((s) => s.index);
  const project = projects[index];
  const world = worlds.find((w) => w.id === project?.worldId);
  if (!project || !world) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between gap-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pl-[max(env(safe-area-inset-left),0.75rem)] pr-[max(env(safe-area-inset-right),0.75rem)] pt-[max(env(safe-area-inset-top),0.75rem)] sm:pb-[max(env(safe-area-inset-bottom),1.25rem)] sm:pl-[max(env(safe-area-inset-left),1.25rem)] sm:pr-[max(env(safe-area-inset-right),1.25rem)] sm:pt-[max(env(safe-area-inset-top),1.25rem)]">
      <div className="flex items-start justify-between gap-3">
        <PlayerCard level={level} />
        <MobileWorldBanner key={`m-${world.id}`} name={world.name} id={world.id} years={world.years} />
        <WorldBanner key={world.id} name={world.name} id={world.id} years={world.years} />
        <Menu />
        <MobileMenu />
      </div>

      <div
        className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-end [@media(max-height:500px)]:grid-cols-[minmax(0,1fr)_auto] [@media(max-height:500px)]:items-end"
      >
        <LevelCard project={project} index={index} total={projects.length} worldName={world.name} />
        <div className="flex min-w-0 flex-col gap-2 lg:items-end">
          <MiniMap projects={projects} index={index} />
          <Controls />
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ level }: { level: PlayerLevel }) {
  const open = useGame((s) => s.open);
  const filled = Math.round(level.progress * 10);
  return (
    <button
      onClick={() => open("character")}
      className="pixel-box pointer-events-auto flex shrink-0 items-center gap-3 p-2 text-left transition-transform active:translate-x-0.5 active:translate-y-0.5 sm:pr-4"
      aria-label="Abrir ficha do personagem"
    >
      <span className="relative size-11 shrink-0 overflow-hidden border-2 border-line">
        <Image
          src={profile.photos.desk}
          alt=""
          fill
          sizes="44px"
          className="origin-[80%_16%] scale-[2.4] object-cover"
        />
      </span>
      <span className="hidden min-w-0 sm:block">
        <span className="flex items-baseline gap-2">
          <span className="font-pixel text-base leading-none">{profile.name}</span>
          <span className="font-mono text-xs text-accent-text">LV {level.level}</span>
        </span>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="flex gap-[2px]" aria-hidden>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={`h-2 w-2.5 ${i < filled ? "bg-accent" : "border border-line"}`} />
            ))}
          </span>
          <span className="font-mono text-[10px] text-muted">XP {Math.round(level.progress * 100)}%</span>
        </span>
      </span>
    </button>
  );
}

function MobileWorldBanner({ id, name, years }: { id: number; name: string; years: string }) {
  return (
    <div
      className="slide-up pixel-box min-w-0 flex-1 self-center px-3 py-1.5 text-center md:hidden [@media(max-height:500px)]:hidden"
      aria-live="polite"
    >
      <p className="truncate font-mono text-[10px] leading-tight text-muted">
        Mundo {id} de {worlds.length}, {years}
      </p>
      <p className="truncate font-pixel text-base leading-tight text-text" data-world-name>
        {name}
      </p>
    </div>
  );
}

function WorldBanner({ id, name, years }: { id: number; name: string; years: string }) {
  return (
    <div className="slide-up hidden min-w-0 text-center md:block [@media(max-height:500px)]:!hidden" aria-live="polite">
      <p className="truncate font-mono text-xs text-muted">
        Mundo {id} de {worlds.length}, {years}
      </p>
      <p className="truncate font-pixel text-2xl leading-tight text-text [text-shadow:3px_3px_0_var(--shadow)]">
        {name}
      </p>
    </div>
  );
}

const MENU: { panel: Panel; label: string; key: string; icon: Icon }[] = [
  { panel: "character", label: "Personagem", key: "P", icon: User },
  { panel: "quests", label: "Missões", key: "M", icon: Scroll },
  { panel: "achievements", label: "Conquistas", key: "C", icon: Trophy },
  { panel: "contact", label: "Contato", key: "K", icon: ChatCircleDots },
];

function Menu() {
  const open = useGame((s) => s.open);
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  return (
    <nav className="pointer-events-auto hidden shrink-0 justify-end gap-2 sm:flex" aria-label="Menu do jogo">
      {MENU.map(({ panel, label, key, icon: Icon }) => (
        <button key={panel} className="pixel-btn !px-2.5" onClick={() => open(panel)} title={`${label} (${key})`}>
          <Icon size={18} weight="bold" />
          <span className="hidden xl:inline">{label}</span>
          <span className="sr-only xl:hidden">{label}</span>
        </button>
      ))}
      <Link href="/" className="pixel-btn !px-2.5" title="Voltar ao portfólio">
        <House size={18} weight="bold" />
        <span className="sr-only">Voltar ao portfólio</span>
      </Link>
      <ThemeToggle />
      <button
        className="pixel-btn !px-2.5"
        onClick={toggleMute}
        aria-pressed={!muted}
        title={muted ? "Ligar som" : "Desligar som"}
      >
        {muted ? <SpeakerSlash size={18} weight="bold" /> : <SpeakerHigh size={18} weight="bold" />}
        <span className="sr-only">Som</span>
      </button>
    </nav>
  );
}

const ITEM =
  "flex min-h-11 w-full items-center gap-3 px-3 text-left font-pixel text-base text-text transition-colors hover:bg-panel-2 focus-visible:bg-panel-2";

function MobileMenu() {
  const [expanded, setExpanded] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const open = useGame((s) => s.open);
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setExpanded(false);
      toggle.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [expanded]);

  const choose = (panel: Panel) => {
    setExpanded(false);
    toggle.current?.focus();
    open(panel);
  };

  return (
    <div ref={wrapper} className="pointer-events-auto relative shrink-0 sm:hidden">
      <button
        ref={toggle}
        className="pixel-btn min-h-11"
        aria-expanded={expanded}
        aria-controls="menu-jogo"
        onClick={() => setExpanded((v) => !v)}
      >
        <List size={18} weight="bold" />
        Menu
      </button>
      <ul
        id="menu-jogo"
        hidden={!expanded}
        className="pixel-box absolute right-0 top-full z-30 mt-2 w-56 py-1"
        aria-label="Menu do jogo"
      >
        {MENU.map(({ panel, label, icon: Icon }) => (
          <li key={panel}>
            <button className={ITEM} onClick={() => choose(panel)}>
              <Icon size={18} weight="bold" />
              {label}
            </button>
          </li>
        ))}
        <li>
          <Link href="/" className={ITEM} onClick={() => setExpanded(false)}>
            <House size={18} weight="bold" />
            Portfólio
          </Link>
        </li>
        <li>
          <button
            className={ITEM}
            onClick={() => {
              toggleMute();
              setExpanded(false);
            }}
          >
            {muted ? <SpeakerSlash size={18} weight="bold" /> : <SpeakerHigh size={18} weight="bold" />}
            {muted ? "Ligar som" : "Desligar som"}
          </button>
        </li>
        <li>
          <button
            type="button"
            className={ITEM}
            data-theme-toggle
            aria-label={next === "light" ? "Ativar modo claro" : "Ativar modo escuro"}
            onClick={() => {
              setTheme(next);
              setExpanded(false);
            }}
          >
            {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
            {next === "light" ? "Modo claro" : "Modo escuro"}
          </button>
        </li>
      </ul>
    </div>
  );
}

function LevelCard({
  project,
  index,
  total,
  worldName,
}: {
  project: Project;
  index: number;
  total: number;
  worldName: string;
}) {
  const open = useGame((s) => s.open);
  return (
    <section className="pixel-box pointer-events-auto min-w-0 p-3 sm:p-4" aria-live="polite">
      <p className="truncate font-mono text-xs text-muted">
        Fase {index + 1} de {total}, {project.year}
        <span className="hidden text-accent-text [@media(max-height:500px)]:inline"> · {worldName}</span>
      </p>
      <h2 className="mt-1 truncate font-pixel text-xl leading-tight sm:text-2xl">{project.title}</h2>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted [@media(max-height:500px)]:hidden">{project.summary}</p>
      <div className="mt-3 hidden min-w-0 items-center justify-between gap-3 sm:flex [@media(max-height:500px)]:!hidden">
        <p className="min-w-0 truncate font-mono text-[11px] text-muted">{project.tags.slice(0, 4).join(", ")}</p>
        <button className="pixel-btn shrink-0" data-variant="primary" onClick={() => open("level")}>
          Abrir fase{" "}
          <span className="kbd hidden !border-white/60 !bg-transparent !text-white sm:inline-grid">ENTER</span>
        </button>
      </div>
    </section>
  );
}

function MiniMap({ projects, index }: { projects: Project[]; index: number }) {
  const goTo = useGame((s) => s.goTo);
  const open = useGame((s) => s.open);
  return (
    <ol
      className="pixel-box pointer-events-auto flex w-full max-w-[44rem] items-end gap-[3px] px-3 py-2 [@media(max-height:500px)]:hidden"
      aria-label="Mapa da jornada"
    >
      {projects.map((p, i) => {
        const color = worlds.find((w) => w.id === p.worldId)?.color;
        const active = i === index;
        const newWorld = i > 0 && projects[i - 1].worldId !== p.worldId;
        return (
          <li key={p.slug} className={`flex-1 ${newWorld ? "ml-1.5" : ""}`}>
            <button
              onClick={() => (active ? open("level") : goTo(i))}
              title={`${i + 1}. ${p.title}`}
              aria-label={`Ir para a fase ${i + 1}: ${p.title}`}
              aria-current={active ? "step" : undefined}
              className="block h-4 w-full origin-bottom transition-transform hover:scale-y-125 sm:h-5"
            >
              <span
                className="block w-full"
                style={{
                  height: active ? "100%" : p.featured ? "70%" : "45%",
                  background: active ? "var(--accent-text)" : color,
                  opacity: active ? 1 : 0.75,
                }}
              />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Controls() {
  const move = useGame((s) => s.move);
  const open = useGame((s) => s.open);
  return (
    <>
      <p className="pixel-box hidden items-center gap-2 px-3 py-1.5 font-mono text-xs text-muted lg:flex [@media(pointer:coarse)]:!hidden">
        <span className="kbd">←</span>
        <span className="kbd">→</span> andar
        <span className="kbd ml-2">ENTER</span> abrir
        <span className="kbd ml-2">ESC</span> fechar
      </p>
      <div className="pointer-events-auto flex justify-between gap-3 lg:hidden [@media(pointer:coarse)]:!flex">
        <button className="pixel-btn min-h-12 shrink-0 !px-5" onClick={() => move(-1)} aria-label="Fase anterior">
          <ArrowLeft size={22} weight="bold" />
        </button>
        <button
          className="pixel-btn min-h-12 flex-1 justify-center !px-5"
          data-variant="primary"
          onClick={() => open("level")}
        >
          Abrir fase
        </button>
        <button className="pixel-btn min-h-12 shrink-0 !px-5" onClick={() => move(1)} aria-label="Próxima fase">
          <ArrowRight size={22} weight="bold" />
        </button>
      </div>
    </>
  );
}
