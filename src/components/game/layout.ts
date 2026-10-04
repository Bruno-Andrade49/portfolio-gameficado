import type { Project } from "@/lib/projects";

export type Vec3 = [number, number, number];

export type Slot = { position: Vec3; worldId: number; radius: number };
export type Gate = { position: Vec3; worldId: number };

export type Journey = {
  slots: Slot[];
  gates: Gate[];
  flag: Vec3;
  trail: Vec3[];
  center: Vec3;
  length: number;
};

const STEP = 3.4;
const WORLD_GAP = 3.6;

export function layoutJourney(projects: Project[]): Journey {
  const slots: Slot[] = [];
  const gates: Gate[] = [];
  let x = 0;
  let worldStep = -1;
  let prevWorld: number | null = null;

  projects.forEach((p, i) => {
    if (p.worldId !== prevWorld) {
      if (prevWorld !== null) x += WORLD_GAP;
      worldStep += 1;
    }
    const y = worldStep * 1.15 + Math.sin(i * 0.9) * 0.3;
    const z = Math.sin(i * 0.62) * 3.1;
    if (p.worldId !== prevWorld) {
      gates.push({ worldId: p.worldId, position: [x - 2.2, y, z] });
    }
    slots.push({
      position: [x, y, z],
      worldId: p.worldId,
      radius: p.featured ? 1.35 : 1.1,
    });
    prevWorld = p.worldId;
    x += STEP;
  });

  const last = slots[slots.length - 1]?.position ?? [0, 0, 0];
  const flag: Vec3 = [last[0] + 3.6, last[1] + 0.4, last[2]];

  const trail: Vec3[] = [];
  const points = [...slots.map((s) => s.position), flag];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay, az] = points[i];
    const [bx, by, bz] = points[i + 1];
    const dist = Math.hypot(bx - ax, bz - az);
    const n = Math.floor(dist / 0.5);
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const px = ax + (bx - ax) * t;
      const pz = az + (bz - az) * t;
      if (Math.hypot(px - ax, pz - az) < 1.5 || Math.hypot(px - bx, pz - bz) < 1.5) continue;
      trail.push([px, ay + (by - ay) * t - 0.05, pz]);
    }
  }

  const length = flag[0];
  return {
    slots,
    gates,
    flag,
    trail,
    center: [length / 2, last[1] / 2, 0],
    length,
  };
}
