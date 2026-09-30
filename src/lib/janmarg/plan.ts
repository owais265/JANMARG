import { assessEligibility } from "./eligibility.ts";
import { isNotified } from "./rules.ts";
import type { ActionId, AppData, EligibilityStatus, SchemeId, StudentProfile } from "./types.ts";

export function focusScheme(profile: StudentProfile): SchemeId {
  if (profile.goal === "overseas") return "nos";
  if (profile.goal === "research" || profile.studyLevel === "research") return "nfst";
  if (
    (profile.studyLevel === "ug" || profile.studyLevel === "pg") &&
    isNotified(profile.institutionId)
  ) {
    return "topClass";
  }
  if (profile.studyLevel === "class9" || profile.studyLevel === "class10") return "preMatric";
  return "postMatric";
}

const BLOCKING: ActionId[] = [
  "renewIncome",
  "fixName",
  "addOffer",
  "addPassport",
  "manualReview",
  "retry",
];

export function primaryAction(data: AppData, personaId: string): {
  schemeId: SchemeId;
  action: ActionId;
  status: EligibilityStatus;
  applicationId?: string;
} {
  const profile = data.profiles[personaId];
  const schemeId = focusScheme(profile);
  const documents = data.documents[personaId] ?? [];
  const assessment = assessEligibility({
    schemeId,
    profile,
    documents,
    connection: data.connection,
  });
  const application = data.applications.find(
    (item) => item.personaId === personaId && item.schemeId === schemeId && item.status !== "draft",
  );
  if (application) {
    return {
      schemeId,
      action: "viewJourney",
      status: assessment.status,
      applicationId: application.id,
    };
  }
  const draft = data.drafts.find((item) => item.personaId === personaId && item.schemeId === schemeId);
  if (draft && data.connection !== "sourceUnavailable") {
    return { schemeId, action: "resumeDraft", status: assessment.status };
  }
  const action = assessment.nextActions[0] ?? "seeWhy";
  return { schemeId, action, status: assessment.status };
}

export function isBlocking(action: ActionId): boolean {
  return BLOCKING.includes(action);
}
