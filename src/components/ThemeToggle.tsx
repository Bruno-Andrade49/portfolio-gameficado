"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { setTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "pixel-btn !px-2.5" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <button type="button" onClick={() => setTheme(next)} className={className} aria-label={label} title={label} data-theme-toggle>
      {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
    </button>
  );
}
