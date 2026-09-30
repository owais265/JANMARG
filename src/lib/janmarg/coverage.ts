export type RegisterRow = {
  token: string;
  district: string;
  state: string;
  classBand: string;
  apaar: boolean;
  otr: boolean;
  scholarship: boolean;
};

export type GapReason = "no_apaar" | "no_otr" | "no_scholarship";

export type Unreached = RegisterRow & { reason: GapReason };

/** Synthetic school rows. Tokens only. Not live UDISE+, APAAR, or NSP. */
export const SEED_REGISTER: RegisterRow[] = [
  { token: "UDISE-DEMO-101", district: "Jashpur", state: "Chhattisgarh", classBand: "Class 10", apaar: true, otr: true, scholarship: false },
  { token: "UDISE-DEMO-102", district: "Jashpur", state: "Chhattisgarh", classBand: "Class 9", apaar: false, otr: false, scholarship: false },
  { token: "UDISE-DEMO-103", district: "Dantewada", state: "Chhattisgarh", classBand: "Class 11", apaar: true, otr: false, scholarship: false },
  { token: "UDISE-DEMO-104", district: "Dantewada", state: "Chhattisgarh", classBand: "Class 10", apaar: true, otr: true, scholarship: true },
  { token: "UDISE-DEMO-105", district: "Khunti", state: "Jharkhand", classBand: "Class 12", apaar: true, otr: true, scholarship: false },
  { token: "UDISE-DEMO-106", district: "Khunti", state: "Jharkhand", classBand: "Undergraduate", apaar: false, otr: true, scholarship: false },
  { token: "UDISE-DEMO-107", district: "Bastar", state: "Chhattisgarh", classBand: "Class 9", apaar: true, otr: true, scholarship: false },
  { token: "UDISE-DEMO-108", district: "Dungarpur", state: "Rajasthan", classBand: "Class 10", apaar: true, otr: false, scholarship: true },
];

export function unreached(rows: RegisterRow[]): Unreached[] {
  return rows
    .filter((row) => !row.scholarship)
    .map((row) => ({
      ...row,
      reason: !row.apaar ? "no_apaar" : !row.otr ? "no_otr" : "no_scholarship",
    }));
}

export function districtGaps(rows: RegisterRow[]): { district: string; state: string; enrolled: number; registered: number; gap: number }[] {
  const map = new Map<string, { district: string; state: string; enrolled: number; registered: number }>();
  for (const row of rows) {
    const key = `${row.district}|${row.state}`;
    const current = map.get(key) ?? { district: row.district, state: row.state, enrolled: 0, registered: 0 };
    current.enrolled += 1;
    if (row.scholarship) current.registered += 1;
    map.set(key, current);
  }
  return [...map.values()].map((item) => ({ ...item, gap: item.enrolled - item.registered }));
}
