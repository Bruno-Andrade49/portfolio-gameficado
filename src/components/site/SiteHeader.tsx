import { DownloadSimple, GameController } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { profile } from "@/data/profile";

const NAV = [
  { href: "#experiencia", label: "Experiência" },
  { href: "#sobre", label: "Sobre" },
  { href: "#projetos", label: "Projetos" },
  { href: "#back-end", label: "Back-end" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <a href="#inicio" className="font-pixel text-lg leading-none">
          {profile.name}
        </a>
        <nav aria-label="Seções" className="hidden md:block">
          <ul className="flex gap-6 text-sm text-muted">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-text">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 gap-2">
          <ThemeToggle className="pixel-btn !px-2.5 !py-1.5 !text-sm" />
          <a href={profile.resume} download className="pixel-btn !px-3 !py-1.5 !text-sm">
            <DownloadSimple size={16} weight="bold" />
            <span className="hidden sm:inline">Currículo</span>
            <span className="sr-only sm:hidden">Baixar currículo</span>
          </a>
          <Link href="/jogo" className="pixel-btn !px-3 !py-1.5 !text-sm" data-variant="primary">
            <GameController size={16} weight="bold" />
            <span className="hidden sm:inline">Modo jogo</span>
            <span className="sr-only sm:hidden">Modo jogo</span>
          </Link>
        </div>
      </div>
      <nav aria-label="Seções" className="border-t-2 border-line md:hidden">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2 text-sm text-muted">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} className="hover:text-text">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
