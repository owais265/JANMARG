import { createServerFn } from "@tanstack/react-start";
import { embedText } from "./embed.ts";
import { acceptModel, fallbackAnswer, parseModelAnswer, rankPassages } from "./jago-pipeline.ts";
import { isFileQuestion } from "./jago-ground.ts";
import { KNOWLEDGE, answerQuestion, type KnowledgeChunk } from "./knowledge.ts";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./remote.ts";
import type { KnowledgeCitation, Lang } from "./types.ts";

export type JagoReply = {
  confident: boolean;
  text: string | null;
  nextAction: string | null;
  citations: KnowledgeCitation[];
  via: "grok" | "extract" | "file" | "refusal";
  retrieval: "xai" | "demoHash" | "keyword";
};

type AskInput = {
  query: string;
  lang: Lang;
  brief: string;
  fallbackText: string;
  fallbackNext: string;
  fallbackHref: string;
};

const hits: number[] = [];

function allow(limit: number): boolean {
  const now = Date.now();
  while (hits.length > 0 && now - hits[0] > 60_000) hits.shift();
  if (hits.length >= limit) return false;
  hits.push(now);
  return true;
}

function scrub(value: string): string {
  return value.replace(/\b\d{12}\b/g, "[removed]").replace(/\b\d{9,18}\b/g, "[removed]").trim().slice(0, 500);
}

async function loadPassages(lang: Lang): Promise<KnowledgeChunk[] | undefined> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/jago_passages?lang=eq.${lang}&select=id,title,body,next_step,source_label,source_url,keywords`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    if (!response.ok) return undefined;
    const rows = (await response.json()) as {
      id: string;
      title: string;
      body: string;
      next_step: string;
      source_label: string;
      source_url: string;
      keywords: string;
    }[];
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    return rows.map((row) => ({
      id: row.id,
      lang,
      title: row.title,
      body: row.body,
      next: row.next_step,
      source: row.source_label,
      url: row.source_url,
      keywords: row.keywords.split("|"),
    }));
  } catch {
    return undefined;
  }
}

async function loadOfficial(lang: Lang): Promise<KnowledgeChunk[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/official_extracts?select=id,scheme_id,quote,source_title,source_url`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    if (!response.ok) return [];
    const rows = (await response.json()) as {
      id: string;
      scheme_id: string;
      quote: string;
      source_title: string;
      source_url: string;
    }[];
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
      id: row.id,
      lang,
      title: row.scheme_id,
      body: row.quote,
      next: "Open the scheme page and read the source line.",
      source: row.source_title,
      url: row.source_url,
      keywords: [row.scheme_id, "income", "class", "fellowship", "overseas", "pre", "post", "top"],
    }));
  } catch {
    return [];
  }
}

async function loadCorpus(lang: Lang): Promise<KnowledgeChunk[]> {
  const [stored, quotes] = await Promise.all([loadPassages(lang), loadOfficial(lang)]);
  const base = stored && stored.length > 0 ? stored : KNOWLEDGE.filter((chunk) => chunk.lang === lang);
  return [...quotes, ...base];
}
async function matchVectors(lang: Lang, vector: number[]): Promise<KnowledgeChunk[] | undefined> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_demo_chunks`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query_embedding: `[${vector.join(",")}]`,
        match_count: 3,
        filter_language: lang,
      }),
    });
    if (!response.ok) return undefined;
    const rows = (await response.json()) as {
      chunk_key: string;
      title: string;
      content: string;
      next_step: string | null;
      source_title: string;
      source_url: string;
    }[];
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    return rows.map((row) => ({
      id: row.chunk_key,
      lang,
      title: row.title,
      body: row.content,
      next: row.next_step ?? "",
      source: row.source_title,
      url: row.source_url,
      keywords: [],
    }));
  } catch {
    return undefined;
  }
}

export const askJago = createServerFn({ method: "POST" })
  .validator((input: unknown): AskInput => {
    const raw = input as Partial<AskInput>;
    const query = scrub(String(raw.query ?? ""));
    if (!query) throw new Error("Ask a question first.");
    return {
      query,
      lang: raw.lang === "hi" ? "hi" : "en",
      brief: scrub(String(raw.brief ?? "")).slice(0, 1600),
      fallbackText: scrub(String(raw.fallbackText ?? "")).slice(0, 400),
      fallbackNext: scrub(String(raw.fallbackNext ?? "")).slice(0, 160),
      fallbackHref: String(raw.fallbackHref ?? "/home").slice(0, 80),
    };
  })
  .handler(async ({ data }): Promise<JagoReply> => {
    const useVectors = Boolean(process.env.XAI_EMBEDDING_MODEL);
    const embedded = useVectors ? await embedText(`query: ${data.query}`, process.env.XAI_API_KEY) : null;
    const vectorHits = embedded?.provider === "xai" ? await matchVectors(data.lang, embedded.vector) : undefined;
    const retrieval: JagoReply["retrieval"] = vectorHits && vectorHits.length > 0 ? "xai" : "keyword";
    const corpus = vectorHits && vectorHits.length > 0 ? vectorHits : await loadCorpus(data.lang);
    const passages = vectorHits && vectorHits.length > 0 ? vectorHits.slice(0, 3).map((chunk) => ({ chunk, score: 1 })) : rankPassages(data.query, data.lang, corpus);
    const local = answerQuestion(data.query, data.lang, corpus);
    const citations: KnowledgeCitation[] = passages.map((item) => ({
      id: item.chunk.id,
      title: item.chunk.title,
      source: item.chunk.source,
      url: item.chunk.url,
    }));
    const grounded = fallbackAnswer(data.query, data.fallbackText, passages);
    const fileReply = (): JagoReply => ({
      confident: Boolean(data.fallbackText),
      text: data.fallbackText || null,
      nextAction: data.fallbackNext || null,
      citations: data.fallbackHref
        ? [{ id: "file", title: data.fallbackNext || "This file", source: "This file", url: data.fallbackHref }]
        : [],
      via: data.fallbackText ? "file" : "refusal",
      retrieval,
    });
    const groundedReply = (): JagoReply => {
      if (!grounded) return local.confident ? { ...local, via: "extract", retrieval } : fileReply();
      return {
        confident: true,
        text: grounded,
        nextAction: data.fallbackNext || local.nextAction,
        citations: [
          ...citations,
          ...(data.fallbackHref
            ? [{ id: "file", title: data.fallbackNext || "This file", source: "This file", url: data.fallbackHref }]
            : []),
        ].slice(0, 3),
        via: isFileQuestion(data.query) ? "file" : "extract",
        retrieval,
      };
    };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || !allow(12)) return groundedReply();
    const packed = passages
      .map((item, index) => `PASSAGE ${index + 1} (${item.chunk.title})\n${item.chunk.body}\nNEXT HINT: ${item.chunk.next}`)
      .join("\n\n");
    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 320,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are JAGO inside JANMARG. Answer only from FILE and PASSAGES. If the question is about this student, the first sentence must use the FILE facts and must not contradict them. A missing paper is a blocker, not a rejection. Four short sentences at most. No greeting, no heading. If neither source answers, reply exactly: NOT_IN_EXTRACT. Reply in Hindi when lang is hi, otherwise English. Never say approved, guaranteed, sanctioned, or that money will be paid. Never claim a live government login. Do not ask for Aadhaar, a bank account, or an OTP. End with one line that starts NEXT:.",
            },
            {
              role: "user",
              content: `lang: ${data.lang}\nQuestion: ${data.query}\n\nFILE\n${data.brief || "none"}\n\n${packed || "PASSAGES\nnone"}`,
            },
          ],
        }),
      });
      if (!response.ok) return groundedReply();
      const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const parsed = parseModelAnswer(body.choices?.[0]?.message?.content ?? "");
      if (!parsed || !acceptModel(data.query, parsed.text, data.fallbackText)) return groundedReply();
      const fileCite: KnowledgeCitation = {
        id: "file",
        title: data.fallbackNext || "This file",
        source: "This file",
        url: data.fallbackHref || "/home",
      };
      return {
        confident: true,
        text: parsed.text,
        nextAction: parsed.next || data.fallbackNext || local.nextAction,
        citations: citations.length > 0 ? [...citations, fileCite] : [fileCite],
        via: "grok",
        retrieval,
      };
    } catch {
      return groundedReply();
    }
  });

export const speakJago = createServerFn({ method: "POST" })
  .validator((input: unknown): { text: string; lang: Lang } => {
    const raw = input as { text?: unknown; lang?: unknown };
    const text = scrub(String(raw.text ?? "")).slice(0, 420);
    if (!text) throw new Error("Nothing to read.");
    return { text, lang: raw.lang === "hi" ? "hi" : "en" };
  })
  .handler(async ({ data }): Promise<{ ok: true; audio: string } | { ok: false }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || !allow(8)) return { ok: false };
    try {
      const response = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ text: data.text, voice_id: "eve", language: data.lang === "hi" ? "hi" : "en" }),
      });
      if (!response.ok) return { ok: false };
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength < 100 || bytes.byteLength > 1_500_000) return { ok: false };
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
      return { ok: true, audio: btoa(binary) };
    } catch {
      return { ok: false };
    }
  });
