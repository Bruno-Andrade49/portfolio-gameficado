"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useRef, type ReactNode } from "react";

export function Window({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus?.();
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-bg/70 sm:pb-[max(env(safe-area-inset-bottom),1.5rem)] sm:pl-[max(env(safe-area-inset-left),1.5rem)] sm:pr-[max(env(safe-area-inset-right),1.5rem)] sm:pt-[max(env(safe-area-inset-top),1.5rem)]"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="pixel-box pop-in flex h-dvh w-full flex-col outline-none sm:h-auto sm:max-h-[min(90dvh,860px)] sm:max-w-5xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b-2 border-line bg-panel-2 px-4 py-2">
          <h2 className="min-w-0 truncate font-pixel text-lg text-text">{title}</h2>
          <button
            onClick={onClose}
            className="pixel-btn min-h-11 min-w-11 shrink-0 justify-center !px-2 !py-1 sm:min-h-0 sm:min-w-0"
            aria-label="Fechar"
          >
            <X size={18} weight="bold" />
            <span className="kbd hidden sm:inline-grid">ESC</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:pb-[max(env(safe-area-inset-bottom),1.5rem)] sm:pl-[max(env(safe-area-inset-left),1.5rem)] sm:pr-[max(env(safe-area-inset-right),1.5rem)] sm:pt-[max(env(safe-area-inset-top),1.5rem)]">{children}</div>
      </div>
    </div>
  );
}
