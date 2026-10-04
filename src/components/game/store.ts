import { create } from "zustand";
import { sfx } from "./sound";

export type Panel = "level" | "character" | "quests" | "achievements" | "contact";

type GameState = {
  screen: "title" | "play";
  index: number;
  count: number;
  panel: Panel | null;
  muted: boolean;
  init: (count: number) => void;
  start: (index: number) => void;
  goTo: (index: number) => void;
  move: (delta: number) => void;
  open: (panel: Panel) => void;
  close: () => void;
  toggleMute: () => void;
};

const MUTE_KEY = "dev-journey:muted";

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export const useGame = create<GameState>((set, get) => ({
  screen: "title",
  index: 0,
  count: 0,
  panel: null,
  muted: false,

  init: (count) => set({ count, muted: readMuted() }),

  start: (index) => {
    sfx.play("start", get().muted);
    set({ screen: "play", index, panel: null });
  },

  goTo: (index) => {
    const { count, index: current, muted } = get();
    const next = Math.max(0, Math.min(count - 1, index));
    if (next === current) {
      sfx.play("bump", muted);
      return;
    }
    sfx.play("jump", muted);
    set({ index: next });
  },

  move: (delta) => {
    const { index, count } = get();
    if (delta > 0 && index === count - 1) get().open("contact");
    else get().goTo(index + delta);
  },

  open: (panel) => {
    sfx.play("open", get().muted);
    set({ panel });
  },

  close: () => {
    if (!get().panel) return;
    sfx.play("close", get().muted);
    set({ panel: null });
  },

  toggleMute: () => {
    const muted = !get().muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {}
    set({ muted });
    if (!muted) sfx.play("open", false);
  },
}));
