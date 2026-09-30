import { createServerFn } from "@tanstack/react-start";
import { JAGO_FALLBACK, KNOWLEDGE, allowedHost } from "./showcase.ts";

type Citation = { title: string; url: string; source_id: string; excerpt: string };

export const askJago = createServerFn({ method: "POST" })
  .validator((input: { question: string }) => {
    const question = input.question.trim().slice(0, 500);
    if (question.length < 2) throw new Error("Question is too short");
    return { question };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    const chunks = KNOWLEDGE.filter((item) => {
      const hay = `${item.title} ${item.excerpt}`.toLowerCase();
      return data.question
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .some((word) => hay.includes(word));
    }).slice(0, 3);
    const retrieved = chunks.length > 0 ? chunks : [];
    if (!apiKey || retrieved.length === 0) {
      return { ok: true as const, source: "fallback" as const, text: JAGO_FALLBACK, citations: [] as Citation[] };
    }
    const prompt = [
      "You are JAGO. Answer only from the chunks. Do not decide eligibility, sanction, or payment.",
      "Never claim a live government connection. If the chunks are not enough, say you cannot confirm.",
      "Return JSON: {\"answer_text\":\"...\",\"citations\":[{\"url\":\"...\"}]}",
      `Question: ${data.question}`,
      "Chunks:",
      ...retrieved.map((item) => `- ${item.url} | ${item.title} | ${item.excerpt}`),
    ].join("\n");
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 400,
        messages: [
          { role: "system", content: "Reply with JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return { ok: true as const, source: "fallback" as const, text: JAGO_FALLBACK, citations: [] as Citation[] };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content ?? "";
    let parsed: { answer_text?: string; citations?: { url?: string }[] } = {};
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "")) as typeof parsed;
    } catch {
      return { ok: true as const, source: "fallback" as const, text: JAGO_FALLBACK, citations: [] as Citation[] };
    }
    const citations: Citation[] = [];
    for (const cite of parsed.citations ?? []) {
      const match = retrieved.find((item) => item.url === cite.url);
      if (!match || !cite.url || !allowedHost(cite.url)) {
        return { ok: true as const, source: "fallback" as const, text: JAGO_FALLBACK, citations: [] as Citation[] };
      }
      citations.push({ title: match.title, url: match.url, source_id: match.id, excerpt: match.excerpt });
    }
    if (!parsed.answer_text || citations.length === 0) {
      return { ok: true as const, source: "fallback" as const, text: JAGO_FALLBACK, citations: [] as Citation[] };
    }
    return { ok: true as const, source: "grok" as const, text: parsed.answer_text, citations };
  });
