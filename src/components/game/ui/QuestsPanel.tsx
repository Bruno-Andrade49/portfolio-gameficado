"use client";

import { ChatCircleDots, CheckSquare, Flag } from "@phosphor-icons/react";
import Image from "next/image";
import { jobs } from "@/data/experience";
import { profile } from "@/data/profile";
import { useGame } from "../store";
import { Window } from "./Window";

export function QuestsPanel() {
  const close = useGame((s) => s.close);
  const open = useGame((s) => s.open);
  const current = jobs.find((j) => j.current);
  const role = current?.roles[0];
  const done = jobs.flatMap((j) =>
    (j === current ? j.roles.slice(1) : j.roles).map((r) => ({ ...r, org: j.company })),
  );

  return (
    <Window title="Missões" onClose={close}>
      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative hidden aspect-[4/5] max-h-[420px] overflow-hidden border-2 border-line md:block [@media(max-height:500px)]:!hidden">
          <Image
            src={profile.photos.desk}
            alt="Bruno trabalhando no escritório"
            fill
            sizes="(min-width: 1024px) 340px, 100vw"
            className="object-cover object-[70%_center]"
          />
        </div>
        {current && role ? (
          <div>
            <p className="font-mono text-xs text-accent-text">Missão principal em andamento</p>
            <h3 className="mt-1 font-pixel text-3xl leading-tight">
              {role.title} na {current.company}
            </h3>
            <p className="mt-1 font-mono text-xs text-muted">{role.period}</p>
            <ul className="mt-4 grid gap-2">
              {role.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm leading-relaxed">
                  <CheckSquare size={18} weight="fill" className="mt-px shrink-0 text-accent-text" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="self-center">
            <p className="font-mono text-xs text-accent-text">Nova missão</p>
            <h3 className="mt-1 font-pixel text-3xl leading-tight">Em busca da próxima missão</h3>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-muted">
              Disponível para novas oportunidades como desenvolvedor front-end. Se o seu time precisa de alguém para
              a próxima fase, me chama.
            </p>
            <button className="pixel-btn mt-5" data-variant="primary" onClick={() => open("contact")}>
              <ChatCircleDots size={16} weight="bold" /> Falar comigo
            </button>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h3 className="font-pixel text-xl">Missões concluídas</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {done.map((q) => (
            <li key={`${q.org}-${q.title}`} className="border-2 border-line bg-panel-2 p-4">
              <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
                <Flag size={12} weight="fill" /> {q.period}
              </p>
              <p className="mt-1 font-pixel text-lg leading-tight">{q.title}</p>
              <p className="text-sm text-muted">{q.org}</p>
              <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-muted">
                {q.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </Window>
  );
}
