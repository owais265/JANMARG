import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  emptyShowcase,
  localAnswer,
  type DemoLang,
  type DemoRole,
  type DocId,
  type Scenario,
  type ShowcaseData,
} from "./showcase.ts";

type Store = ShowcaseData & {
  enter: (role: DemoRole) => void;
  setLang: (lang: DemoLang) => void;
  finishOnboarding: () => void;
  setScenario: (scenario: Scenario) => void;
  setClarification: (text: string) => void;
  submitReview: () => void;
  setConsentImport: (value: boolean) => void;
  importIncome: () => "ok" | "need-consent";
  toggleShare: (id: DocId) => void;
  markRead: (id: string) => void;
  askLocal: (question: string) => void;
  pushAssistant: (question: string, answer: ReturnType<typeof localAnswer>) => void;
  clearChat: () => void;
  setOfficerNote: (note: string) => void;
  setDraft: (draft: string) => void;
  setFutureAsk: (text: string) => void;
  resetDemo: () => void;
  leave: () => void;
};

export const useShowcase = create<Store>()(
  persist(
    (set, get) => ({
      ...emptyShowcase(),
      enter: (role) => set({ role }),
      setLang: (lang) => set({ lang }),
      finishOnboarding: () => set({ onboarded: true }),
      setScenario: (scenario) =>
        set({
          scenario,
          reviewSubmitted: false,
          imported: scenario !== "missing_income_doc",
        }),
      setClarification: (clarification) => set({ clarification }),
      submitReview: () => set({ reviewSubmitted: true }),
      setConsentImport: (consentImport) => set({ consentImport }),
      importIncome: () => {
        if (!get().consentImport) return "need-consent";
        set({ imported: true, scenario: get().scenario === "missing_income_doc" ? "name_mismatch" : get().scenario });
        return "ok";
      },
      toggleShare: (id) => set({ shares: { ...get().shares, [id]: !get().shares[id] } }),
      markRead: (id) => set({ readNotes: get().readNotes.includes(id) ? get().readNotes : [...get().readNotes, id] }),
      askLocal: (question) => {
        const answer = localAnswer(question, get());
        set({
          chat: [
            ...get().chat,
            { id: `u-${Date.now()}`, role: "user", text: question, citations: [], fileBased: false, actions: [] },
            { ...answer, id: `a-${Date.now()}` },
          ],
        });
      },
      pushAssistant: (question, answer) =>
        set({
          chat: [
            ...get().chat,
            { id: `u-${Date.now()}`, role: "user", text: question, citations: [], fileBased: false, actions: [] },
            answer,
          ],
        }),
      clearChat: () => set({ chat: [] }),
      setOfficerNote: (officerNote) => set({ officerNote }),
      setDraft: (draft) => set({ draft }),
      setFutureAsk: (futureAsk) => set({ futureAsk }),
      resetDemo: () => set({ ...emptyShowcase(), role: get().role, lang: get().lang, onboarded: true }),
      leave: () => set(emptyShowcase()),
    }),
    { name: "janmarg-showcase-v1", storage: createJSONStorage(() => localStorage) },
  ),
);
