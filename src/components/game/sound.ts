type Sfx = "jump" | "bump" | "open" | "close" | "start";

const NOTES: Record<Sfx, { f: number[]; step: number; type: OscillatorType }> = {
  jump: { f: [392, 587], step: 0.05, type: "square" },
  bump: { f: [140, 110], step: 0.06, type: "square" },
  open: { f: [523, 659, 784], step: 0.045, type: "square" },
  close: { f: [659, 440], step: 0.05, type: "square" },
  start: { f: [523, 659, 784, 1047], step: 0.08, type: "square" },
};

let ctx: AudioContext | null = null;

function play(name: Sfx, muted: boolean) {
  if (muted || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const { f, step, type } = NOTES[name];
    const t0 = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.045, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + step * f.length + 0.08);
    gain.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = type;
    f.forEach((hz, i) => osc.frequency.setValueAtTime(hz, t0 + i * step));
    osc.connect(gain);
    osc.start(t0);
    osc.stop(t0 + step * f.length + 0.1);
  } catch {}
}

export const sfx = { play };
