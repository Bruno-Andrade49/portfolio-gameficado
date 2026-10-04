"use client";

import { Billboard, Sparkles, Stars, Text, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { worlds } from "@/data/projects";
import type { Project } from "@/lib/projects";
import type { Theme } from "@/lib/theme-script";
import type { Journey, Slot, Vec3 } from "./layout";
import { useGame } from "./store";

const ACCENT = "#e0453d";
const PIXEL_FONT = "/fonts/PixelifySans.ttf";
const COMPACT_WIDTH = 768;
const COMPACT_HEIGHT = 500;
const SCREEN_W = 2.4;
const SCREEN_H = 1.5;
const PLATFORM_H = 0.45;
const SCREEN_Y = 3.05;
const SCREEN_Y_ACTIVE = 3.5;

const PALETTES = {
  dark: {
    bg: "#0f0d0e", ambient: 0.5, sky: "#ffe6d2", ground: "#1b1420", hemi: 0.75, sun: 1.7,
    stars: true, sparkle: "#f3cfa8", text: "#f2ece6", muted: "#aaa1a6", accentText: "#f0645a",
    trail: "#6d6168", trailGlow: "#3a2f35", stone: "#2a2429", frame: "#2a2429", placeholder: "#221e25",
    rock: "#1a1518", flagCone: "#1f1a1e", letterbox: "#f6f8fa",
  },
  light: {
    bg: "#f4efe8", ambient: 0.85, sky: "#ffffff", ground: "#d9cbbb", hemi: 0.9, sun: 1.35,
    stars: false, sparkle: "#c8322b", text: "#1c1618", muted: "#62575b", accentText: "#b4271f",
    trail: "#b9aca1", trailGlow: "#e6dbcf", stone: "#cbbdae", frame: "#d3c6b8", placeholder: "#efe7dd",
    rock: "#bfae9c", flagCone: "#b9a896", letterbox: "#ffffff",
  },
} as const;
type Palette = (typeof PALETTES)[keyof typeof PALETTES];

const worldColor = (id: number) =>
  worlds.find((w) => w.id === id)?.color ?? "#777";

type SceneProps = { projects: Project[]; journey: Journey; reduced: boolean; theme: Theme };

export default function Scene({ projects, journey, reduced, theme }: SceneProps) {
  const palette = PALETTES[theme];
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 45, near: 0.1, far: 220, position: [-6, 10, 18] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 18, 56]} />
      <ambientLight intensity={palette.ambient} />
      <hemisphereLight args={[palette.sky, palette.ground, palette.hemi]} />
      <directionalLight position={[10, 16, 8]} intensity={palette.sun} color="#fff1e6" />

      {palette.stars && (
        <Stars radius={100} depth={40} count={2200} factor={3} saturation={0} fade speed={reduced ? 0 : 0.4} />
      )}
      <Sparkles
        count={140}
        position={journey.center}
        scale={[journey.length + 10, 12, 18]}
        size={2.2}
        speed={reduced ? 0 : 0.25}
        opacity={0.45}
        color={palette.sparkle}
      />
      <Rocks journey={journey} palette={palette} />
      <Trail points={journey.trail} palette={palette} />

      {projects.map((p, i) => (
        <Level key={p.slug} project={p} slot={journey.slots[i]} index={i} reduced={reduced} palette={palette} />
      ))}
      {journey.gates.map((g) => (
        <WorldGate key={g.worldId} worldId={g.worldId} position={g.position} palette={palette} />
      ))}
      <Flag position={journey.flag} reduced={reduced} palette={palette} />
      <Player journey={journey} reduced={reduced} />
      <CameraRig journey={journey} reduced={reduced} />
    </Canvas>
  );
}

function Level({
  project,
  slot,
  index,
  reduced,
  palette,
}: {
  project: Project;
  slot: Slot;
  index: number;
  reduced: boolean;
  palette: Palette;
}) {
  const active = useGame((s) => s.index === index);
  const screenRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const color = worldColor(slot.worldId);
  const rock = useMemo(
    () => new THREE.Color(color).lerp(new THREE.Color(palette.rock), 0.72),
    [color, palette.rock],
  );

  useFrame((state, dt) => {
    const g = screenRef.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 8);
    const s = active ? 1.18 : 1;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, k));
    const bob = reduced ? 0 : Math.sin(state.clock.elapsedTime * 1.4 + index) * 0.08;
    g.position.y = THREE.MathUtils.lerp(g.position.y, (active ? SCREEN_Y_ACTIVE : SCREEN_Y) + bob, k);
    if (ringRef.current) {
      const pulse = reduced ? 1 : 1 + Math.sin(state.clock.elapsedTime * 4) * 0.04;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 8) return;
    const game = useGame.getState();
    if (game.screen !== "play") return;
    if (active) game.open("level");
    else game.goTo(index);
  };

  return (
    <group
      position={slot.position}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <mesh>
        <cylinderGeometry args={[slot.radius, slot.radius * 0.9, PLATFORM_H, 6]} />
        <meshStandardMaterial color={color} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, -1.35, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[slot.radius * 0.9, 2.25, 6]} />
        <meshStandardMaterial color={rock} flatShading roughness={1} />
      </mesh>
      <mesh
        ref={ringRef}
        visible={active}
        position={[0, PLATFORM_H / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 6]}
      >
        <ringGeometry args={[slot.radius + 0.08, slot.radius + 0.24, 6]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>

      <group ref={screenRef} position={[0, SCREEN_Y, 0]}>
        <Billboard>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[SCREEN_W + 0.16, SCREEN_H + 0.16, 0.06]} />
            <meshStandardMaterial color={active ? ACCENT : palette.frame} flatShading />
          </mesh>
          <SafeTexture fallback={<ScreenPlaceholder palette={palette} />}>
            <Suspense fallback={<ScreenPlaceholder palette={palette} />}>
              <Screen url={project.cover} active={active} palette={palette} />
            </Suspense>
          </SafeTexture>
        </Billboard>
      </group>
    </group>
  );
}

const imageAspect = (texture: THREE.Texture) => {
  const img = texture.image as { width: number; height: number } | undefined;
  return img?.width ? img.width / img.height : SCREEN_W / SCREEN_H;
};

function fitTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const target = SCREEN_W / SCREEN_H;
  const aspect = imageAspect(texture);
  if (aspect < target) {
    texture.repeat.set(1, aspect / target);
    texture.offset.set(0, 1 - aspect / target);
  }
  texture.needsUpdate = true;
}

function Screen({ url, active, palette }: { url: string; active: boolean; palette: Palette }) {
  const texture = useTexture(url, fitTexture);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const height = Math.min(SCREEN_H, SCREEN_W / imageAspect(texture));

  useFrame((_, dt) => {
    const m = matRef.current;
    if (!m) return;
    const v = active ? 1 : 0.55;
    const k = 1 - Math.exp(-dt * 8);
    m.color.setScalar(THREE.MathUtils.lerp(m.color.r, v, k));
  });

  return (
    <group>
      {height < SCREEN_H && (
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
          <meshBasicMaterial color={palette.letterbox} />
        </mesh>
      )}
      <mesh>
        <planeGeometry args={[SCREEN_W, height]} />
        <meshBasicMaterial ref={matRef} map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ScreenPlaceholder({ palette }: { palette: Palette }) {
  return (
    <mesh>
      <planeGeometry args={[SCREEN_W, SCREEN_H]} />
      <meshBasicMaterial color={palette.placeholder} />
    </mesh>
  );
}

class SafeTexture extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Trail({ points, palette }: { points: Vec3[]; palette: Palette }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    points.forEach((p, i) => mesh.setMatrixAt(i, m.makeTranslation(p[0], p[1], p[2])));
    mesh.instanceMatrix.needsUpdate = true;
  }, [points]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, points.length]}>
      <boxGeometry args={[0.26, 0.08, 0.26]} />
      <meshStandardMaterial color={palette.trail} emissive={palette.trailGlow} flatShading />
    </instancedMesh>
  );
}

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function Rocks({ journey, palette }: { journey: Journey; palette: Palette }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 70;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rand = seeded(49);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const color = new THREE.Color();
    const bg = new THREE.Color(palette.bg);
    for (let i = 0; i < count; i++) {
      const x = -10 + rand() * (journey.length + 20);
      const behind = rand() > 0.3;
      const z = behind ? -12 - rand() * 22 : 11 + rand() * 10;
      const y = -6 + rand() * 12 + (x / journey.length) * 4;
      const s = 0.3 + rand() * (behind ? 1.6 : 0.6);
      q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
      const w = worlds[Math.min(worlds.length - 1, Math.floor((x / journey.length) * worlds.length))];
      mesh.setColorAt(i, color.set(w?.color ?? "#555").lerp(bg, 0.6));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [journey, palette.bg]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial flatShading roughness={1} />
    </instancedMesh>
  );
}

function WorldGate({ worldId, position, palette }: { worldId: number; position: Vec3; palette: Palette }) {
  const world = worlds.find((w) => w.id === worldId)!;
  const compact = useThree((s) => s.size.width < COMPACT_WIDTH || s.size.height < COMPACT_HEIGHT);

  return (
    <group position={position}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.9, 1.5, 0.35, 8]} />
        <meshStandardMaterial color={palette.stone} flatShading />
      </mesh>
      {[-1.45, 1.45].map((z) => (
        <mesh key={z} position={[0, 1.4, z]}>
          <boxGeometry args={[0.4, 2.8, 0.4]} />
          <meshStandardMaterial color={world.color} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 2.9, 0]}>
        <boxGeometry args={[0.5, 0.4, 3.5]} />
        <meshStandardMaterial color={world.color} flatShading />
      </mesh>
      {!compact && (
        <Label position={[0, 3.75, 0]}>
          <Text font={PIXEL_FONT} fontSize={0.2} color={palette.muted} anchorY="bottom" position={[0, 0.06, 0]}>
            {`MUNDO ${world.id}`}
          </Text>
          <Text font={PIXEL_FONT} fontSize={0.34} color={palette.text} anchorY="top">
            {world.name}
          </Text>
        </Label>
      )}
    </group>
  );
}

function Label({ position, children }: { position: Vec3; children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Billboard position={position}>{children}</Billboard>
    </Suspense>
  );
}

function Flag({ position, reduced, palette }: { position: Vec3; reduced: boolean; palette: Palette }) {
  const cloth = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (cloth.current && !reduced) {
      cloth.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.2) * 0.18;
    }
  });
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 8) return;
        if (useGame.getState().screen === "play") useGame.getState().open("contact");
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <mesh>
        <cylinderGeometry args={[1.5, 1.3, 0.45, 6]} />
        <meshStandardMaterial color={palette.stone} flatShading />
      </mesh>
      <mesh position={[0, -1.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.3, 2.2, 6]} />
        <meshStandardMaterial color={palette.flagCone} flatShading />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 4.2, 6]} />
        <meshStandardMaterial color="#d8d0c8" />
      </mesh>
      <mesh position={[0, 4.35, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#efe6dc" flatShading />
      </mesh>
      <group position={[0, 3.7, 0]}>
        <mesh ref={cloth} position={[0.6, 0, 0]}>
          <boxGeometry args={[1.2, 0.75, 0.04]} />
          <meshStandardMaterial color={ACCENT} flatShading />
        </mesh>
      </group>
      <Label position={[0, 5, 0]}>
        <Text font={PIXEL_FONT} fontSize={0.3} color={palette.accentText}>
          PRÓXIMA FASE?
        </Text>
      </Label>
    </group>
  );
}

const SKIN = "#c79a7a";
const SHIRT = "#c8322b";

function Player({ journey, reduced }: { journey: Journey; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const index = useGame((s) => s.index);
  const anim = useRef({
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    t: 1,
    duration: 0.45,
    arc: 1,
    facing: 0.5,
  });

  const topOf = (i: number) => {
    const p = journey.slots[i]?.position ?? [0, 0, 0];
    return new THREE.Vector3(p[0], p[1] + PLATFORM_H / 2, p[2]);
  };

  useLayoutEffect(() => {
    ref.current?.position.copy(topOf(useGame.getState().index));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    const a = anim.current;
    a.from.copy(g.position);
    a.to.copy(topOf(index));
    const dist = a.from.distanceTo(a.to);
    if (dist < 0.01) return;
    a.t = reduced ? 1 : 0;
    a.duration = 0.38 + Math.min(dist, 40) * 0.012;
    a.arc = 0.9 + Math.min(dist, 40) * 0.06;
    a.facing = Math.atan2(a.to.x - a.from.x, a.to.z - a.from.z);
    if (reduced) g.position.copy(a.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduced]);

  useFrame((state, dt) => {
    const g = ref.current;
    const b = body.current;
    if (!g || !b) return;
    const a = anim.current;
    let targetRot = 0.55;
    if (a.t < 1) {
      a.t = Math.min(1, a.t + dt / a.duration);
      const e = a.t < 0.5 ? 2 * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 2) / 2;
      g.position.lerpVectors(a.from, a.to, e);
      g.position.y += Math.sin(Math.PI * e) * a.arc;
      targetRot = a.facing;
      b.position.y = 0;
      b.scale.set(1, 1, 1);
    } else if (!reduced) {
      const t = state.clock.elapsedTime;
      b.position.y = Math.abs(Math.sin(t * 2.4)) * 0.05;
      b.scale.y = 1 + Math.sin(t * 4.8) * 0.015;
    }
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRot, 1 - Math.exp(-dt * 10));
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
      <group ref={body}>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.28, 0]}>
            <boxGeometry args={[0.21, 0.56, 0.24]} />
            <meshStandardMaterial color="#26324a" flatShading />
          </mesh>
        ))}
        <mesh position={[0, 0.86, 0]}>
          <boxGeometry args={[0.62, 0.62, 0.34]} />
          <meshStandardMaterial color={SHIRT} flatShading />
        </mesh>
        {[-0.41, 0.41].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 1.0, 0]}>
              <boxGeometry args={[0.18, 0.26, 0.22]} />
              <meshStandardMaterial color={SHIRT} flatShading />
            </mesh>
            <mesh position={[0, 0.73, 0]}>
              <boxGeometry args={[0.15, 0.3, 0.18]} />
              <meshStandardMaterial color={SKIN} flatShading />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.41, 0.66, 0]}>
          <boxGeometry args={[0.17, 0.06, 0.2]} />
          <meshStandardMaterial color="#4a3426" />
        </mesh>
        <mesh position={[0, 1.43, 0]}>
          <boxGeometry args={[0.48, 0.48, 0.46]} />
          <meshStandardMaterial color={SKIN} flatShading />
        </mesh>
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 1.45, 0.235]}>
            <boxGeometry args={[0.06, 0.08, 0.02]} />
            <meshBasicMaterial color="#1c1412" />
          </mesh>
        ))}
        <mesh position={[0, 1.71, -0.02]}>
          <boxGeometry args={[0.52, 0.16, 0.52]} />
          <meshStandardMaterial color="#2a1d17" flatShading />
        </mesh>
        <mesh position={[0, 1.52, -0.23]}>
          <boxGeometry args={[0.52, 0.3, 0.08]} />
          <meshStandardMaterial color="#2a1d17" flatShading />
        </mesh>
        <mesh position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.055, 6, 14]} />
          <meshStandardMaterial color="#141214" roughness={0.4} />
        </mesh>
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 1.16, 0.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 10]} />
            <meshStandardMaterial color="#141214" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CameraRig({ journey, reduced }: { journey: Journey; reduced: boolean }) {
  const screen = useGame((s) => s.screen);
  const index = useGame((s) => s.index);
  const look = useRef(new THREE.Vector3(...journey.center));
  const desired = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  const heightAt = (x: number) => {
    let best = journey.slots[0];
    for (const s of journey.slots) {
      if (Math.abs(s.position[0] - x) < Math.abs(best.position[0] - x)) best = s;
    }
    return best?.position[1] ?? 0;
  };

  useFrame((state, dt) => {
    const cam = state.camera;
    const portrait = state.size.width < state.size.height;
    const zoom = portrait ? 1.7 : 1;

    if (screen === "title") {
      const t = state.clock.elapsedTime;
      const x = reduced
        ? journey.length * 0.2
        : (0.5 - 0.5 * Math.cos(t * 0.03)) * journey.length;
      const y = heightAt(x);
      target.set(x + 3, y + 1, 0);
      desired.set(x - 3, y + 8 * zoom, 17 * zoom);
    } else {
      const p = journey.slots[index]?.position ?? [0, 0, 0];
      const px = reduced ? 0 : state.pointer.x * 0.8;
      const py = reduced ? 0 : state.pointer.y * 0.4;
      target.set(p[0] + 1.2, p[1] + 1.6, p[2]);
      desired.set(p[0] - 1.2 + px, p[1] + (4.4 + py) * zoom, p[2] + 9.8 * zoom);
    }

    const speed = screen === "title" ? 1.1 : 3.2;
    const k = reduced ? 1 : 1 - Math.exp(-dt * speed);
    cam.position.lerp(desired, k);
    look.current.lerp(target, k);
    cam.lookAt(look.current);
  });

  return null;
}
