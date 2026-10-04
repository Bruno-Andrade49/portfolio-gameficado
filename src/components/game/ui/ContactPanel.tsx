"use client";

import {
  DownloadSimple,
  Envelope,
  GithubLogo,
  LinkedinLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import Image from "next/image";
import { profile } from "@/data/profile";
import { useGame } from "../store";
import { Window } from "./Window";

export function ContactPanel() {
  const close = useGame((s) => s.close);

  return (
    <Window title="Próxima fase" onClose={close}>
      <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr] [@media(max-height:500px)]:!grid-cols-1">
        <div>
          <h3 className="font-pixel text-4xl leading-tight sm:text-5xl">
            Vamos jogar a próxima fase juntos?
          </h3>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-muted">
            Estou aberto a novas oportunidades e projetos desafiadores. Me chama para uma conversa.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="pixel-btn" data-variant="primary">
                <Envelope size={16} weight="bold" /> E-mail
              </a>
            )}
            {profile.whatsapp && (
              <a href={profile.whatsapp} target="_blank" rel="noreferrer" className="pixel-btn">
                <WhatsappLogo size={16} weight="bold" /> WhatsApp
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="pixel-btn">
                <LinkedinLogo size={16} weight="bold" /> LinkedIn
              </a>
            )}
            <a href={profile.github} target="_blank" rel="noreferrer" className="pixel-btn">
              <GithubLogo size={16} weight="bold" /> GitHub
            </a>
            <a href={profile.resume} download className="pixel-btn">
              <DownloadSimple size={16} weight="bold" /> Currículo
            </a>
          </div>
          {profile.email && (
            <p className="mt-4 font-mono text-xs text-muted">
              {profile.email}
              {profile.phone && ` · ${profile.phone}`}
            </p>
          )}
        </div>
        <div className="relative hidden aspect-square overflow-hidden border-2 border-line md:block [@media(max-height:500px)]:!hidden">
          <Image
            src={profile.photos.desk}
            alt="Bruno no escritório, com o fone no pescoço"
            fill
            sizes="(min-width: 768px) 460px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </Window>
  );
}
