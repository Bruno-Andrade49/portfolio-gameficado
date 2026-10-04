import { useEffect } from "react";
import { useGame } from "./store";

const MIN_DISTANCE = 50;
const MAX_DURATION = 700;

export function useSwipe(target: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let start: { x: number; y: number; t: number } | null = null;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      start = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerType !== "touch") return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const fast = performance.now() - start.t < MAX_DURATION;
      start = null;
      const game = useGame.getState();
      if (game.screen !== "play" || game.panel) return;
      if (fast && Math.abs(dx) > MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) {
        game.move(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
    };
  }, [target]);
}
