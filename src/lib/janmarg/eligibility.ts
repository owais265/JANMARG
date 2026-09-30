import { DEMO_TODAY, isExpired } from "./clock.ts";
import { classifyName } from "./names.ts";
import { isNotified, ruleFor } from "./rules.ts";
import type {
  ActionId,
  ConnectionMode,
  DocumentKind,
  DocumentRecord,
  EligibilityAssessment,
  EligibilityReason,
  SchemeId,
  StudentProfile,
} from "./types.ts";

function docOf(documents: DocumentRecord[], kind: DocumentKind): DocumentRecord | undefined {
  return documents.find((item) => item.kind === kind);
}

export function assessEligibility(input: {
  schemeId: SchemeId;
  profile: StudentProfile;
  documents: DocumentRecord[];
  connection: ConnectionMode;
  asOf?: string;
}): EligibilityAssessment {
  const asOf = input.asOf ?? DEMO_TODAY;
  const rule = ruleFor(input.schemeId);
  const base = {
    schemeId: input.schemeId,
    policyVersion: rule.version,
    disclaimerKey: "elig.disclaimer",
    asOf,
  };

  if (input.connection === "sourceUnavailable") {
    return {
      ...base,
      status: "unavailable",
      matched: [],
      unmet: [
        {
          code: "reason.source.down",
          severity: "source",
          passed: false,
          whyKey: "why.source",
        },
      ],
      missingDocuments: [],
      nextActions: ["retry"],
    };
  }

  const matched: EligibilityReason[] = [];
  const unmet: EligibilityReason[] = [];
  const pass = (reason: EligibilityReason) => matched.push({ ...reason, passed: true });
  const fail = (reason: EligibilityReason) => unmet.push({ ...reason, passed: false });

  if (input.profile.stStatus === "st") {
    pass({ code: "reason.community.ok", severity: "hard", passed: true });
  } else if (input.profile.stStatus === "unknown") {
    fail({
      code: "reason.community.unknown",
      severity: "evidence",
      passed: false,
      whyKey: "why.community",
    });
  } else {
    fail({
      code: "reason.community.no",
      severity: "hard",
      passed: false,
      whyKey: "why.community",
    });
  }

  const levelOk = rule.levels.includes(input.profile.studyLevel);
  if (levelOk) {
    pass({
      code: "reason.level.ok",
      severity: "hard",
      passed: true,
      vars: { level: input.profile.studyLevel },
    });
  } else {
    fail({
      code: "reason.level.no",
      severity: "hard",
      passed: false,
      whyKey: "why.level",
      vars: { level: input.profile.studyLevel },
    });
  }

  if (rule.ceilingInr != null) {
    const ceiling = String(rule.ceilingInr);
    if (input.profile.familyIncomeInr <= rule.ceilingInr) {
      pass({
        code: "reason.income.ok",
        severity: "hard",
        passed: true,
        vars: { ceiling },
      });
    } else {
      fail({
        code: "reason.income.no",
        severity: "hard",
        passed: false,
        whyKey: "why.income",
        vars: { ceiling },
      });
    }
  }

  if (rule.requiresNotified) {
    if (isNotified(input.profile.institutionId)) {
      pass({ code: "reason.institute.ok", severity: "hard", passed: true });
    } else {
      fail({
        code: "reason.institute.no",
        severity: "hard",
        passed: false,
        whyKey: "why.institute",
      });
    }
  }

  if (rule.requiresOverseasGoal) {
    if (input.profile.goal === "overseas") {
      pass({ code: "reason.goal.ok", severity: "hard", passed: true });
    } else {
      fail({
        code: "reason.goal.no",
        severity: "hard",
        passed: false,
        whyKey: "why.goal",
      });
    }
  }

  if (rule.exclusive) {
    if (input.profile.otherCentralScholarship) {
      fail({
        code: "reason.exclusive.no",
        severity: "hard",
        passed: false,
        whyKey: "why.exclusive",
      });
    } else {
      pass({ code: "reason.exclusive.ok", severity: "hard", passed: true });
    }
  }

  const missingDocuments: DocumentKind[] = [];

  for (const kind of rule.requiredDocs) {
    const record = docOf(input.documents, kind);
    const vars = { doc: kind };
    if (!record) {
      missingDocuments.push(kind);
      fail({
        code: "reason.doc.missing",
        severity: "evidence",
        passed: false,
        whyKey:
        kind === "overseasOffer"
          ? "why.offer"
          : kind === "passport"
            ? "why.passport"
            : kind === "researchQualification"
              ? "why.qualification"
              : "why.missing",
        vars,
      });
      continue;
    }
    if (record.consent === "revoked") {
      fail({
        code: "reason.doc.revoked",
        severity: "evidence",
        passed: false,
        whyKey: "why.revoked",
        vars,
      });
      continue;
    }
    if (record.status === "expired" || isExpired(record.expiry, asOf)) {
      missingDocuments.push(kind);
      fail({
        code: "reason.doc.expired",
        severity: "evidence",
        passed: false,
        whyKey: "why.expired",
        vars,
      });
      continue;
    }
    if (record.status === "pending" || record.status === "unavailable") {
      missingDocuments.push(kind);
      fail({
        code: "reason.doc.pending",
        severity: "evidence",
        passed: false,
        whyKey: "why.missing",
        vars,
      });
      continue;
    }
    if (kind === "marksheet" && record.extractedName) {
      const nameClass = classifyName(input.profile.legalName, record.extractedName);
      if (nameClass === "manual" || record.status === "mismatch") {
        if (nameClass === "manual") {
          fail({
            code: "reason.doc.mismatch",
            severity: "evidence",
            passed: false,
            whyKey: "why.mismatch",
            vars,
          });
          continue;
        }
      }
    } else if (record.status === "mismatch") {
      fail({
        code: "reason.doc.mismatch",
        severity: "evidence",
        passed: false,
        whyKey: "why.mismatch",
        vars,
      });
      continue;
    }
    pass({ code: "reason.doc.ok", severity: "evidence", passed: true, vars });
  }

  let status: EligibilityAssessment["status"] = "likelyEligible";
  if (unmet.some((item) => item.severity === "hard")) status = "notMatched";
  else if (unmet.some((item) => item.severity === "evidence")) status = "needsEvidence";

  const nextActions: ActionId[] = [];
  if (unmet.some((item) => item.code === "reason.doc.expired" && item.vars?.doc === "incomeCertificate")) {
    nextActions.push("renewIncome");
  }
  if (unmet.some((item) => item.code === "reason.doc.mismatch")) nextActions.push("fixName");
  if (unmet.some((item) => item.code === "reason.doc.missing" && item.vars?.doc === "overseasOffer")) {
    nextActions.push("addOffer");
  }
  if (unmet.some((item) => item.code === "reason.doc.missing" && item.vars?.doc === "passport")) {
    nextActions.push("addPassport");
  }
  if (status === "needsEvidence" && nextActions.length === 0) nextActions.push("seeWhy");
  if (status === "notMatched") nextActions.push("seeWhy");
  if (status === "likelyEligible" && rule.processing === "full") nextActions.push("openWizard");
  if (rule.processing === "readiness" && (status === "likelyEligible" || status === "needsEvidence")) {
    nextActions.push("readiness");
  }
  if (rule.processing === "infoOnly") nextActions.push("infoOnly");

  return {
    ...base,
    status,
    matched,
    unmet,
    missingDocuments,
    nextActions,
  };
}

export function checkProgress(assessment: EligibilityAssessment): { done: number; total: number } {
  const total = assessment.matched.length + assessment.unmet.length;
  return { done: assessment.matched.length, total };
}
