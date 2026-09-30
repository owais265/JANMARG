import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CHECKLIST, type IncomeBand, type StageId } from "./content";
import type { Lang } from "./i18n";
import { incomeFor, stageFor, type LockerFile } from "./locker";

export type BetaProfile = {
  fullName: string;
  email: string;
  state: string;
  district: string;
  educationStage: StageId | "";
  institutionType: string;
  course: string;
  incomeBand: IncomeBand;
  category: "st" | "not_st" | "prefer_not" | "";
  language: Lang;
  consentAt: string | null;
  onboarded: boolean;
};

export type CheckItem = { id: string; label: string; hint: string; checked: boolean };
export type ChatCite = { title: string; url: string; titleKey?: string };
export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  textKey?: string;
  cites: ChatCite[];
  attachment?: string;
};
export type EntryKind = "none" | "guest" | "account";

const KNOWN: Lang[] = ["en", "hi", "hinglish", "bn", "or", "te", "ta", "mr", "gu", "as", "kn", "sat"];

function asLang(value: unknown): Lang | null {
  return typeof value === "string" && KNOWN.includes(value as Lang) ? (value as Lang) : null;
}

export type ChatThread = { id: string; title: string; at: string; turns: ChatTurn[] };

type BetaState = {
  profile: BetaProfile;
  checks: Record<string, CheckItem[]>;
  saved: { id: string; schemeCode: string; title: string; notes: string; at: string }[];
  feedback: { id: string; page: string; message: string; rating: string; at: string }[];
  support: { id: string; email: string; category: string; message: string; at: string }[];
  chat: ChatTurn[];
  threads: ChatThread[];
  activeId: string;
  jagoHits: number[];
  language: Lang;
  voiceOn: boolean;
  guideSeen: boolean;
  entry: EntryKind;
  pendingStudentId: string | null;
  locker: LockerFile | null;
  seenAlerts: string[];
  setLanguage: (language: Lang) => void;
  setVoice: (voiceOn: boolean) => void;
  markGuide: () => void;
  setProfile: (patch: Partial<BetaProfile>) => void;
  grantConsent: () => void;
  finishOnboarding: (patch: Partial<BetaProfile>) => void;
  toggleCheck: (schemeCode: string, id: string) => void;
  saveGuidance: (schemeCode: string, title: string) => void;
  addFeedback: (page: string, message: string, rating: string) => void;
  addSupport: (email: string, category: string, message: string) => void;
  pushChat: (turn: ChatTurn) => void;
  replaceChat: (chat: ChatTurn[]) => void;
  clearChat: () => void;
  newChat: () => void;
  openThread: (id: string) => void;
  deleteThread: (id: string) => void;
  noteJagoHit: () => boolean;
  enterGuest: (studentId: string) => void;
  markAccount: () => void;
  applyLocker: (file: LockerFile) => void;
  seeAlert: (id: string) => void;
  seeAlerts: (ids: string[]) => void;
  wipe: () => void;
};

const emptyProfile = (): BetaProfile => ({
  fullName: "",
  email: "",
  state: "",
  district: "",
  educationStage: "",
  institutionType: "",
  course: "",
  incomeBand: "",
  category: "",
  language: "en",
  consentAt: null,
  onboarded: false,
});

function threadTitle(turns: ChatTurn[]) {
  const text = turns.find((turn) => turn.role === "user")?.text.trim();
  return (text || "JAGO").slice(0, 48);
}

function withThread(threads: ChatThread[], id: string, turns: ChatTurn[]) {
  const rest = threads.filter((item) => item.id !== id);
  if (!turns.length) return rest;
  const next: ChatThread = { id, title: threadTitle(turns), at: new Date().toISOString(), turns };
  return [next, ...rest].slice(0, 30);
}

function freshChecks(): CheckItem[] {
  return CHECKLIST.map((item) => ({ ...item, checked: false }));
}

export const useBeta = create<BetaState>()(
  persist(
    (set, get) => ({
      profile: emptyProfile(),
      checks: {},
      saved: [],
      feedback: [],
      support: [],
      chat: [],
      threads: [],
      activeId: "t-home",
      jagoHits: [],
      language: "en",
      voiceOn: false,
      guideSeen: false,
      entry: "none",
      pendingStudentId: null,
      locker: null,
      seenAlerts: [],
      setLanguage: (language) => set({ language, profile: { ...get().profile, language } }),
      setVoice: (voiceOn) => set({ voiceOn }),
      markGuide: () =>
        set({
          guideSeen: true,
          profile: {
            ...get().profile,
            onboarded: true,
            consentAt: get().profile.consentAt ?? new Date().toISOString(),
          },
        }),
      setProfile: (patch) => set({ profile: { ...get().profile, ...patch, language: patch.language ?? get().language } }),
      grantConsent: () => set({ profile: { ...get().profile, consentAt: new Date().toISOString() } }),
      finishOnboarding: (patch) =>
        set({
          profile: { ...get().profile, ...patch, language: get().language, onboarded: true },
        }),
      toggleCheck: (schemeCode, id) => {
        const current = get().checks[schemeCode] ?? freshChecks();
        const next = current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
        set({ checks: { ...get().checks, [schemeCode]: next } });
      },
      saveGuidance: (schemeCode, title) =>
        set({
          saved: [{ id: `g-${Date.now()}`, schemeCode, title, notes: "", at: new Date().toISOString() }, ...get().saved].slice(0, 20),
        }),
      addFeedback: (page, message, rating) =>
        set({ feedback: [{ id: `f-${Date.now()}`, page, message, rating, at: new Date().toISOString() }, ...get().feedback] }),
      addSupport: (email, category, message) =>
        set({ support: [{ id: `s-${Date.now()}`, email, category, message, at: new Date().toISOString() }, ...get().support] }),
      pushChat: (turn) => {
        const chat = [...get().chat, turn].slice(-40);
        const id = get().activeId || `t-${Date.now()}`;
        const threads = get().threads ?? [];
        set({ activeId: id, chat, threads: withThread(threads, id, chat) });
      },
      replaceChat: (chat) => {
        const turns = chat.slice(-40);
        const id = get().activeId || `t-${Date.now()}`;
        set({ activeId: id, chat: turns, threads: withThread(get().threads ?? [], id, turns) });
      },
      clearChat: () => {
        const id = get().activeId;
        set({ chat: [], activeId: `t-${Date.now()}`, threads: (get().threads ?? []).filter((item) => item.id !== id) });
      },
      newChat: () => {
        if (!get().chat.length) return;
        set({ chat: [], activeId: `t-${Date.now()}` });
      },
      openThread: (id) => {
        const thread = get().threads.find((item) => item.id === id);
        if (!thread) return;
        set({ activeId: id, chat: thread.turns });
      },
      deleteThread: (id) => {
        const threads = get().threads.filter((item) => item.id !== id);
        if (get().activeId !== id) {
          set({ threads });
          return;
        }
        set({ threads, chat: [], activeId: `t-${Date.now()}` });
      },
      noteJagoHit: () => {
        const now = Date.now();
        const recent = get().jagoHits.filter((stamp) => now - stamp < 10 * 60 * 1000);
        if (recent.length >= 10) {
          set({ jagoHits: recent });
          return false;
        }
        set({ jagoHits: [...recent, now] });
        return true;
      },
      enterGuest: (studentId) =>
        set({
          entry: "guest",
          pendingStudentId: studentId,
          locker: null,
          profile: {
            ...emptyProfile(),
            language: get().language,
            consentAt: new Date().toISOString(),
            onboarded: get().guideSeen,
          },
        }),
      markAccount: () =>
        set({
          entry: "account",
          profile: { ...get().profile, consentAt: get().profile.consentAt ?? new Date().toISOString() },
        }),
      applyLocker: (file) =>
        set({
          locker: file,
          pendingStudentId: file.student.id,
          profile: {
            ...get().profile,
            fullName: file.student.legal_name,
            state: file.student.state_name,
            district: file.student.district,
            educationStage: stageFor(file.student.study_level),
            institutionType: file.student.institution_name,
            course: file.student.course_name,
            incomeBand: incomeFor(file.student.family_income_inr),
            category: file.student.st_status === "st" ? "st" : get().profile.category,
            language: get().language,
            consentAt: get().profile.consentAt ?? new Date().toISOString(),
          onboarded: true,
        },
      }),
      seeAlert: (id) => {
        const seen = get().seenAlerts ?? [];
        set({ seenAlerts: seen.includes(id) ? seen : [...seen, id].slice(-80) });
      },
      seeAlerts: (ids) => {
        const next = new Set(get().seenAlerts ?? []);
        ids.forEach((id) => next.add(id));
        set({ seenAlerts: [...next].slice(-80) });
      },
      wipe: () =>
        set({
          profile: { ...emptyProfile(), language: get().language },
          checks: {},
          saved: [],
          feedback: get().feedback,
          support: get().support,
          chat: [],
          threads: [],
          activeId: "t-home",
          jagoHits: [],
          guideSeen: false,
          entry: "none",
          pendingStudentId: null,
          locker: null,
          seenAlerts: [],
        }),
    }),
    {
      name: "janmarg-public-beta",
      version: 5,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<BetaState>;
        const base = { ...current, ...saved };
        if (current.entry !== "none") {
          return {
            ...base,
            entry: current.entry,
            pendingStudentId: current.pendingStudentId,
            locker: current.locker,
            profile: current.profile,
            language: current.language,
          };
        }
        return base;
      },
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as BetaState;
        const fromProfile = asLang(state.profile?.language);
        const language = asLang(state.language) ?? fromProfile ?? "en";
        const from = typeof version === "number" ? version : 0;
        const turns = Array.isArray(state.chat) ? state.chat : [];
        let threads = Array.isArray(state.threads) ? state.threads : [];
        if (!threads.length && turns.length) {
          threads = [{ id: "t-legacy", title: threadTitle(turns), at: new Date().toISOString(), turns }];
        }
        return {
          ...state,
          language,
          entry: state.entry ?? "none",
          pendingStudentId: state.pendingStudentId ?? null,
          locker: state.locker ?? null,
          guideSeen: from < 4 ? false : (state.guideSeen ?? false),
          threads,
          activeId: state.activeId || threads[0]?.id || "t-home",
          profile: state.profile ? { ...state.profile, language } : state.profile,
        };
      },
    },
  ),
);

export function checksFor(schemeCode: string, checks: Record<string, CheckItem[]>) {
  return checks[schemeCode] ?? freshChecks();
}

export function completion(items: CheckItem[]) {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.checked).length / items.length) * 100);
}
