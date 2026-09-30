export const RESEARCH_AGENT = "JANMARG-SIH-Research-Bot";

export const OFFICIAL_SOURCES = [
  { domain: "tribal.nic.in", baseUrl: "https://tribal.nic.in", owner: "Ministry of Tribal Affairs", sourceType: "ministry" },
  { domain: "scholarships.gov.in", baseUrl: "https://scholarships.gov.in", owner: "National Scholarship Portal", sourceType: "portal" },
  { domain: "fellowship.tribal.gov.in", baseUrl: "https://fellowship.tribal.gov.in", owner: "Ministry of Tribal Affairs", sourceType: "scheme_portal" },
  { domain: "overseas.tribal.gov.in", baseUrl: "https://overseas.tribal.gov.in", owner: "Ministry of Tribal Affairs", sourceType: "scheme_portal" },
  { domain: "dbttribal.gov.in", baseUrl: "https://dbttribal.gov.in", owner: "Ministry of Tribal Affairs", sourceType: "portal" },
  { domain: "www.digilocker.gov.in", baseUrl: "https://www.digilocker.gov.in", owner: "Ministry of Electronics and IT", sourceType: "identity_portal" },
  { domain: "apisetu.gov.in", baseUrl: "https://apisetu.gov.in", owner: "Ministry of Electronics and IT", sourceType: "api_directory" },
  { domain: "apaar.education.gov.in", baseUrl: "https://apaar.education.gov.in", owner: "Ministry of Education", sourceType: "education_id" },
  { domain: "udiseplus.gov.in", baseUrl: "https://udiseplus.gov.in", owner: "Ministry of Education", sourceType: "education_mis" },
  { domain: "aishe.gov.in", baseUrl: "https://aishe.gov.in", owner: "Ministry of Education", sourceType: "education_mis" },
] as const;

const BLOCKED_PATH = /(login|sign-?in|signup|otp|captcha|oauth|dashboard|\/account\b|\/admin\b)/i;

export type UrlDecision = "allowed" | "off_allowlist" | "blocked_path" | "not_https";

export function classifyUrl(value: string): UrlDecision {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "off_allowlist";
  }
  if (url.protocol !== "https:" || url.username || url.password) return "not_https";
  const host = url.hostname.toLowerCase();
  const official = OFFICIAL_SOURCES.some((source) => source.domain === host);
  if (!official) return "off_allowlist";
  if (BLOCKED_PATH.test(`${url.pathname}${url.search}`)) return "blocked_path";
  return "allowed";
}

type Rule = { allow: boolean; path: string };

export function robotsDecision(robotsText: string, targetPath: string, agent = RESEARCH_AGENT): { allowed: boolean; crawlDelaySeconds: number } {
  const groups = robotsText.split(/\n(?=user-agent:)/i);
  const specific = groups.filter((group) => group.toLowerCase().includes(`user-agent: ${agent.toLowerCase()}`));
  const star = groups.filter((group) => /user-agent:\s*\*/i.test(group));
  const chosen = specific.length > 0 ? specific : star;
  const rules: Rule[] = [];
  let crawlDelaySeconds = 0;
  for (const group of chosen) {
    for (const line of group.split("\n")) {
      const delay = line.match(/^\s*crawl-delay:\s*(\d+)/i);
      if (delay) crawlDelaySeconds = Math.max(crawlDelaySeconds, Number(delay[1]));
      const match = line.match(/^\s*(allow|disallow):\s*(.*)$/i);
      if (!match) continue;
      const path = (match[2] ?? "").trim();
      if (!path) continue;
      rules.push({ allow: match[1].toLowerCase() === "allow", path });
    }
  }
  const path = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  const matching = rules.filter((rule) => rule.path === "" || path.startsWith(rule.path));
  if (matching.length === 0) return { allowed: true, crawlDelaySeconds };
  const longest = matching.reduce((best, rule) => (rule.path.length > best.path.length ? rule : best));
  const tied = matching.filter((rule) => rule.path.length === longest.path.length);
  const allowed = tied.some((rule) => rule.allow);
  return { allowed, crawlDelaySeconds };
}

export function allowFetch(recentTimestamps: number[], now: number, limit = 10, windowMs = 60_000): boolean {
  const fresh = recentTimestamps.filter((stamp) => now - stamp < windowMs);
  recentTimestamps.length = 0;
  recentTimestamps.push(...fresh);
  if (fresh.length >= limit) return false;
  recentTimestamps.push(now);
  return true;
}
