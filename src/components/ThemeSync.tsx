"use client";

import { useLayoutEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { applyTheme } from "@/lib/theme";

export function ThemeSync() {
  useLayoutEffect(() => {
    if (document.documentElement.dataset.theme) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {}
    const light = stored === "light" || (stored !== "dark" && window.matchMedia("(prefers-color-scheme: light)").matches);
    applyTheme(light ? "light" : "dark");
  }, []);

  return null;
}
