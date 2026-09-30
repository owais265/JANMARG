import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { JAGO_FALLBACK } from "./content";

const hits = new Map<string, number[]>();

const optionalSession = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    let userId: string | null = null;
    try {
      userId = (await getSessionUser(context.bearerToken))?.id ?? null;
    } catch {
      userId = null;
    }
    return next({ context: { userId } });
  });

function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < 60_000);
  if (recent.length > 20) return true;
  hits.set(key, [...recent, now]);
  return false;
}

export const askGuidance = createServerFn({ method: "POST" })
  .middleware([optionalSession])
  .validator((input: { question?: string; language?: string; honeypot?: string; image?: string; mime?: string; file?: string; history?: { role?: string; text?: string }[] }) => {
    const question = (input.question ?? "").trim().slice(0, 500);
    const image = (input.image ?? "").replace(/\s/g, "");
    const mime = input.mime === "image/jpeg" ? "image/jpeg" : "image/png";
    const history = Array.isArray(input.history)
      ? input.history.slice(-6).map((item) => ({
          role: item?.role === "assistant" ? ("assistant" as const) : ("user" as const),
          text: String(item?.text ?? "").replace(/\s+/g, " ").trim().slice(0, 360),
        })).filter((item) => item.text.length > 1)
      : [];
    const file = String(input.file ?? "").replace(/\s+/g, " ").trim().slice(0, 1400);
    if ((input.honeypot ?? "").trim()) return { question: "", language: "en", image: "", mime, skip: true, history: [], file: "" };
    if (!image && question.length < 2) throw new Error("Please write a slightly longer question.");
    if (image.length > 1_400_000) throw new Error("That picture is too large.");
    return { question, language: (input.language ?? "en").slice(0, 12), image, mime, skip: false, history, file };
  })
  .handler(async ({ data, context }) => {
    if (data.skip) return { ok: true as const, text: JAGO_FALLBACK, cites: [] as { title: string; url: string }[], mode: "fallback" as const };
    const key = context.userId ?? "public";
    if (limited(key)) {
      return { ok: false as const, text: "Please wait a moment and try again.", cites: [] as { title: string; url: string }[], mode: "fallback" as const };
    }
    let question = data.question;
    if (data.image) {
      const { readPicture } = await import("./media-server");
      const seen = await readPicture(data.image, data.mime);
      if (!seen.ok) return { ok: true as const, text: seen.text, cites: [] as { title: string; url: string }[], mode: "refused" as const };
      question = `${question}\n${seen.text}`.trim().slice(0, 700);
    }
    const { answerQuestion } = await import("./knowledge.server");
    return answerQuestion({ question, language: data.language, userId: context.userId, history: data.history, file: data.file });
  });

export const exportGuidance = createServerFn({ method: "POST" })
  .middleware([optionalSession])
  .handler(async ({ context }) => {
    if (!context.userId) return { lines: [] as { role: "user" | "assistant"; text: string }[] };
    const { listMessages } = await import("./knowledge.server");
    const rows = await listMessages(context.userId);
    return { lines: rows.map((row) => ({ role: row.role, text: row.text })) };
  });

export const schemeNotes = createServerFn({ method: "POST" })
  .validator((input: { scheme?: string; language?: string }) => ({
    scheme: (input.scheme ?? "all").slice(0, 40),
    language: (input.language ?? "en").slice(0, 12),
  }))
  .handler(async ({ data }) => {
    const { schemePassageNotes } = await import("./knowledge.server");
    return schemePassageNotes(data.scheme, data.language);
  });

export const listGuidance = createServerFn({ method: "POST" })
  .middleware([optionalSession])
  .handler(async ({ context }) => {
    if (!context.userId) return [];
    const { listMessages } = await import("./knowledge.server");
    return listMessages(context.userId);
  });

export const clearGuidance = createServerFn({ method: "POST" })
  .middleware([optionalSession])
  .handler(async ({ context }) => {
    if (!context.userId) return { ok: true as const };
    const { clearMessages } = await import("./knowledge.server");
    await clearMessages(context.userId);
    return { ok: true as const };
  });
