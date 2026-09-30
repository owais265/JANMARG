export type Lang = "en" | "hi";

export type SchemeId = "preMatric" | "postMatric" | "topClass" | "nfst" | "nos";

export type EligibilityStatus =
  | "likelyEligible"
  | "needsEvidence"
  | "notMatched"
  | "unavailable";

export type VerificationStatus =
  | "verified"
  | "mismatch"
  | "pending"
  | "unavailable"
  | "expired";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "instituteVerification"
  | "stateVerification"
  | "ministryReview"
  | "sanctioned"
  | "disbursed"
  | "returned"
  | "rejected";

export type DocumentSource = "userUpload" | "digilockerMock" | "academicRegistryMock";

export type DataMode = "demoMock" | "productionAdapterReserved";

export type ProvenanceSource =
  | "userEntered"
  | "digilockerMock"
  | "academicRegistryMock"
  | "institutionMock";

export type ConnectionMode = "online" | "offline" | "sourceUnavailable";

export type StudyLevel =
  | "class9"
  | "class10"
  | "class11"
  | "class12"
  | "ug"
  | "pg"
  | "research"
  | "overseasMasters"
  | "overseasPhd";

export type DocumentKind =
  | "casteCertificate"
  | "incomeCertificate"
  | "marksheet"
  | "admissionProof"
  | "instituteCertificate"
  | "passport"
  | "overseasOffer"
  | "researchQualification";

export type Owner = "student" | "institute" | "state" | "ministry" | "system";

export type ActionId =
  | "renewIncome"
  | "fixName"
  | "addOffer"
  | "addPassport"
  | "openWizard"
  | "resumeDraft"
  | "readiness"
  | "manualReview"
  | "retry"
  | "seeWhy"
  | "infoOnly"
  | "viewJourney";

export type ProcessingMode = "full" | "readiness" | "infoOnly";

export type Provenance = {
  source: ProvenanceSource;
  at: string;
};

export type StudentProfile = {
  id: string;
  legalName: string;
  nameProvenance: Provenance;
  birthYear: number;
  birthYearProvenance: Provenance;
  stStatus: "st" | "notSt" | "unknown";
  stProvenance: Provenance;
  state: string;
  district: string;
  placeProvenance: Provenance;
  studyLevel: StudyLevel;
  studyProvenance: Provenance;
  institutionId: string;
  institutionName: string;
  institutionProvenance: Provenance;
  courseName: string;
  familyIncomeInr: number;
  incomeProvenance: Provenance;
  otherCentralScholarship: boolean;
  goal: "domestic" | "overseas" | "research";
  mobileMasked: string;
};

export type ConsentRecord = {
  id: string;
  personaId: string;
  purposeKey: string;
  granted: boolean;
  at: string;
  version: "consent-demo-1";
};

export type Scheme = {
  id: SchemeId;
  processing: ProcessingMode;
};

export type RuleVersion = {
  schemeId: SchemeId;
  version: string;
  ceilingInr: number | null;
  levels: StudyLevel[];
  requiresNotified: boolean;
  requiresOverseasGoal: boolean;
  requiresResearchQualification: boolean;
  exclusive: boolean;
  requiredDocs: DocumentKind[];
  processing: ProcessingMode;
  sourceUrl: string;
};

export type EligibilityReason = {
  code: string;
  severity: "hard" | "evidence" | "source";
  passed: boolean;
  whyKey?: string;
  vars?: Record<string, string>;
};

export type EligibilityAssessment = {
  schemeId: SchemeId;
  status: EligibilityStatus;
  policyVersion: string;
  disclaimerKey: string;
  matched: EligibilityReason[];
  unmet: EligibilityReason[];
  missingDocuments: DocumentKind[];
  nextActions: ActionId[];
  asOf: string;
};

export type DocumentRecord = {
  id: string;
  personaId: string;
  kind: DocumentKind;
  source: DocumentSource;
  origin: ProvenanceSource;
  status: VerificationStatus;
  expiry: string | null;
  referenceMasked: string;
  consent: "granted" | "revoked" | "missing";
  reusableFor: SchemeId[];
  mapsTo: string[];
  extractedName: string | null;
};

export type VerificationCheck = {
  id: string;
  source: "identity" | "digilocker" | "academic" | "portal";
  status: "available" | "unavailable";
};

export type MismatchCase = {
  id: string;
  personaId: string;
  field: "legalName";
  status: "open" | "aligned" | "inReview";
  at: string;
};

export type ScholarshipApplication = {
  id: string;
  personaId: string;
  schemeId: SchemeId;
  status: ApplicationStatus;
  receiptId: string | null;
  createdAt: string;
  updatedAt: string;
  owner: Owner;
  delayChecks: number;
  returnReasonKey: string | null;
};

export type ApplicationEvent = {
  id: string;
  applicationId: string;
  at: string;
  status: ApplicationStatus;
  owner: Owner;
  titleKey: string;
  bodyKey: string;
};

export type NotificationItem = {
  id: string;
  personaId: string;
  tone: "high" | "normal";
  titleKey: string;
  bodyKey: string;
  href: string;
  read: boolean;
  at: string;
};

export type KnowledgeCitation = {
  id: string;
  title: string;
  source: string;
  url: string;
};

export type ChatMessage = {
  id: string;
  personaId: string;
  role: "user" | "jago";
  text: string;
  lang: Lang;
  nextAction: string | null;
  citations: KnowledgeCitation[];
  confident: boolean;
  at: string;
};

export type OutreachSignal = {
  id: string;
  district: string;
  state: string;
  enrolledEstimate: number;
  withApaar: number;
  withOtr: number;
  registeredEstimate: number;
  gap: number;
};

export type AuditEvent = {
  id: string;
  personaId: string;
  at: string;
  actionKey: string;
};

export type WizardDraft = {
  id: string;
  personaId: string;
  schemeId: SchemeId;
  step: 0 | 1 | 2 | 3;
  selectedDocIds: string[];
  instituteConfirmed: boolean;
  offlineSaved: boolean;
  updatedAt: string;
};

export type AppData = {
  lang: Lang;
  langChosen: boolean;
  personaId: string | null;
  otpVerified: boolean;
  consentAccepted: boolean;
  role: "student" | "officer";
  connection: ConnectionMode;
  profiles: Record<string, StudentProfile>;
  documents: Record<string, DocumentRecord[]>;
  applications: ScholarshipApplication[];
  events: ApplicationEvent[];
  notifications: NotificationItem[];
  mismatchCases: MismatchCase[];
  consents: ConsentRecord[];
  audits: AuditEvent[];
  messages: ChatMessage[];
  drafts: WizardDraft[];
  helpRequests: { id: string; personaId: string; at: string }[];
};
