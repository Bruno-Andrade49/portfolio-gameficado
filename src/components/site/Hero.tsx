import { ArrowDown, ChatCircleDots, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { highlights } from "@/data/experience";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section
      id="inicio"
      className="mx-auto grid max-w-6xl scroll-mt-28 gap-10 px-4 pb-16 pt-12 sm:px-8 sm:pt-20 md:grid-cols-[1.4fr_1fr] md:items-center"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">{profile.location}</p>
        <h1 className="mt-3 font-pixel text-5xl leading-[0.95] sm:text-7xl">{profile.name}</h1>
        <p className="mt-4 text-xl text-text sm:text-2xl">{profile.role}</p>
        <p className="mt-1 font-mono text-sm text-muted">{profile.headline}</p>
        <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted">{profile.bio}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#contato" className="pixel-btn" data-variant="primary">
            <ChatCircleDots size={18} weight="bold" /> Falar comigo
          </a>
          <a href={profile.resume} download className="pixel-btn">
            <DownloadSimple size={18} weight="bold" /> Baixar currículo
          </a>
          <a href="#projetos" className="pixel-btn">
            <ArrowDown size={18} weight="bold" /> Ver projetos
          </a>
        </div>
      </div>

      <figure className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden border-2 border-line shadow-[6px_6px_0_var(--shadow)]">
        <Image
          src={profile.photos.desk}
          alt="Bruno Andrade trabalhando no notebook"
          fill
          preload
          sizes="(min-width: 768px) 384px, 100vw"
          className="object-cover object-[78%_center]"
        />
      </figure>

      <dl className="grid grid-cols-2 gap-3 md:col-span-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div key={h.value} className="pixel-box flex flex-col-reverse p-4">
            <dt className="mt-1 text-sm leading-snug text-muted">{h.label}</dt>
            <dd className="font-pixel text-2xl text-text">{h.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
