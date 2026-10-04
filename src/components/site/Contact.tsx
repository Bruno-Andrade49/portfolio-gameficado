import {
  DownloadSimple,
  Envelope,
  GithubLogo,
  LinkedinLogo,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { GITHUB_USER, profile } from "@/data/profile";
import { Section } from "./ui";

type Channel = { href: string; label: string; value: string; icon: Icon; external: boolean };

export function Contact() {
  const channels: Channel[] = [];
  if (profile.email)
    channels.push({ href: `mailto:${profile.email}`, label: "E-mail", value: profile.email, icon: Envelope, external: false });
  if (profile.whatsapp)
    channels.push({ href: profile.whatsapp, label: "WhatsApp", value: profile.phone ?? "Conversar", icon: WhatsappLogo, external: true });
  if (profile.linkedin)
    channels.push({
      href: profile.linkedin,
      label: "LinkedIn",
      value: profile.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
      icon: LinkedinLogo,
      external: true,
    });
  channels.push({ href: profile.github, label: "GitHub", value: `github.com/${GITHUB_USER}`, icon: GithubLogo, external: true });

  return (
    <Section
      id="contato"
      eyebrow="Contato"
      title="Vamos conversar?"
      intro="Estou aberto a novas oportunidades e projetos desafiadores. O jeito mais rápido de falar comigo é por e-mail ou WhatsApp."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map(({ href, label, value, icon: ChannelIcon, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="pixel-box group flex h-full flex-col gap-3 p-5 transition-colors hover:border-muted"
            >
              <ChannelIcon size={28} weight="bold" className="text-accent-text" />
              <span>
                <span className="block font-semibold text-text">{label}</span>
                <span className="block break-all text-sm text-muted group-hover:text-text">{value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a href={profile.resume} download className="pixel-btn mt-8" data-variant="primary">
        <DownloadSimple size={18} weight="bold" /> Baixar currículo em PDF
      </a>
    </Section>
  );
}
