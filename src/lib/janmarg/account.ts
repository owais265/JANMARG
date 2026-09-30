import { useSyncExternalStore } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./remote.ts";
import type {
  AppData,
  ApplicationEvent,
  AuditEvent,
  ChatMessage,
  DocumentRecord,
  MismatchCase,
  NotificationItem,
  ScholarshipApplication,
  StudentProfile,
  StudyLevel,
  WizardDraft,
} from "./types.ts";

export type AccountSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  email: string;
  guest?: boolean;
};

export type AccountFile = {
  documents: DocumentRecord[];
  applications: ScholarshipApplication[];
  events: ApplicationEvent[];
  notifications: NotificationItem[];
  drafts: WizardDraft[];
  messages: ChatMessage[];
  mismatchCases: MismatchCase[];
  audits: AuditEvent[];
};

export type AccountRow = {
  user_id: string;
  email: string;
  legal_name: string | null;
  birth_year: number | null;
  st_status: StudentProfile["stStatus"] | null;
  state_name: string | null;
  district: string | null;
  study_level: StudyLevel | null;
  institution_name: string | null;
  course_name: string | null;
  family_income_inr: number | null;
  goal: StudentProfile["goal"] | null;
  mobile_masked: string | null;
  other_scholarship: boolean;
  notify_alerts: boolean;
  notify_status: boolean;
  profile_complete: boolean;
  file: AccountFile;
};

type Gate = {
  ready: boolean;
  session: AccountSession | null;
  account: AccountRow | null;
};

const STORAGE_KEY = "janmarg-account-v1";
const emptyFile = (): AccountFile => ({
  documents: [],
  applications: [],
  events: [],
  notifications: [],
  drafts: [],
  messages: [],
  mismatchCases: [],
  audits: [],
});

let gate: Gate = { ready: false, session: null, account: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setGate(next: Partial<Gate>) {
  gate = { ...gate, ...next };
  emit();
}

export function useAccountGate(): Gate {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => gate,
    () => gate,
  );
}

export function currentUserId(): string | null {
  return gate.session?.userId ?? null;
}

function authHeaders(token?: string, extra?: Record<string, string>): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function readStored(): AccountSession | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AccountSession;
    if (!parsed.accessToken || !parsed.userId || !parsed.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(session: AccountSession | null) {
  if (typeof localStorage === "undefined") return;
  if (!session) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function sessionFrom(payload: Record<string, unknown>): AccountSession | null {
  const nested = payload.session as Record<string, unknown> | undefined;
  const source = nested ?? payload;
  const access = source.access_token;
  const refresh = source.refresh_token;
  const user = (source.user ?? payload.user) as { id?: string; email?: string } | undefined;
  if (typeof access !== "string" || typeof refresh !== "string" || !user?.id || !user.email) return null;
  const expiresAt =
    typeof source.expires_at === "number"
      ? source.expires_at
      : Math.floor(Date.now() / 1000) + (typeof source.expires_in === "number" ? source.expires_in : 3600);
  return { accessToken: access, refreshToken: refresh, expiresAt, userId: user.id, email: user.email };
}

async function authPost(path: string, body: unknown, token?: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message = String(payload.msg || payload.error_description || payload.message || "Sign-in failed");
    throw new Error(message);
  }
  return payload;
}

export function enterGuest(): AccountSession {
  const session: AccountSession = {
    accessToken: "",
    refreshToken: "",
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    userId: "guest",
    email: "guest",
    guest: true,
  };
  writeStored(session);
  setGate({ ready: true, session, account: null });
  return session;
}

export function isGuestSession(session: AccountSession | null | undefined): boolean {
  return Boolean(session?.guest || session?.userId === "guest");
}

export async function signUp(email: string, password: string): Promise<AccountSession> {
  const payload = await authPost("/auth/v1/signup", { email, password });
  const session = sessionFrom(payload);
  if (!session) throw new Error("Account created, but the session was not returned. Try signing in.");
  writeStored(session);
  setGate({ session, account: null });
  return session;
}

export async function signIn(email: string, password: string): Promise<AccountSession> {
  const payload = await authPost("/auth/v1/token?grant_type=password", { email, password });
  const session = sessionFrom(payload);
  if (!session) throw new Error("Sign-in did not return a session.");
  writeStored(session);
  const account = await loadAccount(session);
  setGate({ session, account });
  return session;
}

async function refresh(session: AccountSession): Promise<AccountSession | null> {
  try {
    const payload = await authPost("/auth/v1/token?grant_type=refresh_token", { refresh_token: session.refreshToken });
    const next = sessionFrom(payload);
    if (!next) return null;
    writeStored(next);
    return next;
  } catch {
    return null;
  }
}

export async function freshSession(): Promise<AccountSession | null> {
  const session = gate.session ?? readStored();
  if (!session) return null;
  if (isGuestSession(session)) return session;
  if (session.expiresAt * 1000 > Date.now() + 30_000) return session;
  return refresh(session);
}

export async function signOutAccount(): Promise<void> {
  const session = gate.session;
  if (session && !isGuestSession(session) && session.accessToken) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: authHeaders(session.accessToken),
    }).catch(() => undefined);
  }
  writeStored(null);
  setGate({ session: null, account: null, ready: true });
}

function asFile(value: unknown): AccountFile {
  const file = (value ?? {}) as Partial<AccountFile>;
  return {
    documents: file.documents ?? [],
    applications: file.applications ?? [],
    events: file.events ?? [],
    notifications: file.notifications ?? [],
    drafts: file.drafts ?? [],
    messages: file.messages ?? [],
    mismatchCases: file.mismatchCases ?? [],
    audits: file.audits ?? [],
  };
}

function asAccount(row: Record<string, unknown>, email: string): AccountRow {
  return {
    user_id: String(row.user_id),
    email: String(row.email ?? email),
    legal_name: (row.legal_name as string | null) ?? null,
    birth_year: (row.birth_year as number | null) ?? null,
    st_status: (row.st_status as AccountRow["st_status"]) ?? null,
    state_name: (row.state_name as string | null) ?? null,
    district: (row.district as string | null) ?? null,
    study_level: (row.study_level as StudyLevel | null) ?? null,
    institution_name: (row.institution_name as string | null) ?? null,
    course_name: (row.course_name as string | null) ?? null,
    family_income_inr: (row.family_income_inr as number | null) ?? null,
    goal: (row.goal as AccountRow["goal"]) ?? null,
    mobile_masked: (row.mobile_masked as string | null) ?? null,
    other_scholarship: Boolean(row.other_scholarship),
    notify_alerts: row.notify_alerts !== false,
    notify_status: row.notify_status !== false,
    profile_complete: Boolean(row.profile_complete),
    file: asFile(row.file),
  };
}

export async function loadAccount(session: AccountSession): Promise<AccountRow | null> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/accounts?user_id=eq.${session.userId}&select=*`,
    { headers: authHeaders(session.accessToken) },
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as Record<string, unknown>[];
  if (!rows[0]) return null;
  return asAccount(rows[0], session.email);
}

export async function saveAccount(patch: Partial<AccountRow> & { user_id: string; email: string }): Promise<AccountRow> {
  const session = await freshSession();
  if (!session || isGuestSession(session) || !session.accessToken) {
    throw new Error("Sign in to save this account on the server.");
  }
  if (session.userId !== patch.user_id) throw new Error("Sign in again to save this profile.");
  const response = await fetch(`${SUPABASE_URL}/rest/v1/accounts`, {
    method: "POST",
    headers: authHeaders(session.accessToken, { Prefer: "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || "Profile could not be saved.");
  }
  const rows = (await response.json()) as Record<string, unknown>[];
  const account = asAccount(rows[0] ?? patch, session.email);
  setGate({ session, account });
  return account;
}

export function profileFromAccount(account: AccountRow): StudentProfile {
  const at = new Date().toISOString();
  const entered = { source: "userEntered" as const, at };
  return {
    id: account.user_id,
    legalName: account.legal_name || "Student",
    nameProvenance: entered,
    birthYear: account.birth_year || 2006,
    birthYearProvenance: entered,
    stStatus: account.st_status || "unknown",
    stProvenance: entered,
    state: account.state_name || "",
    district: account.district || "",
    placeProvenance: entered,
    studyLevel: account.study_level || "ug",
    studyProvenance: entered,
    institutionId: "self-reported",
    institutionName: account.institution_name || "",
    institutionProvenance: entered,
    courseName: account.course_name || "",
    familyIncomeInr: account.family_income_inr || 0,
    incomeProvenance: entered,
    otherCentralScholarship: account.other_scholarship,
    goal: account.goal || "domestic",
    mobileMasked: account.mobile_masked || "••••",
  };
}

export function sliceFile(data: AppData, userId: string): AccountFile {
  return {
    documents: data.documents[userId] ?? [],
    applications: data.applications.filter((item) => item.personaId === userId),
    events: data.events.filter((item) => data.applications.some((app) => app.id === item.applicationId && app.personaId === userId)),
    notifications: data.notifications.filter((item) => item.personaId === userId),
    drafts: data.drafts.filter((item) => item.personaId === userId),
    messages: data.messages.filter((item) => item.personaId === userId),
    mismatchCases: data.mismatchCases.filter((item) => item.personaId === userId),
    audits: data.audits.filter((item) => item.personaId === userId),
  };
}

export function mergeFile(data: AppData, userId: string, file: AccountFile): AppData {
  const keepApp = (id: string) => data.applications.some((item) => item.id === id && item.personaId !== userId);
  return {
    ...data,
    documents: { ...data.documents, [userId]: file.documents },
    applications: [...data.applications.filter((item) => item.personaId !== userId), ...file.applications],
    events: [...data.events.filter((item) => keepApp(item.applicationId)), ...file.events],
    notifications: [...data.notifications.filter((item) => item.personaId !== userId), ...file.notifications],
    drafts: [...data.drafts.filter((item) => item.personaId !== userId), ...file.drafts],
    messages: [...data.messages.filter((item) => item.personaId !== userId), ...file.messages],
    mismatchCases: [...data.mismatchCases.filter((item) => item.personaId !== userId), ...file.mismatchCases],
    audits: [...data.audits.filter((item) => item.personaId !== userId), ...file.audits],
  };
}

let syncTimer: ReturnType<typeof setTimeout> | undefined;

export function scheduleAccountSync(data: AppData) {
  const session = gate.session;
  const account = gate.account;
  if (!session || isGuestSession(session) || !session.accessToken || !account?.profile_complete || data.personaId !== session.userId) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const file = sliceFile(data, session.userId);
    void saveAccount({ ...account, file, email: session.email, user_id: session.userId }).catch(() => undefined);
  }, 800);
}

export async function restoreAccount(): Promise<void> {
  const stored = readStored();
  if (stored && isGuestSession(stored)) {
    setGate({ ready: true, session: stored, account: null });
    return;
  }
  let session = stored;
  if (session && session.expiresAt * 1000 < Date.now() + 30_000) session = await refresh(session);
  if (!session || isGuestSession(session)) {
    writeStored(null);
    setGate({ ready: true, session: null, account: null });
    return;
  }
  const account = await loadAccount(session);
  setGate({ ready: true, session, account });
}

export { emptyFile };
