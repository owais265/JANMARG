import { classifyName } from "./names.ts";
import { formatInr } from "./format.ts";
import { t } from "./copy.ts";
import type {
  DocumentRecord,
  EligibilityReason,
  Lang,
  MismatchCase,
  ProvenanceSource,
  StudentProfile,
} from "./types.ts";

export function reasonText(lang: Lang, reason: EligibilityReason): string {
  const vars: Record<string, string> = { ...(reason.vars ?? {}) };
  if (vars.ceiling) vars.ceiling = formatInr(Number(vars.ceiling), lang);
  if (vars.doc) vars.doc = t(lang, `doc.${vars.doc}`);
  if (vars.level) vars.level = t(lang, `level.${vars.level}`);
  return t(lang, reason.code, vars);
}

export type NameAnalysis = {
  kind: "auto" | "manual";
  left: string;
  leftSource: ProvenanceSource;
  right: string;
  rightSource: ProvenanceSource;
  others: { value: string; source: ProvenanceSource; kind: DocumentRecord["kind"] }[];
  inReview: boolean;
};

export function nameAnalysis(
  profile: StudentProfile,
  documents: DocumentRecord[],
  cases: MismatchCase[],
): NameAnalysis | null {
  const marksheet = documents.find((item) => item.kind === "marksheet" && item.extractedName);
  if (!marksheet?.extractedName) return null;
  const kind = classifyName(profile.legalName, marksheet.extractedName);
  if (kind === "match") return null;
  return {
    kind,
    left: profile.legalName,
    leftSource: profile.nameProvenance.source,
    right: marksheet.extractedName,
    rightSource: "academicRegistryMock",
    others: documents
      .filter((item) => item.extractedName && item.kind !== "marksheet")
      .map((item) => ({
        value: item.extractedName ?? "",
        source: item.origin,
        kind: item.kind,
      })),
    inReview: cases.some((item) => item.personaId === profile.id && item.status === "inReview"),
  };
}
