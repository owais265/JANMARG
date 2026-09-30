import { createWorld } from "./seed.ts";
import type { AppData, DocumentRecord, StudentProfile } from "./types.ts";

export const PERSONA_IDS = ["asha", "birsa", "meera", "dev", "nila"] as const;

export type PersonaId = (typeof PERSONA_IDS)[number];

/** Demo files only. The same five records the desk already uses. */
export function loadDemoWorld(): AppData {
  return createWorld();
}

export function demoProfile(id: string): StudentProfile | undefined {
  return loadDemoWorld().profiles[id];
}

export function demoDocuments(id: string): DocumentRecord[] {
  return loadDemoWorld().documents[id] ?? [];
}
