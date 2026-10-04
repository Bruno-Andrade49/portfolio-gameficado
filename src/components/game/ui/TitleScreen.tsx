"use client";

import { CaretRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile";
import { worlds } from "@/data/projects";
import { useGame } from "../store";

export function TitleScreen({ count }: { count: number }) {
  const start = useGame((s) => s.start);
  const router = useRouter();
  const [selected, setSelected] = useState(0);

  const options = [
    { label: "Novo jogo", hint: "Começar em 2021, no primeiro projeto", run: () => start(0) },
    { label: "Continuar", hint: "Ir direto para a fase mais recente", run: () => start(count - 1) },
    { label: "Portfólio", hint: "Currículo e projetos em uma página, sem 3D", run: () => router.push("/") },
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "s") setSelected((s) => (s + 1) % options.length);
      else if (e.key === "ArrowUp" || e.key === "w") setSelected((s) => (s + options.length - 1) % options.length);
      else if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        options[selected].run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-20 flex overflow-y-auto bg-[var(--title-fade)] md:bg-[linear-gradient(90deg,var(--bg)_0%,var(--title-fade)_38%,transparent_75%)]">
      <div className="slide-up my-auto w-full min-w-0 max-w-2xl px-5 py-6 sm:px-10 lg:px-16">
        <p className="font-mono text-xs text-muted">{profile.name} apresenta</p>
        <h1 className="mt-3 font-pixel text-5xl leading-[0.95] text-text [text-shadow:5px_5px_0_var(--accent)] sm:text-8xl [@media(max-height:500px)]:!text-6xl">
          Dev Journey
        </h1>
        <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-muted [@media(max-height:500px)]:mt-3 [@media(max-height:500px)]:text-base">
          {count} projetos viraram fases em {worlds.length} mundos. Explore minha jornada como dev
          jogando.
        </p>

        <ul className="mt-9 grid gap-2 [@media(max-height:500px)]:mt-4 [@media(max-height:500px)]:gap-0" role="menu">
          {options.map((o, i) => (
            <li key={o.label} role="none">
              <button
                role="menuitem"
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={o.run}
                className="group flex items-center gap-3 py-1 text-left outline-none"
              >
                <CaretRight
                  size={22}
                  weight="fill"
                  className={i === selected ? "blink text-accent-text" : "invisible"}
                />
                <span>
                  <span className={`block font-pixel text-2xl sm:text-3xl ${i === selected ? "text-text" : "text-muted"}`}>
                    {o.label}
                  </span>
                  <span className={`block font-mono text-xs ${i === selected ? "text-muted" : "text-transparent"}`}>
                    {o.hint}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
