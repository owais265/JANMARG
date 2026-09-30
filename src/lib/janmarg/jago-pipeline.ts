import { composeGrounded, isFileQuestion, respectsFile } from "./jago-ground.ts";
import { searchKnowledge, type KnowledgeChunk } from "./knowledge.ts";

export type RankedPassage = { chunk: KnowledgeChunk; score: number };

const BANNED = /\b(approved|guaranteed|sanctioned|you will receive|payment (is|has been) (sent|done))\b/i;

export function rankPassages(query: string, lang: "en" | "hi", chunks: KnowledgeChunk[]): RankedPassage[] {
  return searchKnowledge(query, lang, chunks)
    .filter((item) => item.score >= 0.28)
    .slice(0, 3);
}

export function parseModelAnswer(raw: string): { text: string; next: string | null } | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("NOT_IN_EXTRACT") || BANNED.test(trimmed)) return null;
  const [head, tail] = trimmed.split(/\nNEXT:/i);
  const text = head.trim();
  if (!text) return null;
  return { text, next: tail?.trim() || null };
}

/** Keep the model sentence only when it stays inside the file and the passages. */
export function acceptModel(query: string, text: string, fileText: string): boolean {
  if (!isFileQuestion(query) || !fileText.trim()) return true;
  return respectsFile(text, fileText);
}

export function fallbackAnswer(query: string, fileText: string, passages: RankedPassage[]): string | null {
  return composeGrounded(query, fileText, passages[0]?.chunk.body ?? null);
}
