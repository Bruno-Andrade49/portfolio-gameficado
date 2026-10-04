"use client";

import { useProgress } from "@react-three/drei";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { JourneyStats, Project } from "@/lib/projects";
import { useTheme } from "@/lib/theme";
import { layoutJourney } from "./layout";
import Scene from "./Scene";
import { useGame, type Panel } from "./store";
import { useLevel } from "./useLevel";
import { useSwipe } from "./useSwipe";
import { AchievementsPanel } from "./ui/AchievementsPanel";
import { CharacterPanel } from "./ui/CharacterPanel";
import { ContactPanel } from "./ui/ContactPanel";
import { Hud } from "./ui/Hud";
import { LevelPanel } from "./ui/LevelPanel";
import { QuestsPanel } from "./ui/QuestsPanel";
import { TitleScreen } from "./ui/TitleScreen";

type Props = { projects: Project[]; stats: JourneyStats };

const SHORTCUTS: Record<string, Panel> = { p: "character", m: "quests", c: "achievements", k: "contact" };

export default function Game({ projects, stats }: Props) {
  const journey = useMemo(() => layoutJourney(projects), [projects]);
  const reduced = useReducedMotion();
  const level = useLevel(stats.firstRepo);
  const [webgl] = useState(hasWebGL);
  const screen = useGame((s) => s.screen);
  const panel = useGame((s) => s.panel);
  const theme = useTheme();
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => useGame.getState().init(projects.length), [projects.length]);
  useGameKeys();
  useSwipe(sceneRef);

  if (!webgl) return <NoWebGL />;

  return (
    <main className="crt fixed inset-0 overflow-hidden bg-bg">
      <h1 className="sr-only">Bruno Andrade, portfólio jogável</h1>
      <div ref={sceneRef} className="absolute inset-0 touch-pan-y" aria-hidden>
        <Scene projects={projects} journey={journey} reduced={reduced} theme={theme} />
      </div>

      {screen === "title" ? (
        <TitleScreen count={projects.length} />
      ) : (
        <Hud projects={projects} level={level} />
      )}

      {panel === "level" && <LevelPanel projects={projects} />}
      {panel === "character" && <CharacterPanel level={level} />}
      {panel === "quests" && <QuestsPanel />}
      {panel === "achievements" && <AchievementsPanel stats={stats} projects={projects} level={level} />}
      {panel === "contact" && <ContactPanel />}

      <LoadingScreen />
    </main>
  );
}

function useGameKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const game = useGame.getState();
      if (game.screen !== "play") return;
      const key = e.key.toLowerCase();
      const onControl = e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement;

      if (key === "escape") return game.close();
      if (game.panel && game.panel !== "level") return;

      if (key === "arrowright" || key === "d") {
        e.preventDefault();
        game.move(1);
      } else if (key === "arrowleft" || key === "a") {
        e.preventDefault();
        game.move(-1);
      } else if (key === "home") game.goTo(0);
      else if (key === "end") game.goTo(game.count - 1);
      else if ((key === "enter" || key === " ") && !onControl && !game.panel) {
        e.preventDefault();
        game.open("level");
      } else if (SHORTCUTS[key] && !game.panel) game.open(SHORTCUTS[key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function LoadingScreen() {
  const { progress, active } = useProgress();
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 9000);
    return () => clearTimeout(t);
  }, []);

  const finished = !active && progress >= 100;
  if (finished && !loadedOnce) setLoadedOnce(true);
  if (loadedOnce || finished || timedOut) return null;
  const blocks = Math.round(progress / 5);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg" role="status">
      <div className="w-72">
        <p className="font-pixel text-xl">Carregando mundo</p>
        <div className="mt-3 flex gap-[3px] border-2 border-line p-1" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className={`h-4 flex-1 ${i < blocks ? "bg-accent" : ""}`} />
          ))}
        </div>
        <p className="mt-2 font-mono text-xs text-muted">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

function NoWebGL() {
  return (
    <main className="grid min-h-[100dvh] place-items-center p-6">
      <div className="pixel-box max-w-md p-6">
        <h1 className="font-pixel text-2xl">Seu navegador não roda o mundo 3D</h1>
        <p className="mt-3 text-muted">
          O WebGL está desativado ou indisponível. O currículo e todos os projetos estão na versão em página.
        </p>
        <Link href="/" className="pixel-btn mt-5" data-variant="primary">
          Abrir portfólio
        </Link>
      </div>
    </main>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
