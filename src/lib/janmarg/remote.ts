import type { RegisterRow } from "./coverage.ts";
import type { AppData, SchemeId } from "./types.ts";

export const SUPABASE_URL = "https://ftszmxzdwqlgtrgridng.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c3pteHpkd3FsZ3RyZ3JpZG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2OTMzNjUsImV4cCI6MjEwNjI2OTM2NX0.YhBaa04VM66eZEEUgseANgBuhs9RJpP1hM8tGduhp1M";

export type RemoteStatus = "checking" | "live" | "local";

export type DisbursementRow = {
  id: string;
  student_id: string;
  scheme_id: SchemeId;
  academic_year: string;
  amount_inr: number;
  dbt_status: "credited" | "sanctioned" | "pending";
  utr_masked: string;
  credited_on: string | null;
};

let status: RemoteStatus = "checking";
const listeners = new Set<() => void>();

function setStatus(next: RemoteStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

export function getRemoteStatus(): RemoteStatus {
  return status;
}

export function subscribeRemoteStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function headers(extra?: Record<string, string>): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const data = value as AppData;
  return Boolean(data.profiles && data.documents && Array.isArray(data.applications));
}

export function mergeRemoteDomain(local: AppData, remote: AppData): AppData {
  return {
    ...remote,
    lang: local.lang,
    langChosen: local.langChosen,
    personaId: local.personaId,
    otpVerified: local.otpVerified,
    consentAccepted: local.consentAccepted,
    role: local.role,
    connection: local.connection,
  };
}

export type SchemeRouteRow = {
  scheme_id: SchemeId;
  portal_name: string;
  portal_url: string;
  data_class: string;
};

export async function loadCoverage(): Promise<RegisterRow[] | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/coverage_register?select=token,district,state,class_band,apaar,otr,scholarship&order=token.asc`,
      { headers: headers() },
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as {
      token: string;
      district: string;
      state: string;
      class_band: string;
      apaar: boolean;
      otr: boolean;
      scholarship: boolean;
    }[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((row) => ({
      token: row.token,
      district: row.district,
      state: row.state,
      classBand: row.class_band,
      apaar: row.apaar,
      otr: row.otr,
      scholarship: row.scholarship,
    }));
  } catch {
    return null;
  }
}

export async function loadOfficialExtracts(schemeId: string): Promise<{ quote: string; source_url: string }[] | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/official_extracts?scheme_id=eq.${encodeURIComponent(schemeId)}&select=quote,source_url&order=fetched_at.desc`,
      { headers: headers() },
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as { quote: string; source_url: string }[];
    return Array.isArray(rows) && rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

export async function loadSchemeRoutes(): Promise<SchemeRouteRow[] | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/scheme_routes?select=scheme_id,portal_name,portal_url,data_class&order=scheme_id.asc`,
      { headers: headers() },
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as SchemeRouteRow[];
    return Array.isArray(rows) && rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

export async function loadLiveState(): Promise<AppData | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/demo_state?id=eq.live&select=payload`,
      { headers: headers() },
    );
    if (!response.ok) {
      setStatus("local");
      return null;
    }
    const rows = (await response.json()) as { payload?: unknown }[];
    const payload = rows[0]?.payload;
    if (!isAppData(payload)) {
      setStatus("local");
      return null;
    }
    setStatus("live");
    return payload;
  } catch {
    setStatus("local");
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

export function scheduleSave(data: AppData) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveLiveState(data);
  }, 700);
}

export async function saveLiveState(data: AppData): Promise<void> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/demo_state`, {
      method: "POST",
      headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify({ id: "live", payload: data, updated_at: new Date().toISOString() }),
    });
    setStatus(response.ok ? "live" : "local");
  } catch {
    setStatus("local");
  }
}

export async function loadDisbursements(studentId: string): Promise<DisbursementRow[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/demo_disbursements?student_id=eq.${encodeURIComponent(studentId)}&select=id,student_id,scheme_id,academic_year,amount_inr,dbt_status,utr_masked,credited_on&order=academic_year.desc`,
      { headers: headers() },
    );
    if (!response.ok) return [];
    const rows = (await response.json()) as DisbursementRow[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}
