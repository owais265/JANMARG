import { createServerFn } from "@tanstack/react-start";

const hits = new Map<string, number[]>();

function limited(bucket: string, max: number) {
  const now = Date.now();
  const recent = (hits.get(bucket) ?? []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= max) return true;
  hits.set(bucket, [...recent, now]);
  return false;
}

function key() {
  return process.env["XAI_API_KEY"]?.trim() ?? "";
}

const STT_LANG: Record<string, string> = {
  en: "en",
  hi: "hi",
  hinglish: "hi",
  bn: "bn",
  or: "or",
  te: "te",
  ta: "ta",
  mr: "mr",
  gu: "gu",
  as: "as",
  kn: "kn",
  sat: "hi",
};

export async function readPicture(data: string, mime: string): Promise<{ ok: true; text: string } | { ok: false; text: string }> {
  const apiKey = key();
  if (!apiKey) return { ok: false, text: "Picture reading is not available right now." };
  if (limited("image", 6)) return { ok: false, text: "Please wait a moment and try again." };
  if (data.length > 1_400_000 || !/^image\/(png|jpeg)$/.test(mime)) {
    return { ok: false, text: "Use a smaller PNG or JPEG. Do not send an identity card." };
  }
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(20000),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content:
            "Describe only scholarship-relevant words visible in the picture: scheme name, class, income line, or an instruction. " +
            "If the picture shows an identity card, bank page, OTP, or a long number, reply exactly IDENTITY_HIDDEN and do not repeat any digits. " +
            "Do not decide eligibility or payment.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "What scholarship preparation text is visible?" },
            { type: "image_url", image_url: { url: `data:${mime};base64,${data}` } },
          ],
        },
      ],
    }),
  });
  if (!response.ok) return { ok: false, text: "Picture reading is not available right now." };
  const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = (body.choices?.[0]?.message?.content ?? "").trim();
  if (!text || /IDENTITY_HIDDEN/i.test(text) || /\d{8,}/.test(text)) {
    return { ok: false, text: "JANMARG will not read an identity card or a bank page. Ask the question in words." };
  }
  return { ok: true, text: text.slice(0, 500) };
}

export const speakGuidance = createServerFn({ method: "POST" })
  .validator((input: { text?: string }) => ({ text: (input.text ?? "").replace(/\s+/g, " ").trim().slice(0, 500) }))
  .handler(async ({ data }) => {
    const apiKey = key();
    if (!apiKey || data.text.length < 2) return { ok: false as const, error: "voice-off" };
    if (limited("tts", 8)) return { ok: false as const, error: "wait" };
    const response = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ text: data.text, voice_id: "eve" }),
    });
    if (!response.ok) return { ok: false as const, error: "voice-off" };
    const audio = Buffer.from(await response.arrayBuffer()).toString("base64");
    return { ok: true as const, audio, mime: "audio/mpeg" };
  });

export const transcribeGuidance = createServerFn({ method: "POST" })
  .validator((input: { audio?: string; mime?: string; language?: string }) => ({
    audio: (input.audio ?? "").replace(/\s/g, ""),
    mime: (input.mime ?? "audio/webm").slice(0, 40),
    language: STT_LANG[input.language ?? "en"] ?? "en",
  }))
  .handler(async ({ data }) => {
    const apiKey = key();
    if (!apiKey || data.audio.length < 20) return { ok: false as const, text: "" };
    if (data.audio.length > 1_600_000 || limited("stt", 8)) return { ok: false as const, text: "" };
    const bytes = Buffer.from(data.audio, "base64");
    const form = new FormData();
    form.append("model", "grok-voice-transcribe-2.0");
    form.append("language", data.language);
    form.append("file", new Blob([bytes], { type: data.mime || "audio/webm" }), "clip.webm");
    const response = await fetch("https://api.x.ai/v1/stt", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!response.ok) return { ok: false as const, text: "" };
    const body = (await response.json()) as { text?: string };
    const text = (body.text ?? "").trim().slice(0, 500);
    if (/\d{8,}/.test(text)) return { ok: false as const, text: "" };
    return { ok: true as const, text };
  });
