import type { Passage } from "./corpus";

export type Cite = { title: string; url: string };

export type Retrieval = {
  mode: "refused" | "fallback" | "grounded";
  text: string;
  cites: Cite[];
  used: Passage[];
};

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "what", "how", "do", "does", "did", "i", "to", "for", "of", "and", "or", "in", "on", "my", "me", "please", "can", "you", "your", "this", "that", "with", "from", "about", "should", "would", "could", "where", "when", "which", "who", "whom", "will", "have", "has", "had", "not", "into", "its", "it",
  "kya", "hai", "ka", "ke", "ki", "mein", "me", "se", "ko", "kahan", "kaise", "kaun", "kaunsi", "mera", "meri", "mujhe", "please",
  "क्या", "है", "के", "की", "का", "में", "से", "को", "कहाँ", "कहां", "कैसे", "कौन", "मुझे", "यह", "ये", "और", "का", "पर",
]);

const REFUSE =
  /\b(aadhaar|aadhar|uidai|otp|password|ifsc)\b|आधार|आधार|application status|payment status|status of my|my (application|payment|dbt|status)|have i been|was i (approved|rejected|sanctioned)|am i (approved|rejected|sanctioned|eligible)|verify my|certificate number|bank account number|account number|खाता संख्या|आवेदन की स्थिति|भुगतान की स्थिति|मेरा भुगतान|मेरी आवेदन/i;

const BANNED_ANSWER =
  /\b(you are eligible|you qualify|your application (is|has been) (approved|rejected|sanctioned)|payment (has been|was) (sent|credited)|i (have )?(verified|sanctioned)|guaranteed award)\b/i;

const ALIASES: [RegExp, string][] = [
  [/post[\s-]?matric/gi, " post-matric post matric पोस्ट "],
  [/pre[\s-]?matric/gi, " pre-matric pre matric प्री "],
  [/top[\s-]?class/gi, " top-class top class टॉप "],
  [/nfst|fellowship|फेलोशिप|फेलोशिप/gi, " nfst fellowship फेलोशिप "],
  [/overseas|\bnos\b|विदेश|प्रवासी/gi, " nos overseas विदेश "],
  [/income|आय|ceiling|limit|सीमा/gi, " income आय ceiling "],
  [/document|checklist|दस्तावेज|कागज|दस्तावेज़/gi, " document checklist दस्तावेज "],
  [/apply|application|आवेदन|portal|पोर्टल/gi, " apply आवेदन portal "],
  [/rule|guideline|नियम|दिशानिर्देश/gi, " rules guideline नियम "],
  [/digilocker|digi[\s-]?locker|डिजीलॉकर/gi, " digilocker "],
  [/direct benefit|\bdbt\b|पीएफएमएस|pfms/gi, " dbt direct benefit transfer pfms "],
  [/blocked|deficiency|pending|रुकी|कमी/gi, " blocked deficiency "],
];

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}\p{N}.]+/u)
    .map((token) => token.replace(/^\.+|\.+$/g, ""))
    .filter((token) => token.length > 1 && !STOP.has(token));
}

function expand(question: string): string {
  let extra = "";
  for (const [pattern, addition] of ALIASES) {
    if (pattern.test(question)) extra += addition;
    pattern.lastIndex = 0;
  }
  return `${question} ${extra}`;
}

function prefersHindi(question: string, language: string): boolean {
  if (language === "hi" || language === "hinglish") return true;
  return /\p{Script=Devanagari}/u.test(question);
}

function boundary(hindi: boolean): string {
  return hindi
    ? " यह समीक्षित सार्वजनिक टिप्पणी से सामान्य मार्गदर्शन है, आधिकारिक निर्णय नहीं।"
    : " This is general guidance from reviewed public notes, not an official decision.";
}

const FALLBACK_EN =
  "I cannot confirm this from the reviewed public notes. Please check the ministry scholarship page.";
const FALLBACK_HI =
  "मैं इसे समीक्षित सार्वजनिक टिप्पणियों से पुष्टि नहीं कर सकता। कृपया मंत्रालय का छात्रवृत्ति पृष्ठ देखें।";
const REFUSE_EN =
  "JANMARG cannot see application status, payment status, verification, or government records. Please check the official portal. Do not enter an identity number, bank number, OTP, or password here.";
const REFUSE_HI =
  "जनमार्ग आवेदन स्थिति, भुगतान स्थिति, जाँच या सरकारी रिकॉर्ड नहीं देख सकता। आधिकारिक पोर्टल देखें। यहाँ पहचान संख्या, बैंक संख्या, ओटीपी या पासवर्ड न लिखें।";

/** Lexical rank over the curated store. Same function on every server answer. */
export function retrieveGuidance(question: string, passages: Passage[], language = "en"): Retrieval {
  const hindi = prefersHindi(question, language);
  const clean = question.trim();
  if (REFUSE.test(clean) || /\d{8,}/.test(clean)) {
    return { mode: "refused", text: hindi ? REFUSE_HI : REFUSE_EN, cites: [], used: [] };
  }

  const queryTokens = tokens(expand(clean));
  const docs = passages.map((passage) => {
    const bag = tokens(`${passage.title} ${passage.keywords} ${passage.body}`);
    const freq = new Map<string, number>();
    for (const token of bag) freq.set(token, (freq.get(token) ?? 0) + 1);
    return { passage, freq, length: bag.length || 1, title: new Set(tokens(`${passage.title} ${passage.keywords}`)) };
  });
  const avg = docs.reduce((sum, doc) => sum + doc.length, 0) / (docs.length || 1);
  const df = new Map<string, number>();
  for (const token of new Set(queryTokens)) {
    df.set(token, docs.filter((doc) => doc.freq.has(token)).length);
  }

  const k1 = 1.2;
  const b = 0.75;
  const ranked = docs
    .map((doc) => {
      let score = 0;
      for (const token of queryTokens) {
        const tf = doc.freq.get(token) ?? 0;
        if (!tf) continue;
        const seen = df.get(token) ?? 0;
        const idf = Math.log((docs.length - seen + 0.5) / (seen + 0.5) + 1);
        const norm = tf * (k1 + 1) / (tf + k1 * (1 - b + b * (doc.length / avg)));
        score += idf * norm * (doc.title.has(token) ? 2.2 : 1);
      }
      if (hindi && doc.passage.lang === "hi") score *= 1.15;
      if (!hindi && doc.passage.lang === "en") score *= 1.15;
      return { passage: doc.passage, score };
    })
    .filter((item) => item.score >= 1.4)
    .sort((a, b) => b.score - a.score);

  const bestLang = hindi ? "hi" : "en";
  const picked = ranked.filter((item) => item.passage.lang === bestLang).slice(0, 2);
  const used = (picked.length ? picked : ranked.slice(0, 2)).map((item) => item.passage);
  if (!used.length) {
    return { mode: "fallback", text: hindi ? FALLBACK_HI : FALLBACK_EN, cites: [], used: [] };
  }

  const cites = uniqueCites(used);
  const text = `${used.map((item) => item.body).join(" ")}${boundary(used[0]?.lang === "hi")}`;
  return { mode: "grounded", text, cites, used };
}

function uniqueCites(passages: Passage[]): Cite[] {
  const seen = new Set<string>();
  const cites: Cite[] = [];
  for (const passage of passages) {
    if (seen.has(passage.sourceUrl)) continue;
    seen.add(passage.sourceUrl);
    cites.push({ title: passage.sourceTitle, url: passage.sourceUrl });
  }
  return cites;
}

/** Keep a model sentence only when every number and link already sits in the passages or the practice file. */
export function acceptModelAnswer(raw: string, passages: Passage[], extra = ""): string | null {
  const text = raw.replace(/\n?CITE:.*$/gim, "").trim();
  if (!text || /NOT_IN_PASSAGES/i.test(text) || BANNED_ANSWER.test(text)) return null;
  const blob = `${extra} ${passages.map((item) => `${item.title} ${item.body} ${item.sourceUrl}`).join(" ")}`;
  const numbers = text.match(/\d+(?:\.\d+)?/g) ?? [];
  for (const number of numbers) {
    const value = Number(number);
    const significant = number.includes(".") || value >= 50;
    if (significant && !blob.includes(number)) return null;
  }
  const links = text.match(/https?:\/\/\S+/g) ?? [];
  for (const link of links) {
    const bare = link.replace(/[).,]+$/g, "");
    if (!passages.some((item) => item.sourceUrl.startsWith(bare) || bare.startsWith(item.sourceUrl))) return null;
  }
  return text;
}

export function notesForScheme(passages: Passage[], scheme: string, language: string): Passage[] {
  const hindi = language === "hi" || language === "hinglish";
  const lang = hindi ? "hi" : "en";
  const rows = passages.filter((item) => item.scheme === scheme || (item.scheme === "all" && (item.topic === "documents" || item.topic === "apply")));
  const preferred = rows.filter((item) => item.lang === lang);
  return (preferred.length ? preferred : rows.filter((item) => item.lang === "en")).slice(0, 3);
}
