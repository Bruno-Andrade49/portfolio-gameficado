"use client";

import { useMemo } from "react";

export type PlayerLevel = { level: number; progress: number };

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
const NOW = Date.now();

export function useLevel(firstRepo: string): PlayerLevel {
  return useMemo(() => {
    const years = (NOW - new Date(firstRepo).getTime()) / YEAR_MS;
    return { level: Math.floor(years), progress: years % 1 };
  }, [firstRepo]);
}
