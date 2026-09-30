import type { AppData, OutreachSignal } from "./types.ts";

/** Illustrative figures only. Not ministry statistics and not live UDISE+ or APAAR. */
export const ILLUSTRATIVE_FUNNEL = [
  { key: "off.funnel.seen", value: 10000 },
  { key: "off.funnel.matched", value: 4200 },
  { key: "off.funnel.submitted", value: 2600 },
  { key: "off.funnel.pending", value: 980 },
] as const;

export const ILLUSTRATIVE_COVERAGE = [
  { district: "Jashpur", state: "Chhattisgarh", covered: 62 },
  { district: "Bastar", state: "Chhattisgarh", covered: 55 },
  { district: "Dantewada", state: "Chhattisgarh", covered: 41 },
  { district: "Raigarh", state: "Chhattisgarh", covered: 70 },
  { district: "Dungarpur", state: "Rajasthan", covered: 58 },
] as const;

export const OUTREACH: OutreachSignal[] = [
  {
    id: "out-jashpur",
    district: "Jashpur",
    state: "Chhattisgarh",
    enrolledEstimate: 240,
    withApaar: 200,
    withOtr: 170,
    registeredEstimate: 150,
    gap: 90,
  },
  {
    id: "out-dantewada",
    district: "Dantewada",
    state: "Chhattisgarh",
    enrolledEstimate: 180,
    withApaar: 120,
    withOtr: 90,
    registeredEstimate: 70,
    gap: 110,
  },
  {
    id: "out-khunti",
    district: "Khunti",
    state: "Jharkhand",
    enrolledEstimate: 210,
    withApaar: 160,
    withOtr: 140,
    registeredEstimate: 120,
    gap: 90,
  },
];

export function seedRollup(data: AppData): {
  expired: number;
  mismatches: number;
  drafts: number;
  openReviews: number;
} {
  let expired = 0;
  let mismatches = 0;
  for (const list of Object.values(data.documents)) {
    for (const item of list) {
      if (item.status === "expired") expired += 1;
      if (item.status === "mismatch") mismatches += 1;
    }
  }
  return {
    expired,
    mismatches,
    drafts: data.drafts.length,
    openReviews: data.mismatchCases.filter((item) => item.status === "inReview").length,
  };
}

const PRIVATE_NAME = /Asha|Birsa|Meera|Dev Kumar|Nila|Kerketta|Hembram|Oraon|Munda|Kachhap|Pahadi|Gond/;

export function containsStudentName(value: unknown): boolean {
  return PRIVATE_NAME.test(JSON.stringify(value));
}
