import type { DocumentKind, RuleVersion, Scheme, SchemeId, StudyLevel } from "./types.ts";

const POST: StudyLevel[] = ["class11", "class12", "ug", "pg"];
const PAPERS: DocumentKind[] = ["casteCertificate", "incomeCertificate", "marksheet", "admissionProof"];

const NOTIFIED = new Set(["iit-delhi"]);

export function isNotified(institutionId: string): boolean {
  return NOTIFIED.has(institutionId);
}

export const RULES: Record<SchemeId, RuleVersion> = {
  preMatric: {
    schemeId: "preMatric",
    version: "DEMO-PRE-2026.1",
    ceilingInr: 250000,
    levels: ["class9", "class10"],
    requiresNotified: false,
    requiresOverseasGoal: false,
    requiresResearchQualification: false,
    exclusive: true,
    requiredDocs: PAPERS,
    processing: "full",
    sourceUrl: "https://tribal.nic.in/ScholarshiP.aspx",
  },
  postMatric: {
    schemeId: "postMatric",
    version: "DEMO-PMS-2026.1",
    ceilingInr: 250000,
    levels: POST,
    requiresNotified: false,
    requiresOverseasGoal: false,
    requiresResearchQualification: false,
    exclusive: true,
    requiredDocs: PAPERS,
    processing: "full",
    sourceUrl: "https://tribal.nic.in/ScholarshiP.aspx",
  },
  topClass: {
    schemeId: "topClass",
    version: "DEMO-TOP-2026.1",
    ceilingInr: 600000,
    levels: ["ug", "pg"],
    requiresNotified: true,
    requiresOverseasGoal: false,
    requiresResearchQualification: false,
    exclusive: true,
    requiredDocs: [...PAPERS, "instituteCertificate"],
    processing: "full",
    sourceUrl: "https://tribal.nic.in/ScholarshiP.aspx",
  },
  nfst: {
    schemeId: "nfst",
    version: "DEMO-NFST-2026.1",
    ceilingInr: null,
    levels: ["research"],
    requiresNotified: false,
    requiresOverseasGoal: false,
    requiresResearchQualification: true,
    exclusive: true,
    requiredDocs: ["casteCertificate", "marksheet", "researchQualification"],
    processing: "infoOnly",
    sourceUrl: "https://fellowship.tribal.gov.in/",
  },
  nos: {
    schemeId: "nos",
    version: "DEMO-NOS-2026.1",
    ceilingInr: 600000,
    levels: ["overseasMasters", "overseasPhd"],
    requiresNotified: false,
    requiresOverseasGoal: true,
    requiresResearchQualification: false,
    exclusive: true,
    requiredDocs: ["casteCertificate", "incomeCertificate", "passport", "overseasOffer"],
    processing: "readiness",
    sourceUrl: "https://overseas.tribal.gov.in/",
  },
};

export const SCHEMES: Scheme[] = (Object.keys(RULES) as SchemeId[]).map((id) => ({
  id,
  processing: RULES[id].processing,
}));

export function ruleFor(schemeId: SchemeId): RuleVersion {
  return RULES[schemeId];
}

const SLUG: Record<SchemeId, string> = {
  preMatric: "pre-matric",
  postMatric: "post-matric",
  topClass: "top-class",
  nfst: "nfst",
  nos: "nos",
};

export function schemeSlug(schemeId: SchemeId): string {
  return SLUG[schemeId];
}

export function schemeFromSlug(slug: string): SchemeId | null {
  const found = (Object.keys(SLUG) as SchemeId[]).find((id) => SLUG[id] === slug);
  return found ?? null;
}

export const SCHEME_PORTAL: Record<SchemeId, string> = {
  preMatric: "https://dbttribal.gov.in/",
  postMatric: "https://dbttribal.gov.in/",
  topClass: "https://scholarships.gov.in/",
  nfst: "https://fellowship.tribal.gov.in/",
  nos: "https://overseas.tribal.gov.in/",
};
