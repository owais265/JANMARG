import { Link, Navigate, useNavigate, useParams } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { INCOME_BANDS, MOTA, SCHEMES, STATES, STAGES, type SchemeCode } from "@/lib/beta/content";
import { assess, type ReadinessStatus } from "@/lib/beta/engine";
import { checksFor, completion, useBeta } from "@/lib/beta/store";
import { useT } from "@/lib/beta/use-t";
import { Card, Field, Shell, inputClass } from "@/components/beta/shell";
import { JagoThread, SchemeNotes } from "@/components/beta/jago-panel";
import { AuthScreen } from "@/components/beta/sign-in-card";
import { ScholarshipHome } from "@/components/beta/module-pages";

const PREFIX: Record<SchemeCode, string> = {
  "pre-matric": "pre",
  "post-matric": "post",
  "top-class": "top",
  nfst: "nfst",
  nos: "nos",
};

const PREP = ["prep.1", "prep.2", "prep.3", "prep.4"] as const;
const TOPICS = ["topic.guidance", "topic.account", "topic.privacy", "topic.bad"] as const;

function risky(value: string) {
  return /\d{8,}/.test(value) || /aadhaar|aadhar|ifsc|otp|bank account|password/i.test(value);
}

function placeName(value: string, t: (key: string) => string) {
  if (!value) return t("common.notSet");
  return value === "Other" ? t("state.Other") : value;
}

function summaryKey(
  profile: { educationStage: string; state: string; incomeBand: string; category: string },
  status: ReadinessStatus,
) {
  if (!profile.educationStage || !profile.state) return "ready.missing";
  if (profile.category === "not_st") return "ready.notSt";
  if (!profile.category || profile.category === "prefer_not") return "ready.category";
  if (profile.incomeBand === "ABOVE_5_LAKH") return "ready.income";
  return status === "other_path" ? "ready.other" : "ready.fit";
}

function AuthEntry() {
  const session = useCurrentUserState();
  const locker = useBeta((state) => state.locker);
  const entry = useBeta((state) => state.entry);
  const guideSeen = useBeta((state) => state.guideSeen);
  const signed = Boolean(session.user) || Boolean(locker) || entry !== "none";
  if (!session.isPending && signed && guideSeen) return <Navigate to="/dashboard" />;
  return (
    <Shell>
      <AuthScreen />
    </Shell>
  );
}

export function LandingPage() {
  return <AuthEntry />;
}

export function SchemesPage() {
  const { t } = useT();
  return (
    <Shell>
      <h1 className="app-title">{t("schemes.title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("schemes.note")}</p>
      <div className="mt-4 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        {SCHEMES.map((scheme) => (
          <Link key={scheme.code} to="/schemes/$schemeCode" params={{ schemeCode: scheme.code }} className="block border-t border-line px-4 py-3 first:border-t-0">
            <span className="block font-medium">{t(`sch.${PREFIX[scheme.code]}.name`)}</span>
            <span className="mt-0.5 block text-sm text-muted">{t(`sch.${PREFIX[scheme.code]}.who`)}</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

export function SchemePage() {
  const { t } = useT();
  const { schemeCode } = useParams({ strict: false }) as { schemeCode: string };
  const scheme = SCHEMES.find((item) => item.code === schemeCode);
  if (!scheme) {
    return (
      <Shell>
        <h1 className="text-3xl">{t("scheme.missing")}</h1>
      </Shell>
    );
  }
  const prefix = PREFIX[scheme.code];
  return (
    <Shell>
      <p className="text-sm text-muted">{t("scheme.kicker")}</p>
      <h1 className="mt-1 font-display text-4xl">{t(`sch.${prefix}.name`)}</h1>
      <p className="mt-3 max-w-2xl text-lg">{t(`sch.${prefix}.about`)}</p>
      <p className="mt-2 text-base text-muted">{t("scheme.who")}: {t(`sch.${prefix}.who`)}</p>
      <Card>
        <h2 className="text-xl">{t("scheme.listTitle")}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {PREP.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">{t("scheme.reviewed")}</p>
      </Card>
      <SchemeNotes scheme={scheme.code} />
      <p className="mt-4 text-base">{t("schemes.note")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link to="/readiness/$schemeCode" params={{ schemeCode: scheme.code }} className="inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-primary-fg">{t("scheme.start")}</Link>
        <Link to="/applications/$applicationId" params={{ applicationId: scheme.code }} className="inline-flex min-h-12 items-center rounded-full px-5 ring-1 ring-line">{t("mod.openTrack")}</Link>
        <a href={MOTA} className="inline-flex min-h-12 items-center rounded-full bg-surface px-5 ring-1 ring-line">{t("scheme.visit")}</a>
      </div>
    </Shell>
  );
}

export function HowPage() {
  const { t } = useT();
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("how.title")}</h1>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-lg">
        <li>{t("how.1")}</li>
        <li>{t("how.2")}</li>
        <li>{t("how.3")}</li>
        <li>{t("how.4")}</li>
        <li>{t("how.5")}</li>
      </ol>
      <p className="mt-4 text-base">{t("how.boundary")}</p>
    </Shell>
  );
}

export function AboutPage() {
  const { t } = useT();
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("about.title")}</h1>
      <p className="mt-3 max-w-2xl text-lg">{t("about.body")}</p>
      <p className="mt-3 text-base">{t("foot.beta")}</p>
      <p className="mt-3 text-base">{t("how.boundary")}</p>
    </Shell>
  );
}

export function PrivacyPage() {
  const { t } = useT();
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("privacy.title")}</h1>
      <div className="mt-4 grid gap-3">
        <Card>
          <h2 className="text-xl">{t("privacy.askT")}</h2>
          <p className="mt-1">{t("privacy.ask")}</p>
        </Card>
        <Card>
          <h2 className="text-xl">{t("privacy.whyT")}</h2>
          <p className="mt-1">{t("privacy.why")}</p>
        </Card>
        <Card>
          <h2 className="text-xl">{t("privacy.noT")}</h2>
          <p className="mt-1">{t("privacy.no")} {t("privacy.warn")}</p>
        </Card>
        <Card>
          <h2 className="text-xl">{t("privacy.keepT")}</h2>
          <p className="mt-1">{t("privacy.keep")}</p>
        </Card>
      </div>
      <p className="mt-4 text-sm text-muted">{t("foot.beta")}</p>
    </Shell>
  );
}

export function TermsPage() {
  const { t } = useT();
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("terms.title")}</h1>
      <p className="mt-3 max-w-2xl text-base">{t("terms.body")}</p>
      <p className="mt-3 text-base">{t("foot.beta")}</p>
    </Shell>
  );
}

export function SupportPage() {
  const { t } = useT();
  const add = useBeta((state) => state.addSupport);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ email: "", category: "topic.guidance", message: "", company: "" });
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("support.title")}</h1>
      <p className="mt-2 text-base text-muted">{t("privacy.warn")}</p>
      {sent ? <p className="mt-4 text-lg">{t("support.sent")}</p> : null}
      <form
        className="mt-4 grid max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (form.company || risky(form.message)) return;
          add(form.email, form.category, form.message);
          setSent(true);
        }}
      >
        <Field label={t("common.email")}>
          <input required type="email" className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </Field>
        <Field label={t("support.topic")}>
          <select className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {TOPICS.map((key) => (
              <option key={key} value={key}>{t(key)}</option>
            ))}
          </select>
        </Field>
        <Field label={t("support.message")}>
          <textarea required className={`${inputClass} min-h-28 py-2`} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        </Field>
        <input className="hidden" tabIndex={-1} autoComplete="off" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} aria-hidden="true" />
        <button className="min-h-12 rounded-full bg-primary px-5 text-primary-fg" type="submit">{t("support.send")}</button>
      </form>
    </Shell>
  );
}

export function FeedbackPage() {
  const { t } = useT();
  const add = useBeta((state) => state.addFeedback);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("feedback.title")}</h1>
      {sent ? <p className="mt-3">{t("feedback.thanks")}</p> : null}
      <form
        className="mt-4 grid max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (company || risky(message)) return;
          add("feedback", message, "");
          setSent(true);
        }}
      >
        <textarea required className={`${inputClass} min-h-28 py-2`} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("feedback.ph")} />
        <input className="hidden" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} aria-hidden="true" />
        <button className="min-h-12 rounded-full bg-primary text-primary-fg" type="submit">{t("feedback.submit")}</button>
      </form>
    </Shell>
  );
}

function useReady() {
  const session = useCurrentUserState();
  const profile = useBeta((state) => state.profile);
  const entry = useBeta((state) => state.entry);
  const guideSeen = useBeta((state) => state.guideSeen);
  const local = entry === "guest" || entry === "account";
  if (session.isPending && !local) return { pending: true as const };
  if (!session.user && !local) return { pending: false as const, to: "/login" };
  if (!profile.consentAt) return { pending: false as const, to: "/consent" };
  if (!guideSeen) return { pending: false as const, to: "/guide" };
  if (!profile.onboarded) return { pending: false as const, to: "/onboarding" };
  return { pending: false as const, to: null, user: session.user, profile };
}

export function Guard({ children }: { children: ReactNode }) {
  const { t } = useT();
  const ready = useReady();
  if (ready.pending) return <Shell><p>{t("common.loading")}</p></Shell>;
  if (ready.to) return <Navigate to={ready.to} />;
  return <>{children}</>;
}

export function LoginPage() {
  return <AuthEntry />;
}

export function SignupPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const grant = useBeta((state) => state.grantConsent);
  const setProfile = useBeta((state) => state.setProfile);
  const [form, setForm] = useState({ name: "", email: "", password: "", agree: false, company: "" });
  const [error, setError] = useState("");
  return (
    <Shell>
      <div className="flex min-h-full flex-1 flex-col bg-deep px-5 py-8 text-primary-fg">
        <div className="flex flex-col items-center pt-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary-fg font-display text-2xl text-deep">JM</span>
          <p className="mt-4 font-display text-4xl tracking-tight">JANMARG</p>
        </div>
        <form
          className="mt-6 grid gap-3 rounded-3xl border border-line bg-surface p-4 text-ink"
          onSubmit={(event) => {
            event.preventDefault();
            if (form.company) return;
            if (!form.agree) {
              setError("signup.need");
              return;
            }
            if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
              setError("signup.weak");
              return;
            }
            setError("");
            void authClient.signUp.email({ email: form.email, password: form.password, name: form.name, callbackURL: "/guide" }).then((result) => {
              if (result.error) {
                setError("signup.fail");
                return;
              }
              grant();
              setProfile({ fullName: form.name, email: form.email });
              useBeta.getState().markAccount();
              const seen = useBeta.getState().guideSeen;
              void navigate({ to: seen ? "/dashboard" : "/guide" });
            });
          }}
        >
          <h1 className="font-display text-3xl">{t("signup.title")}</h1>
          <Field label={t("common.name")}><input required className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label={t("common.email")}><input required type="email" className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label={t("common.password")}><input required type="password" className={inputClass} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
          <label className="flex items-start gap-2 text-base">
            <input type="checkbox" className="mt-1 size-5" checked={form.agree} onChange={(event) => setForm({ ...form, agree: event.target.checked })} />
            <span>{t("signup.consent")}</span>
          </label>
          <input className="hidden" tabIndex={-1} autoComplete="off" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} aria-hidden="true" />
          {error ? <p className="text-danger">{t(error)}</p> : null}
          <button className="min-h-12 rounded-full bg-primary text-primary-fg" type="submit">{t("signup.submit")}</button>
          <Link to="/login" className="inline-flex min-h-11 items-center justify-center text-sm text-primary">{t("login.title")}</Link>
        </form>
      </div>
    </Shell>
  );
}

export function ConsentPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const grant = useBeta((state) => state.grantConsent);
  const [agree, setAgree] = useState(false);
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("consent.title")}</h1>
      <p className="mt-3 max-w-xl">{t("foot.beta")}</p>
      <label className="mt-4 flex max-w-xl items-start gap-2">
        <input type="checkbox" className="mt-1 size-5" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
        <span>{t("signup.consent")}</span>
      </label>
      <button
        type="button"
        disabled={!agree}
        className="mt-4 min-h-12 rounded-full bg-primary px-5 text-primary-fg disabled:opacity-40"
        onClick={() => {
          grant();
          const seen = useBeta.getState().guideSeen;
          void navigate({ to: seen ? "/dashboard" : "/guide" });
        }}
      >
        {t("common.continue")}
      </button>
    </Shell>
  );
}

export function OnboardingPage() {
  const { t } = useT();
  const session = useCurrentUserState();
  const profile = useBeta((state) => state.profile);
  const finish = useBeta((state) => state.finishOnboarding);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(profile);
  if (!session.isPending && !session.user) return <Navigate to="/login" />;
  if (!profile.consentAt && !session.isPending) return <Navigate to="/consent" />;
  if (profile.onboarded) return <Navigate to="/dashboard" />;
  return (
    <Shell>
      <p className="text-sm text-muted">{t("onboard.step", { n: step + 1 })}</p>
      {step === 0 ? (
        <>
          <h1 className="font-display text-4xl">{t("onboard.stage")}</h1>
          <div className="mt-4 grid gap-2">
            {STAGES.map((stage) => (
              <button key={stage.id} type="button" className={`min-h-12 rounded-2xl px-4 text-left ring-1 ring-line ${draft.educationStage === stage.id ? "bg-soft" : "bg-surface"}`} onClick={() => setDraft({ ...draft, educationStage: stage.id })}>
                {t(`stage.${stage.id}`)}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <h1 className="font-display text-4xl">{t("onboard.context")}</h1>
          <div className="mt-4 grid max-w-md gap-3">
            <Field label={t("onboard.state")}>
              <select className={inputClass} value={draft.state} onChange={(event) => setDraft({ ...draft, state: event.target.value })}>
                <option value="">{t("common.select")}</option>
                {STATES.map((state) => <option key={state} value={state}>{placeName(state, t)}</option>)}
              </select>
            </Field>
            <Field label={t("onboard.district")}><input className={inputClass} value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} /></Field>
            <Field label={t("onboard.institution")}><input className={inputClass} value={draft.institutionType} onChange={(event) => setDraft({ ...draft, institutionType: event.target.value })} /></Field>
            <Field label={t("onboard.course")}><input className={inputClass} value={draft.course} onChange={(event) => setDraft({ ...draft, course: event.target.value })} /></Field>
          </div>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <h1 className="font-display text-4xl">{t("onboard.optional")}</h1>
          <div className="mt-4 grid max-w-md gap-3">
            <Field label={t("onboard.income")}>
              <select className={inputClass} value={draft.incomeBand} onChange={(event) => setDraft({ ...draft, incomeBand: event.target.value as typeof draft.incomeBand })}>
                <option value="">{t("onboard.later")}</option>
                {INCOME_BANDS.map((band) => <option key={band.id} value={band.id}>{t(`income.${band.id}`)}</option>)}
              </select>
            </Field>
            <Field label={t("onboard.category")}>
              <select className={inputClass} value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as typeof draft.category })}>
                <option value="">{t("common.select")}</option>
                <option value="st">{t("onboard.st")}</option>
                <option value="not_st">{t("onboard.notst")}</option>
                <option value="prefer_not">{t("onboard.skipcat")}</option>
              </select>
            </Field>
          </div>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <h1 className="font-display text-4xl">{t("onboard.noteTitle")}</h1>
          <p className="mt-3 max-w-xl text-lg">{t("onboard.note")}</p>
          <p className="mt-2 text-sm text-muted">{t("privacy.warn")}</p>
        </>
      ) : null}
      <div className="mt-6 flex gap-2">
        {step > 0 ? <button type="button" className="min-h-12 rounded-full px-4 ring-1 ring-line" onClick={() => setStep(step - 1)}>{t("common.back")}</button> : null}
        {step < 3 ? (
          <button type="button" className="min-h-12 rounded-full bg-primary px-5 text-primary-fg" onClick={() => setStep(step + 1)}>{t("common.continue")}</button>
        ) : (
          <button
            type="button"
            className="min-h-12 rounded-full bg-primary px-5 text-primary-fg"
            onClick={() => {
              const { language: _language, ...rest } = draft;
              finish(rest);
            }}
          >
            {t("onboard.create")}
          </button>
        )}
      </div>
    </Shell>
  );
}

export function DashboardPage() {
  return (
    <Guard>
      <Shell>
        <ScholarshipHome />
      </Shell>
    </Guard>
  );
}

export function ReadinessIndex() {
  const { t } = useT();
  return (
    <Guard>
      <Shell>
        <h1 className="font-display text-4xl">{t("ready.title")}</h1>
        <p className="mt-2 max-w-xl">{t("ready.plain")}</p>
        <p className="mt-2 text-sm text-warning">{t("ready.warn")}</p>
        <div className="mt-4 grid gap-2">
          {SCHEMES.map((scheme) => (
            <Link key={scheme.code} to="/readiness/$schemeCode" params={{ schemeCode: scheme.code }} className="rounded-2xl border border-line bg-surface p-4">
              {t(`sch.${PREFIX[scheme.code]}.name`)}
            </Link>
          ))}
        </div>
      </Shell>
    </Guard>
  );
}

export function ReadinessPage() {
  const { t } = useT();
  const { schemeCode } = useParams({ strict: false }) as { schemeCode: SchemeCode };
  const profile = useBeta((state) => state.profile);
  const save = useBeta((state) => state.saveGuidance);
  const scheme = SCHEMES.find((item) => item.code === schemeCode);
  if (!scheme) return <Navigate to="/readiness" />;
  const result = assess(
    { stage: profile.educationStage, state: profile.state, incomeBand: profile.incomeBand, category: profile.category },
    scheme.code,
  );
  const name = t(`sch.${PREFIX[scheme.code]}.name`);
  return (
    <Guard>
      <Shell>
        <p className="text-sm text-warning">{t("ready.warn")}</p>
        <h1 className="mt-2 font-display text-4xl">{name}</h1>
        <p className="mt-3 inline-flex min-h-10 items-center rounded-full bg-soft px-3">{t(`status.${result.status}`)}</p>
        <p className="mt-3 max-w-2xl text-lg">{t(summaryKey(profile, result.status), { scheme: name })}</p>
        <Card>
          <h2 className="text-xl">{t("ready.entered")}</h2>
          <p className="mt-1">{t("ready.stageLine", { stage: profile.educationStage ? t(`stage.${profile.educationStage}`) : t("common.notSet"), state: placeName(profile.state, t) })}</p>
          <h2 className="mt-3 text-xl">{t("ready.prepare")}</h2>
          <ul className="mt-1 list-disc pl-5">{PREP.map((key) => <li key={key}>{t(key)}</li>)}</ul>
          <h2 className="mt-3 text-xl">{t("ready.confirmTitle")}</h2>
          <ul className="mt-1 list-disc pl-5">
            <li>{t("ready.c1")}</li>
            <li>{t("ready.c2")}</li>
          </ul>
        </Card>
        <SchemeNotes scheme={scheme.code} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="min-h-12 rounded-full bg-primary px-5 text-primary-fg" onClick={() => save(scheme.code, name)}>{t("ready.save")}</button>
          <Link to="/checklist" className="inline-flex min-h-12 items-center rounded-full px-4 ring-1 ring-line">{t("ready.openList")}</Link>
          <Link to="/jago" className="inline-flex min-h-12 items-center">{t("ready.ask")}</Link>
          <a href={MOTA} className="inline-flex min-h-12 items-center">{t("ready.official")}</a>
        </div>
      </Shell>
    </Guard>
  );
}

export function ChecklistPage() {
  const { t } = useT();
  const checks = useBeta((state) => state.checks);
  const toggle = useBeta((state) => state.toggleCheck);
  const [code, setCode] = useState<SchemeCode>("post-matric");
  const items = checksFor(code, checks);
  return (
    <Guard>
      <Shell>
        <h1 className="font-display text-4xl">{t("check.title")}</h1>
        <p className="mt-2 text-warning">{t("check.warn")}</p>
        <p className="mt-2">{t("check.noneDocs", { n: completion(items) })}</p>
        <label className="mt-4 block">
          {t("check.scheme")}
          <select className={`${inputClass} mt-1`} value={code} onChange={(event) => setCode(event.target.value as SchemeCode)}>
            {SCHEMES.map((scheme) => <option key={scheme.code} value={scheme.code}>{t(`sch.${PREFIX[scheme.code]}.name`)}</option>)}
          </select>
        </label>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 size-5" checked={item.checked} onChange={() => toggle(code, item.id)} />
                <span>
                  <span className="block text-lg">{t(`check.${item.id}`)}</span>
                  <span className="text-sm text-muted">{t(`check.${item.id}.h`)}</span>
                  <span className="mt-1 block text-sm">{t("check.doneLine")}</span>
                </span>
              </label>
              <a className="mt-2 inline-flex min-h-11 text-primary" href={MOTA}>{t("check.source")}</a>
            </Card>
          ))}
        </div>
        <SchemeNotes scheme={code} />
      </Shell>
    </Guard>
  );
}

export function SavedPage() {
  const { t } = useT();
  const saved = useBeta((state) => state.saved);
  return (
    <Guard>
      <Shell>
        <h1 className="font-display text-4xl">{t("saved.title")}</h1>
        {saved.length === 0 ? <p className="mt-3">{t("saved.empty")}</p> : null}
        <div className="mt-4 grid gap-2">
          {saved.map((item) => (
            <Card key={item.id}>
              <p className="text-lg">{PREFIX[item.schemeCode as SchemeCode] ? t(`sch.${PREFIX[item.schemeCode as SchemeCode]}.name`) : item.title}</p>
              <p className="text-sm text-muted">{new Date(item.at).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      </Shell>
    </Guard>
  );
}

export function JagoPage() {
  return (
    <Guard>
      <Shell>
        <JagoThread />
      </Shell>
    </Guard>
  );
}

export function ProfilePage() {
  const { t } = useT();
  const profile = useBeta((state) => state.profile);
  const locker = useBeta((state) => state.locker);
  const entry = useBeta((state) => state.entry);
  const setProfile = useBeta((state) => state.setProfile);
  const session = useCurrentUserState();
  const name = profile.fullName || locker?.student.legal_name || "";
  const who = name || (entry === "guest" ? t("set.guest") : t("set.you"));
  const mail = profile.email || (session.user && !session.user.isDevFallback ? session.user.primaryEmail : "") || "";
  const letters = (name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0] ?? "").join("") || "JM").toUpperCase();
  return (
    <Guard>
      <Shell>
        <Link to="/settings" className="inline-flex min-h-11 items-center text-sm text-primary">{t("nav.settings")}</Link>
        <div className="mt-2 flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-primary font-display text-2xl text-primary-fg">{letters}</span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl">{who}</h1>
            {mail ? <p className="truncate text-sm text-muted">{mail}</p> : <p className="text-sm text-muted">{t("profile.note")}</p>}
          </div>
        </div>
        {locker ? (
          <div className="mt-4">
            <Card>
              <p className="text-sm text-muted">{t("set.locker")}</p>
              <p className="mt-1 text-lg">{locker.student.legal_name}</p>
              <p className="text-sm text-muted">{locker.student.course_name}</p>
              <p className="text-sm text-muted">{locker.student.institution_name}</p>
              <p className="text-sm">{locker.student.district}, {locker.student.state_name}</p>
              <Link to="/connect" className="mt-2 inline-flex min-h-11 items-center text-primary">{t("set.open")}</Link>
            </Card>
          </div>
        ) : (
          <Link to="/connect" className="mt-4 flex min-h-12 items-center justify-between rounded-2xl bg-soft px-4 text-primary">
            <span>{t("gate.connect")}</span>
            <span aria-hidden>→</span>
          </Link>
        )}
        <div className="mt-4 grid gap-3">
          <Field label={t("common.name")}><input className={inputClass} value={profile.fullName} onChange={(event) => setProfile({ fullName: event.target.value })} /></Field>
          <Field label={t("onboard.state")}>
            <select className={inputClass} value={profile.state} onChange={(event) => setProfile({ state: event.target.value })}>
              <option value="">{t("common.select")}</option>
              {STATES.map((state) => <option key={state} value={state}>{placeName(state, t)}</option>)}
            </select>
          </Field>
          <Field label={t("onboard.district")}><input className={inputClass} value={profile.district} onChange={(event) => setProfile({ district: event.target.value })} /></Field>
          <Field label={t("onboard.course")}><input className={inputClass} value={profile.course} onChange={(event) => setProfile({ course: event.target.value })} /></Field>
        </div>
        <div className="mt-2">
          <UserButton />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/consent" className="inline-flex min-h-11 items-center text-primary">{t("profile.consent")}</Link>
          <Link to="/account/delete" className="inline-flex min-h-11 items-center text-danger">{t("profile.delete")}</Link>
        </div>
      </Shell>
    </Guard>
  );
}

export function DeletePage() {
  const { t } = useT();
  const wipe = useBeta((state) => state.wipe);
  const [done, setDone] = useState(false);
  return (
    <Guard>
      <Shell>
        <h1 className="font-display text-4xl">{t("delete.title")}</h1>
        <p className="mt-3 max-w-xl">{t("delete.body")}</p>
        {done ? <p className="mt-3">{t("delete.done")}</p> : null}
        <button
          type="button"
          className="mt-4 min-h-12 rounded-full bg-danger px-5 text-primary-fg"
          onClick={() => {
            wipe();
            setDone(true);
            void import("@/lib/auth/client").then((mod) => mod.signOut("/"));
          }}
        >
          {t("delete.button")}
        </button>
      </Shell>
    </Guard>
  );
}

export function AdminClosed() {
  const { t } = useT();
  return (
    <Shell>
      <h1 className="font-display text-4xl">{t("admin.title")}</h1>
      <p className="mt-3 max-w-xl">{t("admin.body")}</p>
    </Shell>
  );
}
