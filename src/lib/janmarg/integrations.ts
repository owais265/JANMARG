import { isNotified } from "./rules.ts";
import type { ConnectionMode, DocumentRecord, ScholarshipApplication, StudentProfile } from "./types.ts";

export const CONNECTORS = ["nsp", "sfmp", "nfst", "nos", "digilocker", "apaar", "udise", "aishe", "dbt"] as const;

export type ConnectorId = (typeof CONNECTORS)[number];
export type ConnectorMode = "mock" | "official";
export type GatewayError = "consentDenied" | "timeout" | "unavailable" | "notConfigured";

export type NormalizedPayload = {
  externalSystem: string;
  externalId: string;
  status: string;
  detail: string;
  review: boolean;
  auth: "mock-session" | "not-configured";
};

export type GatewayCall = {
  connector: ConnectorId;
  mode: ConnectorMode;
  attempts: number;
  ok: boolean;
  error?: GatewayError;
  payload?: NormalizedPayload;
  at: string;
};

export type GatewayContext = {
  profile: StudentProfile;
  documents: DocumentRecord[];
  applications: ScholarshipApplication[];
  consent: boolean;
  connection: ConnectionMode;
  at: string;
  implementation?: ConnectorMode;
};

export type HealthRow = {
  connector: ConnectorId;
  mode: ConnectorMode;
  at: string;
  tone: "healthy" | "match" | "mismatch" | "connected" | "consent" | "down" | "reserved";
  status: string;
  detail: string;
};

function doc(documents: DocumentRecord[], kind: DocumentRecord["kind"]) {
  return documents.find((item) => item.kind === kind);
}

function payload(
  externalSystem: string,
  externalId: string,
  status: string,
  detail: string,
  review: boolean,
): NormalizedPayload {
  return { externalSystem, externalId, status, detail, review, auth: "mock-session" };
}

function transport(connector: ConnectorId, attempt: number, at: string): GatewayCall {
  return {
    connector,
    mode: "mock",
    attempts: attempt,
    ok: false,
    error: attempt < 2 ? "timeout" : "unavailable",
    at,
  };
}

function mockCall(connector: ConnectorId, ctx: GatewayContext, attempt: number): GatewayCall {
  if (ctx.connection !== "online") return transport(connector, attempt, ctx.at);
  const { profile, documents } = ctx;
  const mark = doc(documents, "marksheet");
  const income = doc(documents, "incomeCertificate");
  const school = profile.studyLevel.startsWith("class");
  const ref = profile.id.toUpperCase();

  if (connector === "nsp") {
    if (income?.status === "expired") {
      return ok(connector, ctx.at, payload("NSP", `NSP-DEMO-2026-${ref}`, "DEFECTIVE", "Income certificate expired", false));
    }
    if (mark?.status === "mismatch") {
      return ok(connector, ctx.at, payload("NSP", `NSP-DEMO-2026-${ref}`, "RETURNED_FOR_REVIEW", "Name does not match", true));
    }
    if (profile.goal === "overseas") {
      return ok(connector, ctx.at, payload("NSP", `NSP-DEMO-2026-${ref}`, "NOT_ON_THIS_PORTAL", "Overseas file is read on the NOS connector", false));
    }
    return ok(connector, ctx.at, payload("NSP", `NSP-DEMO-2026-${ref}`, "INSTITUTE_VERIFICATION", "No deficiency on the mock NSP file", false));
  }

  if (connector === "sfmp") {
    return ok(
      connector,
      ctx.at,
      payload("CANARA_SFMP", `SFMP-DEMO-${ref}`, "INSTITUTE_VERIFICATION", "Payment status NOT_INITIATED. No transfer is sent.", false),
    );
  }

  if (connector === "nfst") {
    const research = profile.studyLevel === "research" || profile.goal === "research";
    return ok(
      connector,
      ctx.at,
      payload("NFST", `NFST-DEMO-${ref}`, research ? "NOT_SUBMITTED" : "NOT_APPLICABLE", research ? "Research file is not submitted" : "Not a research file", false),
    );
  }

  if (connector === "nos") {
    if (profile.goal !== "overseas") {
      return ok(connector, ctx.at, payload("NOS", `NOS-DEMO-${ref}`, "NOT_APPLICABLE", "Not an overseas file", false));
    }
    const offer = doc(documents, "overseasOffer");
    return ok(
      connector,
      ctx.at,
      payload("NOS", `NOS-DEMO-${ref}`, offer ? "READY" : "READINESS", offer ? "Offer is on the file" : "Admission offer is still missing", false),
    );
  }

  if (connector === "digilocker") {
    const count = documents.filter((item) => item.source === "digilockerMock").length;
    return ok(connector, ctx.at, payload("DIGILOCKER", `LOCKER-DEMO-${ref}`, "CONNECTED", `${count} mock document${count === 1 ? "" : "s"} in the wallet`, false));
  }

  if (connector === "apaar") {
    const mismatch = mark?.status === "mismatch";
    return ok(
      connector,
      ctx.at,
      payload("APAAR", `APAAR-DEMO-${ref}`, mismatch ? "MISMATCH" : "MATCH", mismatch ? "Academic name does not match" : "Academic identity matches the file", mismatch),
    );
  }

  if (connector === "udise") {
    if (!school) {
      return ok(connector, ctx.at, payload("UDISE", `UDISE-DEMO-${ref}`, "NOT_A_SCHOOL_RECORD", "Higher education is checked on the AISHE connector", false));
    }
    const mismatch = mark?.status === "mismatch";
    return ok(
      connector,
      ctx.at,
      payload("UDISE", `UDISE-DEMO-${profile.institutionId}`, mismatch ? "MISMATCH" : "ENROLLED", mismatch ? "Enrolment name does not match" : "School enrolment is on the mock record", mismatch),
    );
  }

  if (connector === "aishe") {
    if (school) {
      return ok(connector, ctx.at, payload("AISHE", `AISHE-DEMO-${profile.institutionId}`, "NOT_APPLICABLE", "School records stay on the UDISE connector", false));
    }
    const listed = isNotified(profile.institutionId);
    return ok(
      connector,
      ctx.at,
      payload("AISHE", `AISHE-DEMO-${profile.institutionId}`, listed ? "RECOGNISED" : "NOT_IN_SAMPLE", listed ? "Institute is in the demo sample" : "Not in the small demo sample of institutes", false),
    );
  }

  return ok(
    connector,
    ctx.at,
    payload("DBT_PFMS", `PFMS-DEMO-${ref}`, "NOT_INITIATED", "Stages are sanction, PFMS processing, bank validation, then payment. This file has not started. No money is moved.", false),
  );
}

function ok(connector: ConnectorId, at: string, body: NormalizedPayload): GatewayCall {
  return { connector, mode: "mock", attempts: 1, ok: true, payload: body, at };
}

function officialCall(connector: ConnectorId, at: string): GatewayCall {
  return { connector, mode: "official", attempts: 1, ok: false, error: "notConfigured", at };
}

function invoke(connector: ConnectorId, ctx: GatewayContext): GatewayCall {
  const mode = ctx.implementation ?? "mock";
  if (!ctx.consent) {
    return { connector, mode, attempts: 1, ok: false, error: "consentDenied", at: ctx.at };
  }
  if (mode === "official") return officialCall(connector, ctx.at);
  let last = mockCall(connector, ctx, 1);
  if (last.ok || (last.error !== "timeout" && last.error !== "unavailable")) return last;
  last = mockCall(connector, ctx, 2);
  return { ...last, attempts: 2 };
}

export function runGateway(ctx: GatewayContext, connectors: readonly ConnectorId[] = CONNECTORS): GatewayCall[] {
  return connectors.map((connector) => invoke(connector, ctx));
}

export function healthOf(call: GatewayCall): HealthRow["tone"] {
  if (call.error === "consentDenied") return "consent";
  if (call.error === "notConfigured") return "reserved";
  if (!call.ok) return "down";
  if (call.payload?.review) return "mismatch";
  if (call.connector === "digilocker") return "connected";
  if (call.payload?.status === "MATCH" || call.payload?.status === "ENROLLED" || call.payload?.status === "RECOGNISED") return "match";
  return "healthy";
}

export function healthRows(ctx: GatewayContext): HealthRow[] {
  return runGateway(ctx).map((call) => ({
    connector: call.connector,
    mode: call.mode,
    at: call.at,
    tone: healthOf(call),
    status: call.payload?.status ?? "",
    detail: call.payload?.detail ?? call.error ?? "",
  }));
}
