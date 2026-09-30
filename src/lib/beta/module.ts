import { SCHEMES, type SchemeCode } from "./content";
import type { LockerDoc, LockerFile, PortalRow } from "./locker";

export const JOURNEY = ["prepare", "verify", "sanction", "pay"] as const;
export type Journey = (typeof JOURNEY)[number];

const BY_LABEL: Record<string, SchemeCode> = {
  "Pre-Matric": "pre-matric",
  "Post-Matric": "post-matric",
  "Top Class": "top-class",
  NFST: "nfst",
  NOS: "nos",
};

export type SchemeTrack = {
  code: SchemeCode;
  journey: Journey;
  held: boolean;
  note: string;
  portals: PortalRow[];
};

function codeOf(portal: PortalRow): SchemeCode | null {
  return BY_LABEL[portal.scheme] ?? null;
}

export function isSchemeCode(value: string): value is SchemeCode {
  return SCHEMES.some((scheme) => scheme.code === value);
}

export function tracksFor(locker: LockerFile | null): SchemeTrack[] {
  return SCHEMES.map((scheme) => {
    const portals = locker?.portals.filter((portal) => codeOf(portal) === scheme.code) ?? [];
    const live = portals.filter((portal) => portal.status !== "none");
    if (!live.length) {
      return { code: scheme.code, journey: "prepare", held: false, note: "", portals };
    }
    const blocked = live.find((portal) => portal.status === "action");
    if (blocked) {
      return { code: scheme.code, journey: "verify", held: true, note: blocked.detail, portals };
    }
    const sanction = live.find((portal) => /sanction|institute verification/i.test(portal.detail));
    if (sanction) {
      return { code: scheme.code, journey: "sanction", held: false, note: sanction.detail, portals };
    }
    const pay = live.find((portal) => portal.id === "sfmp");
    if (pay) {
      return { code: scheme.code, journey: "pay", held: false, note: pay.detail, portals };
    }
    const watching = live.find((portal) => portal.status === "watching") ?? live[0];
    return { code: scheme.code, journey: "verify", held: false, note: watching?.detail ?? "", portals };
  });
}

export type PayTone = "held" | "waiting" | "empty" | "clear";

export type PayRow = {
  code: SchemeCode;
  tone: PayTone;
  note: string;
};

export function paymentsFor(locker: LockerFile | null): PayRow[] {
  return tracksFor(locker).map((track) => {
    const sfmp = track.portals.find((portal) => portal.id === "sfmp");
    const dbt = track.portals.find((portal) => portal.id === "dbt");
    if (track.held) return { code: track.code, tone: "held", note: track.note };
    if (sfmp && sfmp.status === "watching") return { code: track.code, tone: "waiting", note: sfmp.detail };
    if (dbt && dbt.status === "watching") return { code: track.code, tone: "waiting", note: dbt.detail };
    if (dbt && dbt.status === "clear" && (!sfmp || sfmp.status === "none")) {
      return { code: track.code, tone: "clear", note: sfmp?.detail || dbt.detail };
    }
    if (!sfmp || sfmp.status === "none") return { code: track.code, tone: "empty", note: sfmp?.detail ?? "" };
    return { code: track.code, tone: "waiting", note: sfmp.detail };
  });
}

export type AlertItem = {
  id: string;
  tone: "action" | "info";
  titleKey: string;
  body: string;
  to: "/applications/$applicationId" | "/documents/$documentId" | "/checklist" | "/connect";
  idParam?: string;
};

export function alertsFor(locker: LockerFile | null): AlertItem[] {
  const items: AlertItem[] = [];
  if (!locker) return items;
  for (const track of tracksFor(locker)) {
    if (!track.held) continue;
    items.push({
      id: `hold-${track.code}`,
      tone: "action",
      titleKey: "mod.alertFix",
      body: track.note,
      to: "/applications/$applicationId",
      idParam: track.code,
    });
  }
  for (const doc of locker.documents) {
    if (doc.status !== "expired" && doc.status !== "mismatch") continue;
    items.push({
      id: `doc-${doc.kind}`,
      tone: "action",
      titleKey: "mod.alertDoc",
      body: "",
      to: "/documents/$documentId",
      idParam: doc.kind,
    });
  }
  return items;
}

export function reuseOf(doc: LockerDoc): "ready" | "fix" {
  return doc.status === "verified" ? "ready" : "fix";
}

export function journeyIndex(journey: Journey) {
  return JOURNEY.indexOf(journey);
}
