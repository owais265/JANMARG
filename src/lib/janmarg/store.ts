import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppData, ConnectionMode, Lang, SchemeId } from "./types.ts";
import { createWorld } from "./seed.ts";
import {
  reduceAcceptConsent,
  reduceAlignName,
  reduceAsk,
  reduceExchange,
  reduceHelp,
  reduceNotePapers,
  reduceImportLocker,
  reduceMarkRead,
  reducePoll,
  reduceRenewIncome,
  reduceRequestReview,
  reduceRevokeLocker,
  reduceSaveDraft,
  reduceSubmit,
  reduceVerifyOtp,
  resetWorld,
} from "./reduce.ts";
import { scheduleAccountSync, mergeFile } from "./account.ts";
import type { AccountFile } from "./account.ts";
import type { DocumentRecord, StudentProfile } from "./types.ts";

type Store = {
  ready: boolean;
  data: AppData;
  setReady: (ready: boolean) => void;
  setLang: (lang: Lang) => void;
  chooseLang: (lang: Lang) => void;
  verifyOtp: (personaId: string, code: string) => "success" | "invalidOtp" | "reserved";
  acceptConsent: () => void;
  declineConsent: () => void;
  leave: () => void;
  setRole: (role: AppData["role"]) => void;
  setConnection: (connection: ConnectionMode) => void;
  renewIncome: () => void;
  alignName: () => void;
  requestReview: () => void;
  importLocker: (granted: boolean) => string;
  revokeLocker: () => void;
  saveDraft: (draft: AppData["drafts"][number]) => void;
  submit: (input: {
    schemeId: SchemeId;
    selectedDocIds: string[];
    instituteConfirmed: boolean;
  }) => { ok: boolean; code?: string; applicationId?: string; review?: boolean };
  poll: (applicationId: string) => string;
  ask: (query: string) => void;
  recordExchange: (
    query: string,
    answer: { text: string | null; nextAction: string | null; citations: AppData["messages"][number]["citations"]; confident: boolean },
  ) => void;
  help: () => void;
  notePapers: () => void;
  markRead: (id: string) => void;
  reset: () => void;
  adoptAccount: (profile: StudentProfile, file: AccountFile) => void;
  openPractice: (personaId: string) => void;
  addDocument: (document: DocumentRecord) => void;
  updateProfile: (profile: StudentProfile) => void;
};

function nowStamp(): string {
  return new Date().toISOString();
}

const memory = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useJanmarg = create<Store>()(
  persist(
    (set, get) => ({
      ready: false,
      data: createWorld(),
      setReady: (ready) => set({ ready }),
      setLang: (lang) => set({ data: { ...get().data, lang } }),
      chooseLang: (lang) => set({ data: { ...get().data, lang, langChosen: true } }),
      verifyOtp: (personaId, code) => {
        const result = reduceVerifyOtp(get().data, personaId, code);
        set({ data: result.data });
        return result.outcome;
      },
      acceptConsent: () => set({ data: reduceAcceptConsent(get().data, nowStamp()) }),
      declineConsent: () => set({ data: { ...get().data, consentAccepted: false } }),
      leave: () =>
        set({
          data: {
            ...get().data,
            personaId: null,
            otpVerified: false,
            consentAccepted: false,
            role: "student",
          },
        }),
      setRole: (role) => set({ data: { ...get().data, role } }),
      setConnection: (connection) => set({ data: { ...get().data, connection } }),
      renewIncome: () => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceRenewIncome(get().data, id, nowStamp()) });
      },
      alignName: () => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceAlignName(get().data, id, nowStamp()) });
      },
      requestReview: () => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceRequestReview(get().data, id, nowStamp()) });
      },
      importLocker: (granted) => {
        const id = get().data.personaId;
        if (!id) return "missing";
        const result = reduceImportLocker(get().data, id, granted, nowStamp());
        set({ data: result.data });
        return result.outcome;
      },
      revokeLocker: () => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceRevokeLocker(get().data, id, nowStamp()) });
      },
      saveDraft: (draft) => set({ data: reduceSaveDraft(get().data, draft) }),
      submit: (input) => {
        const id = get().data.personaId;
        if (!id) return { ok: false, code: "missing" };
        const result = reduceSubmit(get().data, { personaId: id, at: nowStamp(), ...input });
        set({ data: result.data });
        if (result.outcome === "success") return { ok: true, applicationId: result.application.id, review: result.review };
        return { ok: false, code: result.outcome };
      },
      poll: (applicationId) => {
        const result = reducePoll(get().data, applicationId, nowStamp());
        set({ data: result.data });
        return result.outcome;
      },
      ask: (query) => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceAsk(get().data, id, query, nowStamp()) });
      },
      recordExchange: (query, answer) => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceExchange(get().data, id, query, answer, nowStamp()) });
      },
      help: () => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceHelp(get().data, id, nowStamp()) });
      },
      notePapers: () => {
        const id = get().data.personaId;
        if (!id) return;
        set({ data: reduceNotePapers(get().data, id, nowStamp()) });
      },
      markRead: (id) => set({ data: reduceMarkRead(get().data, id) }),
      reset: () => set({ data: resetWorld(get().data.lang) }),
      adoptAccount: (profile, file) => {
        const base = mergeAccount(get().data, profile.id, file);
        set({
          data: {
            ...base,
            personaId: profile.id,
            otpVerified: true,
            consentAccepted: true,
            langChosen: true,
            profiles: { ...base.profiles, [profile.id]: profile },
          },
        });
      },
      openPractice: (personaId) => {
        const profile = get().data.profiles[personaId];
        if (!profile) return;
        set({
          data: {
            ...get().data,
            personaId,
            otpVerified: true,
            consentAccepted: true,
            langChosen: true,
          },
        });
      },
      addDocument: (document) => {
        const id = get().data.personaId;
        if (!id) return;
        const current = get().data.documents[id] ?? [];
        set({
          data: {
            ...get().data,
            documents: { ...get().data.documents, [id]: [document, ...current.filter((item) => item.id !== document.id)] },
          },
        });
      },
      updateProfile: (profile) => {
        set({ data: { ...get().data, profiles: { ...get().data.profiles, [profile.id]: profile } } });
      },
    }),
    {
      name: "janmarg-demo-v1",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memory : localStorage)),
      partialize: (state) => ({ data: state.data }),
    },
  ),
);

function mergeAccount(data: AppData, userId: string, file: AccountFile) {
  return mergeFile(data, userId, file);
}

useJanmarg.subscribe((state, prev) => {
  if (!state.ready || state.data === prev.data) return;
  scheduleAccountSync(state.data);
});
