import { importDocument, pollPortal, revokeConsent, verifyOtp } from "./adapters.ts";
import { assessEligibility } from "./eligibility.ts";
import { answerQuestion } from "./knowledge.ts";
import { ruleFor, schemeSlug } from "./rules.ts";
import { createWorld, lockerCatalog } from "./seed.ts";
import type {
  AppData,
  ApplicationEvent,
  ApplicationStatus,
  ChatMessage,
  DocumentRecord,
  SchemeId,
  ScholarshipApplication,
} from "./types.ts";

function nid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function audit(data: AppData, personaId: string, actionKey: string, at: string): AppData {
  return {
    ...data,
    audits: [{ id: nid("audit"), personaId, at, actionKey }, ...data.audits],
  };
}

export function reduceVerifyOtp(data: AppData, personaId: string, code: string): {
  data: AppData;
  outcome: "success" | "invalidOtp" | "reserved";
} {
  const result = verifyOtp(code);
  if (result.outcome === "reserved") return { data, outcome: "reserved" };
  if (result.outcome !== "success") return { data, outcome: "invalidOtp" };
  return { data: { ...data, personaId, otpVerified: true }, outcome: "success" };
}

export function reduceAcceptConsent(data: AppData, at: string): AppData {
  if (!data.personaId) return data;
  const next = {
    ...data,
    consentAccepted: true,
    consents: [
      {
        id: nid("consent"),
        personaId: data.personaId,
        purposeKey: "consent.session",
        granted: true,
        at,
        version: "consent-demo-1" as const,
      },
      ...data.consents,
    ],
  };
  return audit(next, data.personaId, "audit.consent", at);
}

export function reduceRenewIncome(data: AppData, personaId: string, at: string): AppData {
  const documents = (data.documents[personaId] ?? []).map((item) =>
    item.kind === "incomeCertificate"
      ? {
          ...item,
          status: "verified" as const,
          expiry: "2027-03-31",
          source: "userUpload" as const,
          origin: "userEntered" as const,
          consent: "granted" as const,
        }
      : item,
  );
  return audit({ ...data, documents: { ...data.documents, [personaId]: documents } }, personaId, "audit.renewIncome", at);
}

export function reduceAlignName(data: AppData, personaId: string, at: string): AppData {
  const profile = data.profiles[personaId];
  const documents = data.documents[personaId] ?? [];
  const marksheet = documents.find((item) => item.kind === "marksheet" && item.extractedName);
  if (!profile || !marksheet?.extractedName) return data;
  const nextProfile = {
    ...profile,
    legalName: marksheet.extractedName,
    nameProvenance: { source: "userEntered" as const, at },
  };
  const nextDocs = documents.map((item) =>
    item.kind === "marksheet" ? { ...item, status: "verified" as const } : item,
  );
  const next: AppData = {
    ...data,
    profiles: { ...data.profiles, [personaId]: nextProfile },
    documents: { ...data.documents, [personaId]: nextDocs },
    mismatchCases: data.mismatchCases.map((item) =>
      item.personaId === personaId ? { ...item, status: "aligned" as const, at } : item,
    ),
  };
  return audit(next, personaId, "audit.alignName", at);
}

export function reduceRequestReview(data: AppData, personaId: string, at: string): AppData {
  const open = data.mismatchCases.some((item) => item.personaId === personaId && item.status === "inReview");
  const mismatchCases = open
    ? data.mismatchCases
    : [
        { id: nid("case"), personaId, field: "legalName" as const, status: "inReview" as const, at },
        ...data.mismatchCases,
      ];
  return audit({ ...data, mismatchCases }, personaId, "audit.manualReview", at);
}

export function reduceImportLocker(
  data: AppData,
  personaId: string,
  granted: boolean,
  at: string,
): { data: AppData; outcome: string } {
  const existing = new Set((data.documents[personaId] ?? []).map((item) => item.id));
  const catalog = lockerCatalog(personaId).filter((item) => !existing.has(item.id));
  const result = importDocument(catalog, granted, data.connection);
  if (result.outcome !== "success") return { data, outcome: result.outcome };
  const documents = [...(data.documents[personaId] ?? []), ...result.data];
  const next = audit(
    { ...data, documents: { ...data.documents, [personaId]: documents } },
    personaId,
    "audit.import",
    at,
  );
  return { data: next, outcome: result.data.length === 0 ? "empty" : "success" };
}

export function reduceRevokeLocker(data: AppData, personaId: string, at: string): AppData {
  const result = revokeConsent();
  if (result.outcome !== "success") return data;
  const documents = (data.documents[personaId] ?? []).map((item) =>
    item.source === "digilockerMock" ? { ...item, consent: "revoked" as const } : item,
  );
  const next: AppData = {
    ...data,
    documents: { ...data.documents, [personaId]: documents },
    consents: [
      {
        id: nid("consent"),
        personaId,
        purposeKey: "consent.revokeDigilocker",
        granted: false,
        at,
        version: "consent-demo-1",
      },
      ...data.consents,
    ],
  };
  return audit(next, personaId, "audit.revoke", at);
}

export function reduceSaveDraft(
  data: AppData,
  draft: AppData["drafts"][number],
): AppData {
  const drafts = [
    draft,
    ...data.drafts.filter((item) => !(item.personaId === draft.personaId && item.schemeId === draft.schemeId)),
  ];
  return audit({ ...data, drafts }, draft.personaId, "audit.draftSaved", draft.updatedAt);
}

export type SubmitCode =
  | "offline"
  | "sourceUnavailable"
  | "schemeClosed"
  | "readinessOnly"
  | "alreadySubmitted"
  | "exclusive"
  | "instituteUnconfirmed"
  | "expiredDoc"
  | "mismatch"
  | "missingDoc"
  | "consent"
  | "notReady";

export function validateSubmission(input: {
  data: AppData;
  personaId: string;
  schemeId: SchemeId;
  selectedDocIds: string[];
  instituteConfirmed: boolean;
}): { ok: true; review: boolean } | { ok: false; code: SubmitCode } {
  const { data, personaId, schemeId, selectedDocIds, instituteConfirmed } = input;
  if (data.connection === "offline") return { ok: false, code: "offline" };
  if (data.connection === "sourceUnavailable") return { ok: false, code: "sourceUnavailable" };
  const rule = ruleFor(schemeId);
  if (rule.processing === "infoOnly") return { ok: false, code: "schemeClosed" };
  if (rule.processing === "readiness") return { ok: false, code: "readinessOnly" };
  const existing = data.applications.find(
    (item) => item.personaId === personaId && item.schemeId === schemeId && item.status !== "draft",
  );
  if (existing) return { ok: false, code: "alreadySubmitted" };
  const profile = data.profiles[personaId];
  const otherOpen = data.applications.find(
    (item) => item.personaId === personaId && item.schemeId !== schemeId && item.status !== "draft",
  );
  if (otherOpen || profile.otherCentralScholarship) return { ok: false, code: "exclusive" };
  const documents = data.documents[personaId] ?? [];
  const assessment = assessEligibility({
    schemeId,
    profile,
    documents,
    connection: "online",
  });
  if (assessment.unmet.some((item) => item.code === "reason.doc.expired")) {
    return { ok: false, code: "expiredDoc" };
  }
  const hard = assessment.unmet.filter((item) => item.code !== "reason.doc.mismatch");
  if (assessment.status === "unavailable" || (assessment.status !== "likelyEligible" && hard.length > 0)) {
    return { ok: false, code: "notReady" };
  }
  const review = assessment.unmet.some((item) => item.code === "reason.doc.mismatch");
  if (!instituteConfirmed) return { ok: false, code: "instituteUnconfirmed" };
  const selected = documents.filter((item) => selectedDocIds.includes(item.id));
  for (const kind of rule.requiredDocs) {
    const record = selected.find((item) => item.kind === kind);
    if (!record) return { ok: false, code: "missingDoc" };
    if (record.consent !== "granted") return { ok: false, code: "consent" };
  }
  return { ok: true, review };
}

const RECEIPT_CODE: Record<SchemeId, string> = {
  preMatric: "PR",
  postMatric: "PM",
  topClass: "TC",
  nfst: "NF",
  nos: "OS",
};

export function mockReceipt(schemeId: SchemeId, serial: number): string {
  return `JM-${RECEIPT_CODE[schemeId]}-2026-${String(10000 + serial)}`;
}

export function reduceSubmit(
  data: AppData,
  input: {
    personaId: string;
    schemeId: SchemeId;
    selectedDocIds: string[];
    instituteConfirmed: boolean;
    at: string;
  },
): { data: AppData; outcome: "success"; application: ScholarshipApplication; review: boolean } | { data: AppData; outcome: SubmitCode } {
  const check = validateSubmission({ data, ...input });
  if (!check.ok) return { data, outcome: check.code };
  const application: ScholarshipApplication = {
    id: nid("app"),
    personaId: input.personaId,
    schemeId: input.schemeId,
    status: "submitted",
    receiptId: mockReceipt(input.schemeId, data.applications.length + 1),
    createdAt: input.at,
    updatedAt: input.at,
    owner: "institute",
    delayChecks: 0,
    returnReasonKey: null,
  };
  const submitted: ApplicationEvent = {
    id: nid("evt"),
    applicationId: application.id,
    at: input.at,
    status: "submitted",
    owner: "student",
    titleKey: "event.submitted.title",
    bodyKey: "event.submitted.body",
  };
  const waiting: ApplicationEvent = {
    id: nid("evt"),
    applicationId: application.id,
    at: input.at,
    status: "submitted",
    owner: "institute",
    titleKey: "event.delayed.title",
    bodyKey: "event.delayed.body",
  };
  const next: AppData = {
    ...data,
    applications: [application, ...data.applications],
    events: [waiting, submitted, ...data.events],
    drafts: data.drafts.filter(
      (item) => !(item.personaId === input.personaId && item.schemeId === input.schemeId),
    ),
    notifications: [
      {
        id: nid("note"),
        personaId: input.personaId,
        tone: "normal",
        titleKey: "note.receipt.title",
        bodyKey: "note.receipt.body",
        href: `/journey/${application.id}`,
        read: false,
        at: input.at,
      },
      ...data.notifications,
    ],
  };
  const withReview = check.review ? reduceRequestReview(next, input.personaId, input.at) : next;
  const audited = audit(withReview, input.personaId, check.review ? "audit.reviewSubmit" : "audit.submit", input.at);
  return { data: audited, outcome: "success", application, review: check.review };
}

const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  submitted: "instituteVerification",
  instituteVerification: "stateVerification",
  stateVerification: "ministryReview",
};

export function reducePoll(data: AppData, applicationId: string, at: string): {
  data: AppData;
  outcome: "delayed" | "advanced" | "sourceUnavailable" | "missing";
} {
  const application = data.applications.find((item) => item.id === applicationId);
  if (!application) return { data, outcome: "missing" };
  const polled = pollPortal(application.delayChecks, data.connection);
  if (polled.outcome === "sourceUnavailable") return { data, outcome: "sourceUnavailable" };
  if (polled.outcome === "delayed") {
    const applications = data.applications.map((item) =>
      item.id === applicationId ? { ...item, delayChecks: item.delayChecks + 1, updatedAt: at } : item,
    );
    return { data: { ...data, applications }, outcome: "delayed" };
  }
  if (polled.outcome !== "success") return { data, outcome: "sourceUnavailable" };
  const next = NEXT_STATUS[application.status];
  if (!next) return { data, outcome: "delayed" };
  const applications = data.applications.map((item) =>
    item.id === applicationId
      ? {
          ...item,
          status: next,
          owner: next === "instituteVerification" ? ("institute" as const) : ("state" as const),
          delayChecks: item.delayChecks + 1,
          updatedAt: at,
        }
      : item,
  );
  const event: ApplicationEvent = {
    id: nid("evt"),
    applicationId,
    at,
    status: next,
    owner: next === "instituteVerification" ? "institute" : "state",
    titleKey: next === "instituteVerification" ? "event.institute.title" : "event.state.title",
    bodyKey: next === "instituteVerification" ? "event.institute.body" : "event.state.body",
  };
  return { data: { ...data, applications, events: [event, ...data.events] }, outcome: "advanced" };
}

export function reduceExchange(
  data: AppData,
  personaId: string,
  query: string,
  answer: { text: string | null; nextAction: string | null; citations: ChatMessage["citations"]; confident: boolean },
  at: string,
): AppData {
  const user = {
    id: nid("msg"),
    personaId,
    role: "user" as const,
    text: query,
    lang: data.lang,
    nextAction: null,
    citations: [],
    confident: true,
    at,
  };
  const jago = {
    id: nid("msg"),
    personaId,
    role: "jago" as const,
    text: answer.text ?? "",
    lang: data.lang,
    nextAction: answer.nextAction,
    citations: answer.citations,
    confident: answer.confident,
    at,
  };
  return { ...data, messages: [...data.messages, user, jago] };
}

export function reduceAsk(data: AppData, personaId: string, query: string, at: string): AppData {
  const answer = answerQuestion(query, data.lang);
  const user = {
    id: nid("msg"),
    personaId,
    role: "user" as const,
    text: query,
    lang: data.lang,
    nextAction: null,
    citations: [],
    confident: true,
    at,
  };
  const jago = {
    id: nid("msg"),
    personaId,
    role: "jago" as const,
    text: answer.text ?? "",
    lang: data.lang,
    nextAction: answer.nextAction,
    citations: answer.citations,
    confident: answer.confident,
    at,
  };
  return { ...data, messages: [...data.messages, user, jago] };
}

export function reduceNotePapers(data: AppData, personaId: string, at: string): AppData {
  if (data.audits.some((item) => item.personaId === personaId && item.actionKey === "audit.viewDocs")) return data;
  return audit(data, personaId, "audit.viewDocs", at);
}

export function reduceHelp(data: AppData, personaId: string, at: string): AppData {
  const next: AppData = {
    ...data,
    helpRequests: [{ id: nid("help"), personaId, at }, ...data.helpRequests],
    notifications: [
      {
        id: nid("note"),
        personaId,
        tone: "normal",
        titleKey: "note.help.title",
        bodyKey: "note.help.body",
        href: "/jago",
        read: false,
        at,
      },
      ...data.notifications,
    ],
  };
  return audit(next, personaId, "audit.help", at);
}

export function reduceMarkRead(data: AppData, id: string): AppData {
  return {
    ...data,
    notifications: data.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
  };
}

export function reusableDocs(documents: DocumentRecord[], schemeId: SchemeId, asOf = "2026-09-29") {
  return documents.filter((item) => {
    if (!item.reusableFor.includes(schemeId)) return false;
    if (item.consent !== "granted") return false;
    if (item.status !== "verified") return false;
    if (item.expiry && item.expiry < asOf) return false;
    return true;
  });
}

export function journeyHref(schemeId: SchemeId): string {
  return `/schemes/${schemeSlug(schemeId)}`;
}

export function resetWorld(lang: AppData["lang"]): AppData {
  return { ...createWorld(), lang, langChosen: true };
}
