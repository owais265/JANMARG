import { env } from "@/lib/env.server";
import { getSql } from "@/lib/db";
import { CORPUS_VERSION, PASSAGES, type Passage } from "./corpus";
import { JAGO_ENABLED, JAGO_FALLBACK } from "./content";
import { acceptModelAnswer, retrieveGuidance, notesForScheme, type Cite } from "./retrieve";

const LANG_NAME: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  hinglish: "simple Hindi written in Latin letters",
  bn: "Bengali",
  or: "Odia",
  te: "Telugu",
  ta: "Tamil",
  mr: "Marathi",
  gu: "Gujarati",
  as: "Assamese",
  kn: "Kannada",
  sat: "Santali",
};

const HARD_REFUSE =
  /\b(aadhaar|aadhar|uidai|otp|password|ifsc)\b|आधार|\d{8,}/i;
const PERSONAL =
  /\b(my|mine|file|document|marksheet|mismatch|payment|locker|fix|held|blocked)\b|मेरा|मेरी|मुझे|नाम|दस्तावेज|भुगतान|फाइल/i;
const APP =
  "JANMARG is a practice app for five Ministry of Tribal Affairs scholarships: Pre-Matric, Post-Matric, Top Class, National Fellowship for ST students, and National Overseas Scholarship. " +
  "JAGO is the guide inside the app. The phone has four tabs: Home, Schemes, JAGO, and Settings. " +
  "Home shows the five schemes, a practice file, documents, and alerts. Schemes explains each scholarship. Settings has language, profile, and an optional practice DigiLocker connect. " +
  "JAGO can explain a scheme, a document list, and what a practice file is showing. JAGO cannot submit an application, see a live government status, or decide eligibility.";

const GREETING = /^(hi|hii|hello|hey|namaste|namaskar|good morning|good evening|thanks|thank you)\b/i;

function scrub(value: string, max: number) {
  return value.replace(/\b\d{8,}\b/g, "[removed]").replace(/\s+/g, " ").trim().slice(0, max);
}

function searchQuestion(question: string, history: { role: string; text: string }[]) {
  const last = [...history].reverse().find((turn) => turn.role === "user")?.text ?? "";
  const short = question.split(/\s+/).length <= 10;
  if (!last || !short) return question;
  return `${last} ${question}`.slice(0, 500);
}

const cache = new Map<string, string>();
let ready: Promise<void> | null = null;

function mapRow(row: Record<string, unknown>): Passage {
  return {
    id: String(row.id),
    scheme: String(row.scheme),
    topic: String(row.topic),
    lang: row.lang === "hi" ? "hi" : "en",
    title: String(row.title),
    body: String(row.body),
    sourceTitle: String(row.source_title),
    sourceUrl: String(row.source_url),
    reviewedOn: String(row.reviewed_on),
    keywords: String(row.keywords ?? ""),
  };
}

async function seed(): Promise<void> {
  const sql = await getSql();
  const existing = await sql<{ version: string }>`select version from knowledge_passages limit 1`;
  if (existing[0]?.version === CORPUS_VERSION) {
    const count = await sql<{ n: number }>`select count(*) as n from knowledge_passages`;
    if (Number(count[0]?.n ?? 0) >= PASSAGES.length) return;
  }
  for (const passage of PASSAGES) {
    await sql`
      insert into knowledge_passages (
        id, scheme, topic, lang, title, body, source_title, source_url, reviewed_on, keywords, version
      ) values (
        ${passage.id}, ${passage.scheme}, ${passage.topic}, ${passage.lang}, ${passage.title}, ${passage.body},
        ${passage.sourceTitle}, ${passage.sourceUrl}, ${passage.reviewedOn}, ${passage.keywords}, ${CORPUS_VERSION}
      )
      on conflict (id) do update set
        scheme = excluded.scheme,
        topic = excluded.topic,
        lang = excluded.lang,
        title = excluded.title,
        body = excluded.body,
        source_title = excluded.source_title,
        source_url = excluded.source_url,
        reviewed_on = excluded.reviewed_on,
        keywords = excluded.keywords,
        version = excluded.version
    `;
  }
}

export async function readPassages(): Promise<Passage[]> {
  try {
    if (!ready) {
      ready = seed().catch((error) => {
        ready = null;
        throw error;
      });
    }
    await ready;
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from knowledge_passages`;
    if (rows.length) return rows.map(mapRow);
  } catch (error) {
    console.error("[knowledge] store unavailable, using the reviewed notes in memory");
    if (error instanceof Error) console.error(error.message);
  }
  return PASSAGES;
}

async function compose(
  question: string,
  language: string,
  used: Passage[],
  file: string,
  history: { role: "user" | "assistant"; text: string }[],
): Promise<string | null> {
  const apiKey = env("XAI_API_KEY");
  if (!apiKey) return null;
  const key = `v3:${language}:${file.slice(0, 80)}:${history.map((turn) => turn.text).join("|").slice(-160)}:${question.toLowerCase().replace(/\s+/g, " ").slice(0, 180)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const notes = used.map((item, index) => `[${index + 1}] ${item.title}\n${item.body}\nSource: ${item.sourceUrl}`).join("\n\n");
  const prior = history.map((turn) => ({ role: turn.role, content: turn.text }));
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(14000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 380,
        messages: [
          {
            role: "system",
            content:
              "You are JAGO inside JANMARG. Talk like a helpful person who remembers this chat. " +
              "Answer greetings, thanks, and questions about who you are or how the app works from APP. " +
              "Use earlier messages for follow-ups such as 'that one', 'and the documents', or 'what next'. " +
              "LOCKER is a practice file, not a live record. If they ask about their file, papers, a name mismatch, or a practice status, start from LOCKER and do not contradict it. " +
              "NOTES are reviewed public scheme notes. Use them for rules, income lines, documents, and how a scheme is described. If NOTES do not contain a figure, say you cannot confirm that figure. Do not invent it. " +
              "Never say the student is eligible, approved, rejected, sanctioned, or that money was paid or will be paid. " +
              "Never ask for Aadhaar, bank details, OTP, or a password. Do not invent URLs. " +
              "Two to five short sentences. No heading. Plain speech. " +
              "When you state a scheme rule or a file fact, end with one sentence that this is practice guidance and not an official decision. Skip that sentence for a pure hello or thank-you. " +
              `Write in ${LANG_NAME[language] ?? "English"}.`,
          },
          ...prior,
          {
            role: "user",
            content: `APP:\n${APP}\n\nLOCKER:\n${file || "none"}\n\nNOTES:\n${notes || "none"}\n\nQUESTION:\n${question}`,
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const text = acceptModelAnswer(body.choices?.[0]?.message?.content ?? "", used, file);
    if (!text) return null;
    cache.set(key, text);
    if (cache.size > 200) cache.delete(cache.keys().next().value ?? key);
    return text;
  } catch (error) {
    if (error instanceof Error) console.error(`[knowledge] model skipped: ${error.message}`);
    return null;
  }
}

function localTalk(
  question: string,
  language: string,
  found: ReturnType<typeof retrieveGuidance>,
  file: string,
): string {
  const hindi = language === "hi" || language === "hinglish" || /\p{Script=Devanagari}/u.test(question);
  const q = question.trim();
  if (GREETING.test(q) && q.length < 40) {
    return hindi
      ? "नमस्ते। मैं जागो हूँ। प्री-मैट्रिक, पोस्ट-मैट्रिक, टॉप क्लास, फेलोशिप, ओवरसीज, या इस प्रैक्टिस फाइल के बारे में पूछ सकते हो।"
      : "Hello. I am JAGO. Ask me about Pre-Matric, Post-Matric, Top Class, the fellowship, overseas study, or your practice file.";
  }
  if (/\b(who are you|what are you|your name|kaun ho|tum kaun)\b/i.test(q)) {
    return hindi
      ? "मैं जागो हूँ, जनमार्ग के अंदर का सहायक। पाँच छात्रवृत्तियाँ समझा सकता हूँ। आवेदन जमा नहीं करता और पात्रता तय नहीं करता।"
      : "I am JAGO, the guide inside JANMARG. I can explain the five scholarships. I do not submit an application or decide eligibility.";
  }
  if (/\b(what is janmarg|janmarg kya|this app|what can you|how do i use|help)\b/i.test(q)) {
    return hindi
      ? "जनमार्ग पाँच योजनाओं की प्रैक्टिस ऐप है: प्री-मैट्रिक, पोस्ट-मैट्रिक, टॉप क्लास, नेशनल फेलोशिप और ओवरसीज। होम पर फाइल, स्कीम्स पर पढ़ाई, सेटिंग्स में भाषा और वैकल्पिक डिजीलॉकर है। यह आधिकारिक पोर्टल नहीं है।"
      : "JANMARG is a practice app for five scholarships: Pre-Matric, Post-Matric, Top Class, National Fellowship, and National Overseas. Home shows your file, Schemes explains each one, and Settings has language plus an optional practice DigiLocker. This is not the official portal.";
  }
  if (file && PERSONAL.test(question) && found.mode !== "grounded") {
    const line = file.split(/(?<=\.)\s/).slice(0, 2).join(" ");
    const tail = hindi ? " यह प्रैक्टिस फाइल है, आधिकारिक निर्णय नहीं।" : " This is the practice file, not an official decision.";
    return `${line}${tail}`;
  }
  if (found.mode === "fallback") {
    return hindi
      ? "इस सवाल का जवाब समीक्षित नोट्स में नहीं मिला। स्कीम का नाम लेकर पूछो, या आधिकारिक पोर्टल पर नियम जाँचो। यह आधिकारिक निर्णय नहीं है।"
      : "I don't have that in the reviewed notes. Name the scheme, or check the rule on the official portal. This is not an official decision.";
  }
  if (!found.text) return JAGO_FALLBACK;
  return found.text;
}

async function remember(userId: string, question: string, answer: string, cites: Cite[]) {
  const sql = await getSql();
  const citesJson = JSON.stringify(cites).slice(0, 2000);
  const stamp = Date.now();
  await sql`
    insert into guidance_messages (id, user_id, role, body, cites_json)
    values (${`u-${stamp}-${userId.slice(0, 8)}`}, ${userId}, ${"user"}, ${question.slice(0, 500)}, ${"[]"})
  `;
  await sql`
    insert into guidance_messages (id, user_id, role, body, cites_json)
    values (${`a-${stamp}-${userId.slice(0, 8)}`}, ${userId}, ${"assistant"}, ${answer.slice(0, 2000)}, ${citesJson})
  `;
}

export async function answerQuestion(input: {
  question: string;
  language: string;
  userId: string | null;
  history?: { role: "user" | "assistant"; text: string }[];
  file?: string;
}) {
  if (!JAGO_ENABLED) {
    return { ok: true as const, text: "JAGO is paused. You can still read the scheme pages and open the official links.", cites: [] as Cite[], mode: "paused" as const };
  }
  const history = (input.history ?? [])
    .slice(-6)
    .map((turn) => ({
      role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
      text: scrub(turn.text, 360),
    }))
    .filter((turn) => turn.text.length > 1);
  const file = scrub(input.file ?? "", 1400);
  const question = scrub(input.question, 500);
  const passages = await readPassages();
  if (HARD_REFUSE.test(question)) {
    const refused = retrieveGuidance(question, passages, input.language);
    return { ok: true as const, text: refused.text, cites: [] as Cite[], mode: "refused" as const };
  }
  let found = retrieveGuidance(question, passages, input.language);
  if (found.mode === "fallback") {
    const wider = retrieveGuidance(searchQuestion(question, history), passages, input.language);
    if (wider.mode === "grounded") found = wider;
  }
  if (found.mode === "refused" && file && PERSONAL.test(question)) {
    found = { mode: "grounded", text: "", cites: [], used: [] };
  }
  let text = localTalk(question, input.language, found, file);
  if (found.mode !== "refused") {
    const modeled = await compose(question, input.language, found.used, file, history);
    if (modeled) text = modeled;
  }
  if (found.mode === "fallback" && !text) text = JAGO_FALLBACK;
  if (input.userId && found.mode !== "refused") {
    try {
      await remember(input.userId, question, text, found.cites);
    } catch (error) {
      if (error instanceof Error) console.error(`[knowledge] history skipped: ${error.message}`);
    }
  }
  return { ok: true as const, text, cites: found.cites, mode: found.mode };
}

export async function schemePassageNotes(scheme: string, language: string) {
  const passages = await readPassages();
  return notesForScheme(passages, scheme, language).map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    url: item.sourceUrl,
    sourceTitle: item.sourceTitle,
  }));
}

export async function listMessages(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string; role: string; body: string; cites_json: string }>`
    select id, role, body, cites_json from guidance_messages
    where user_id = ${userId}
    order by created_at asc
    limit 40
  `;
  return rows.map((row) => ({
    id: row.id,
    role: row.role === "user" ? "user" as const : "assistant" as const,
    text: row.body,
    cites: parseCites(row.cites_json),
  }));
}

export async function clearMessages(userId: string) {
  const sql = await getSql();
  await sql`delete from guidance_messages where user_id = ${userId}`;
}

function parseCites(value: string): Cite[] {
  try {
    const parsed = JSON.parse(value) as Cite[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.title === "string" && typeof item.url === "string");
  } catch {
    return [];
  }
}
