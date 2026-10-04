"use client";

import Image from "next/image";
import { attributes, profile } from "@/data/profile";
import { techIcons } from "@/data/projects";
import { useTheme } from "@/lib/theme";
import { useGame } from "../store";
import type { PlayerLevel } from "../useLevel";
import { Window } from "./Window";

export function CharacterPanel({ level }: { level: PlayerLevel }) {
  const close = useGame((s) => s.close);
  const inventory = Object.entries(techIcons);
  const theme = useTheme();

  return (
    <Window title="Personagem" onClose={close}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] [@media(max-height:500px)]:!grid-cols-1">
        <figure className="relative hidden aspect-[2/3] max-h-[560px] overflow-hidden border-2 border-line md:block [@media(max-height:500px)]:!hidden">
          <Image
            src={profile.photos.portrait}
            alt="Bruno programando no notebook"
            fill
            sizes="(min-width: 768px) 340px, 1px"
            className="object-cover"
          />
        </figure>

        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <span className="relative size-16 shrink-0 overflow-hidden border-2 border-line md:hidden [@media(max-height:500px)]:!block">
              <Image
                src={profile.photos.desk}
                alt=""
                fill
                sizes="64px"
                className="object-cover object-[78%_center]"
              />
            </span>
            <h3 className="min-w-0 font-pixel text-3xl leading-tight sm:text-4xl">{profile.name}</h3>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-3 font-mono text-xs">
            <div>
              <dt className="text-muted">Classe</dt>
              <dd className="mt-1">{profile.role}</dd>
            </div>
            <div>
              <dt className="text-muted">Origem</dt>
              <dd className="mt-1">{profile.location}</dd>
            </div>
            <div>
              <dt className="text-muted">Nível</dt>
              <dd className="mt-1">LV {level.level}</dd>
            </div>
          </dl>
          <p className="mt-4 max-w-[60ch] leading-relaxed text-muted">{profile.bio}</p>

          <h4 className="mt-7 font-pixel text-xl">Atributos</h4>
          <p className="mt-1 text-sm text-muted">Domínio de cada tecnologia, de 0 a 10.</p>
          <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {attributes.map((a) => (
              <li key={a.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate font-mono text-xs">{a.name}</span>
                <span className="flex gap-[3px]" aria-hidden>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className={`h-3 w-2 ${i < a.level ? "bg-accent" : "border border-line"}`} />
                  ))}
                </span>
                <span className="font-mono text-xs text-muted">{a.level}</span>
              </li>
            ))}
          </ul>

          <h4 className="mt-7 font-pixel text-xl">Inventário</h4>
          <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {inventory.map(([name, slug]) => (
              <li
                key={name}
                title={name}
                className="group flex aspect-square flex-col items-center justify-center gap-1.5 border-2 border-line bg-panel-2 p-2 transition-colors hover:border-muted"
              >
                <Image
                  src={`https://cdn.simpleicons.org/${slug}/${theme === "light" ? "1c1618" : "f2ece6"}`}
                  alt=""
                  width={22}
                  height={22}
                  unoptimized
                />
                <span className="w-full truncate text-center font-mono text-[10px] text-muted">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Window>
  );
}
