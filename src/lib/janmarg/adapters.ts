import { DEMO_OTP } from "./clock.ts";
import type {
  ConnectionMode,
  DataMode,
  DocumentRecord,
  StudentProfile,
  VerificationCheck,
} from "./types.ts";

export type AdapterResult<T> =
  | { outcome: "success"; data: T }
  | { outcome: "invalidOtp" }
  | { outcome: "expired" }
  | { outcome: "mismatch"; field: string; left: string; right: string }
  | { outcome: "consentDenied" }
  | { outcome: "sourceUnavailable" }
  | { outcome: "delayed" }
  | { outcome: "validationFailure"; code: string }
  | { outcome: "reserved" };

function gate(mode: DataMode): AdapterResult<never> | null {
  if (mode === "productionAdapterReserved") return { outcome: "reserved" };
  return null;
}

export function sendOtp(mode: DataMode = "demoMock"): AdapterResult<{ delivery: "onScreen" }> {
  return gate(mode) ?? { outcome: "success", data: { delivery: "onScreen" } };
}

export function verifyOtp(code: string, mode: DataMode = "demoMock"): AdapterResult<{ session: "demo" }> {
  const blocked = gate(mode);
  if (blocked) return blocked;
  if (code.trim() === DEMO_OTP) return { outcome: "success", data: { session: "demo" } };
  return { outcome: "invalidOtp" };
}

export function startConsent(
  granted: boolean,
  mode: DataMode = "demoMock",
): AdapterResult<{ granted: boolean }> {
  const blocked = gate(mode);
  if (blocked) return blocked;
  if (!granted) return { outcome: "consentDenied" };
  return { outcome: "success", data: { granted: true } };
}

export function listDocuments(
  catalog: DocumentRecord[],
  connection: ConnectionMode,
  mode: DataMode = "demoMock",
): AdapterResult<DocumentRecord[]> {
  const blocked = gate(mode);
  if (blocked) return blocked;
  if (connection !== "online") return { outcome: "sourceUnavailable" };
  return { outcome: "success", data: catalog };
}

export function importDocument(
  catalog: DocumentRecord[],
  granted: boolean,
  connection: ConnectionMode,
  mode: DataMode = "demoMock",
): AdapterResult<DocumentRecord[]> {
  const consent = startConsent(granted, mode);
  if (consent.outcome !== "success") return consent;
  return listDocuments(catalog, connection, mode);
}

export function revokeConsent(mode: DataMode = "demoMock"): AdapterResult<{ revoked: true }> {
  const blocked = gate(mode);
  if (blocked) return blocked;
  return { outcome: "success", data: { revoked: true } };
}

export function getStudentRecord(
  profile: StudentProfile,
  marksheet: DocumentRecord | undefined,
  connection: ConnectionMode,
  mode: DataMode = "demoMock",
): AdapterResult<{ registryName: string }> {
  const blocked = gate(mode);
  if (blocked) return blocked;
  if (connection !== "online" || !marksheet?.extractedName) return { outcome: "sourceUnavailable" };
  if (marksheet.extractedName.trim() !== profile.legalName.trim()) {
    return {
      outcome: "mismatch",
      field: "legalName",
      left: profile.legalName,
      right: marksheet.extractedName,
    };
  }
  return { outcome: "success", data: { registryName: marksheet.extractedName } };
}

export function sourceHealth(connection: ConnectionMode): VerificationCheck[] {
  const status = connection === "online" ? "available" : "unavailable";
  return [
    { id: "identity", source: "identity", status },
    { id: "digilocker", source: "digilocker", status },
    { id: "academic", source: "academic", status },
    { id: "portal", source: "portal", status },
  ];
}

export type LayerOutcome = "matched" | "mismatch" | "notFound" | "sourceUnavailable" | "notApplicable";
export type LayerRoute = "reuse" | "manualReview" | "studentAction" | "skip";

export type LayerCheck = {
  id: string;
  outcome: LayerOutcome;
  route: LayerRoute;
};

function docOf(documents: DocumentRecord[], kind: DocumentRecord["kind"]) {
  return documents.find((item) => item.kind === kind);
}

function fromDocument(
  id: string,
  record: DocumentRecord | undefined,
  connection: ConnectionMode,
): LayerCheck {
  if (connection !== "online") return { id, outcome: "sourceUnavailable", route: "studentAction" };
  if (!record) return { id, outcome: "notFound", route: "studentAction" };
  if (record.status === "mismatch") return { id, outcome: "mismatch", route: "manualReview" };
  if (record.status === "expired" || record.status === "pending" || record.status === "unavailable") {
    return { id, outcome: "notFound", route: "studentAction" };
  }
  return { id, outcome: "matched", route: "reuse" };
}

/** One desk call. Each row names a mock source. Nothing here is a live government pull. */
export function runVerificationLayer(
  profile: StudentProfile,
  documents: DocumentRecord[],
  connection: ConnectionMode,
): LayerCheck[] {
  const marksheet = docOf(documents, "marksheet");
  const identityRecord = getStudentRecord(profile, marksheet, connection);
  const identity: LayerCheck =
    identityRecord.outcome === "success"
      ? { id: "identity", outcome: "matched", route: "reuse" }
      : identityRecord.outcome === "mismatch"
        ? { id: "identity", outcome: "mismatch", route: "manualReview" }
        : { id: "identity", outcome: "sourceUnavailable", route: "studentAction" };

  const school = profile.studyLevel.startsWith("class");
  const institution: LayerCheck =
    connection !== "online"
      ? { id: "institution", outcome: "sourceUnavailable", route: "studentAction" }
      : profile.institutionName
        ? { id: "institution", outcome: "matched", route: "reuse" }
        : { id: "institution", outcome: "notFound", route: "studentAction" };

  const research = profile.studyLevel === "research" || profile.goal === "research";
  const net: LayerCheck = !research
    ? { id: "net", outcome: "notApplicable", route: "skip" }
    : fromDocument("net", docOf(documents, "researchQualification"), connection);

  const domicile: LayerCheck =
    connection !== "online"
      ? { id: "domicile", outcome: "sourceUnavailable", route: "studentAction" }
      : profile.state
        ? { id: "domicile", outcome: "matched", route: "reuse" }
        : { id: "domicile", outcome: "notFound", route: "studentAction" };

  return [
    identity,
    fromDocument("st", docOf(documents, "casteCertificate"), connection),
    { id: "pvtg", outcome: "notApplicable", route: "skip" },
    fromDocument("academic", marksheet, connection),
    { ...institution, id: school ? "institutionSchool" : "institutionHigher" },
    net,
    { id: "disability", outcome: "notApplicable", route: "skip" },
    fromDocument("income", docOf(documents, "incomeCertificate"), connection),
    domicile,
  ];
}

export function pollPortal(
  delayChecks: number,
  connection: ConnectionMode,
  mode: DataMode = "demoMock",
): AdapterResult<{ advance: boolean }> {
  const blocked = gate(mode);
  if (blocked) return blocked;
  if (connection !== "online") return { outcome: "sourceUnavailable" };
  if (delayChecks <= 0) return { outcome: "delayed" };
  return { outcome: "success", data: { advance: true } };
}
