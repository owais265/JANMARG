import { SCHEMES, type IncomeBand, type SchemeCode, type StageId } from "./content";

export type ReadinessStatus = "good_start" | "needs_info" | "preparation" | "other_path";

export const STATUS_LABEL: Record<ReadinessStatus, string> = {
  good_start: "Good Starting Point",
  needs_info: "Needs More Information",
  preparation: "Preparation Needed",
  other_path: "Explore Another Path",
};

export type ReadinessInput = {
  stage: StageId | "";
  state: string;
  incomeBand: IncomeBand;
  category: "st" | "not_st" | "prefer_not" | "";
};

export type Readiness = {
  schemeCode: SchemeCode;
  status: ReadinessStatus;
  summary: string;
  prepare: string[];
  confirm: string[];
};

const RULE_VERSION = "beta-readiness-1";

export function ruleVersion() {
  return RULE_VERSION;
}

export function assess(input: ReadinessInput, schemeCode: SchemeCode): Readiness {
  const scheme = SCHEMES.find((item) => item.code === schemeCode)!;
  const confirm = [
    "Current eligibility, dates, and documents on the official portal",
    "Whether your course and institution are covered by the current guideline",
  ];
  if (!input.stage || !input.state) {
    return {
      schemeCode,
      status: "needs_info",
      summary: "Add your education stage and state so this preparation note can be more specific. This is still not an official result.",
      prepare: scheme.prepare,
      confirm,
    };
  }
  if (input.category === "not_st") {
    return {
      schemeCode,
      status: "other_path",
      summary: `${scheme.name} is described for Scheduled Tribe students. If that is not your category, read the official page before spending time on this checklist. JANMARG is not deciding eligibility.`,
      prepare: ["Confirm the category the official guideline requires"],
      confirm,
    };
  }
  if (input.category === "" || input.category === "prefer_not") {
    return {
      schemeCode,
      status: "needs_info",
      summary: "Category is optional here. These notes describe Scheduled Tribe scholarship information. Confirm the category rule on the official portal.",
      prepare: scheme.prepare,
      confirm,
    };
  }
  const fit = stageFit(input.stage, schemeCode);
  if (input.incomeBand === "ABOVE_5_LAKH") {
    return {
      schemeCode,
      status: "preparation",
      summary: `You asked about ${scheme.name}. Income rules change and are not decided here. Read the current guideline, then prepare only what that page lists.`,
      prepare: scheme.prepare,
      confirm,
    };
  }
  return {
    schemeCode,
    status: fit,
    summary:
      fit === "other_path"
        ? `${scheme.name} may not match the education stage you selected. Look at another scheme page, then confirm on the official portal.`
        : `Based on the details you chose, ${scheme.name} may be relevant to read. Before applying, confirm current rules on the official portal and prepare the education, category, income, and institution information that page asks for.`,
    prepare: scheme.prepare,
    confirm,
  };
}

function stageFit(stage: StageId, code: SchemeCode): ReadinessStatus {
  if (code === "pre-matric") return stage === "CLASS_9_10" ? "good_start" : "other_path";
  if (code === "post-matric") return stage === "CLASS_9_10" || stage === "OVERSEAS_APPLICANT" ? "other_path" : "good_start";
  if (code === "top-class") return stage === "UNDERGRADUATE" || stage === "POSTGRADUATE" ? "needs_info" : "other_path";
  if (code === "nfst") return stage === "RESEARCH" ? "good_start" : "other_path";
  if (code === "nos") return stage === "OVERSEAS_APPLICANT" || stage === "POSTGRADUATE" ? "needs_info" : "other_path";
  return "needs_info";
}

export function suggestSchemes(stage: StageId | ""): SchemeCode[] {
  if (stage === "CLASS_9_10") return ["pre-matric", "post-matric"];
  if (stage === "CLASS_11_12" || stage === "UNDERGRADUATE") return ["post-matric", "top-class"];
  if (stage === "POSTGRADUATE") return ["post-matric", "top-class", "nos"];
  if (stage === "RESEARCH") return ["nfst", "post-matric"];
  if (stage === "OVERSEAS_APPLICANT") return ["nos", "top-class"];
  return ["post-matric", "pre-matric", "top-class"];
}
