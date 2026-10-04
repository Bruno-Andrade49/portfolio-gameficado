"use client";

import dynamic from "next/dynamic";
import type { JourneyStats, Project } from "@/lib/projects";

const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-bg" />,
});

export function GameLoader(props: { projects: Project[]; stats: JourneyStats }) {
  return <Game {...props} />;
}
