import { GameController } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-8">
        <p>
          {profile.name} · {profile.role} · {profile.location}
        </p>
        <Link href="/jogo" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-text">
          <GameController size={16} weight="bold" /> Este portfólio também é um jogo 3D
        </Link>
      </div>
    </footer>
  );
}
