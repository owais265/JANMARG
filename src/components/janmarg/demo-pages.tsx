import { Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdapterNote, Card, Frame, GhostLink, LangGrid, Notice, Pill, PrimaryLink, T } from "@/components/janmarg/demo-ui";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { askJago } from "@/lib/janmarg/jago-server";
import {
  ADAPTERS,
  ADAPTER_LABEL,
  APP_REF,
  DATA_LABEL,
  DISCLAIMER,
  JAGO_FALLBACK,
  KNOWLEDGE,
  SCHEMES,
  TRUST_LINE,
  documentsFor,
  eligibilityDecision,
  localAnswer,
  notifications,
  stageLabel,
  timeline,
  tx,
  type SchemeCode,
} from "@/lib/janmarg/showcase";
import { useShowcase } from "@/lib/janmarg/showcase-store";

const decisionCopy = {
  eligible: { en: "Eligible", hi: "पात्र", hinglish: "Eligible" },
  possibly: { en: "Possibly Eligible", hi: "संभवतः पात्र", hinglish: "Possibly Eligible" },
  needs: { en: "Needs Information", hi: "जानकारी चाहिए", hinglish: "Needs Information" },
  not: { en: "Not Demonstrably Eligible", hi: "अभी पात्र नहीं दिखता", hinglish: "Not for this class" },
} as const;

export function LoginPage() {
  const enter = useShowcase((s) => s.enter);
  const role = useShowcase((s) => s.role);
  const onboarded = useShowcase((s) => s.onboarded);
  const session = useCurrentUserState();
  if (role && !onboarded) return <Navigate to="/onboarding" />;
  if (role && onboarded) return <Navigate to="/dashboard" />;
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
      <p className="text-sm font-medium tracking-wide text-muted uppercase">Ministry of Tribal Affairs</p>
      <h1 className="font-display text-5xl text-ink">JANMARG</h1>
      <p className="text-lg text-ink">Understand. Verify. Recover. Track.</p>
      <p className="text-base text-muted">Scholarship journey ab hogi simple aur clear.</p>
      {session.user ? <UserButton /> : null}
      <button type="button" className="min-h-12 rounded-full bg-primary text-base font-medium text-primary-fg" onClick={() => enter("student")}>
        Continue as guest
      </button>
      <button type="button" className="min-h-12 rounded-full bg-surface text-base font-medium ring-1 ring-line" onClick={() => enter("guardian")}>
        Continue as parent
      </button>
      <button type="button" className="min-h-12 rounded-full bg-surface text-base font-medium text-muted ring-1 ring-line" onClick={() => enter("officer")}>
        Officer desk
      </button>
      {!session.isPending && !session.user && authEnabled
        ? GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              className="min-h-12 rounded-full bg-surface text-base font-medium ring-1 ring-line"
              onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
            >
              Continue with {provider.label}
            </button>
          ))
        : null}
      <LangGrid />
      <p className="text-sm text-muted">Sample file. No Aadhaar or bank number is stored.</p>
      <p className="text-sm leading-relaxed text-muted">{DATA_LABEL}</p>
    </main>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const finish = useShowcase((s) => s.finishOnboarding);
  const role = useShowcase((s) => s.role);
  const onboarded = useShowcase((s) => s.onboarded);
  if (!role) return <Navigate to="/" />;
  if (onboarded) return <Navigate to="/dashboard" />;
  const slides = [
    { title: "Find the right scholarship path", body: "Five MoTA families. Three you can walk through. Two stay as information." },
    { title: "Reuse documents safely", body: "Document Passport shares only what you consent to, and only for this application." },
    { title: "Understand issues before they become delays", body: "A name difference is a clarification, not a rejection." },
  ];
  const slide = slides[step];
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-between px-4 py-8">
      <div>
        <p className="text-sm text-muted">
          {step + 1} / {slides.length}
        </p>
        <h1 className="mt-3 text-4xl text-ink">{slide.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">{slide.body}</p>
      </div>
      <div className="space-y-3">
        <button type="button" className="min-h-12 w-full rounded-full bg-primary text-base font-medium text-primary-fg" onClick={() => (step < 2 ? setStep(step + 1) : finish())}>
          Continue
        </button>
        <button type="button" className="min-h-11 w-full text-base text-muted" onClick={() => finish()}>
          Skip
        </button>
      </div>
    </main>
  );
}

export function DashboardPage() {
  const data = useShowcase();
  const lang = data.lang;
  const notes = notifications(data).slice(0, 3);
  const guardian = data.role === "guardian";
  const officer = data.role === "officer";
  return (
    <Frame title={guardian ? "Parent" : officer ? "Officer" : "Namaste, Asha"}>
      {officer ? (
        <Card>
          <h1 className="text-3xl">Assigned review queue</h1>
          <p className="mt-2 text-base text-muted">One case. No sanction. No payment approval.</p>
          <PrimaryLink to="/officer">Open review queue</PrimaryLink>
        </Card>
      ) : null}
      <header>
        <h1 className="text-4xl">{guardian ? "Namaste" : "Namaste, Asha"}</h1>
        <p className="mt-1 text-base text-muted">
          {guardian ? "Aap Rina ke Class IX file ko dekh rahe hain." : "Aapki scholarship journey mein 2 updates hain."}
        </p>
      </header>
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-base font-medium">Profile {guardian ? "70" : "85"}% complete</p>
          <Pill>File</Pill>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-soft" aria-hidden="true">
          <div className="h-full rounded-full bg-primary" style={{ width: guardian ? "70%" : "85%" }} />
        </div>
      </Card>
      {!guardian && data.scenario === "name_mismatch" && !data.reviewSubmitted ? (
        <section className="hero">
          <p className="text-sm tracking-wide text-marigold uppercase">Action Needed / Zaroori Kaam</p>
          <h2 className="mt-2 text-2xl text-primary-fg">Name mismatch needs your clarification</h2>
          <p className="mt-2 text-base text-primary-fg">Income Certificate mein name profile se slightly different hai.</p>
          <Link to="/verify-once" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-marigold text-base font-medium text-deep">
            Resolve Now
          </Link>
        </section>
      ) : (
        <Card>
          <h2 className="text-2xl">
            <T pack={stageLabel(data)} />
          </h2>
          <p className="mt-2 text-base text-muted">Saved status. This is not a ministry decision.</p>
        </Card>
      )}
      {!guardian ? (
        <Card>
          <p className="text-sm text-muted">Post-Matric Scholarship</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill tone="warn">
              <T pack={stageLabel(data)} />
            </Pill>
          </div>
          <p className="mt-2 text-base">Application ID: {APP_REF}</p>
          <div className="mt-3">
            <PrimaryLink to={`/applications/${APP_REF}`}>Track Application</PrimaryLink>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted">Pre-Matric · Rina Munda · Class IX</p>
          <p className="mt-2 text-base">Possibly Eligible. Younger student on this file. No Aadhaar stored.</p>
          <div className="mt-3">
            <PrimaryLink to="/schemes/pre-matric">Open Pre-Matric</PrimaryLink>
          </div>
        </Card>
      )}
      <Card>
        <h2 className="text-xl">Payment Initiated</h2>
        <p className="mt-1 text-base text-muted">Awaiting confirmation</p>
        <div className="mt-3">
          <AdapterNote />
        </div>
        <div className="mt-3">
          <GhostLink to="/payments">Payment & DBT Status</GhostLink>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl">Documents / Dastavej</h2>
        <p className="mt-1 text-base text-muted">{guardian ? "3 documents available" : "5 documents available · 1 needs attention"}</p>
        <div className="mt-3">
          <PrimaryLink to="/documents">Open Documents</PrimaryLink>
        </div>
      </Card>
      <section>
        <h2 className="text-2xl">Recommended for you</h2>
        <ul className="mt-3 space-y-3">
          {(guardian ? (["pre-matric", "post-matric", "top-class"] as const) : (["post-matric", "top-class", "pre-matric"] as const)).map((code) => {
            const scheme = SCHEMES.find((item) => item.code === code)!;
            const decision = eligibilityDecision(data, code);
            return (
              <li key={code}>
                <Link to="/schemes/$schemeCode" params={{ schemeCode: code }} className="block rounded-2xl border border-line bg-surface p-4">
                  <span className="block text-base font-medium">{tx(lang, scheme.name)}</span>
                  <span className="mt-2 block">
                    <Pill tone={decision === "not" ? "bad" : decision === "possibly" ? "ok" : "warn"}>{tx(lang, decisionCopy[decision])}</Pill>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <Card>
        <h2 className="text-xl">Confused about your mismatch?</h2>
        <p className="mt-1 text-base text-muted">Ask JAGO in Hindi, English, or Hinglish.</p>
        <div className="mt-3">
          <PrimaryLink to="/jago">Ask JAGO / JAGO se Poochhein</PrimaryLink>
        </div>
      </Card>
      <section>
        <h2 className="text-2xl">Latest updates</h2>
        <ul className="mt-3 space-y-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link to={note.to as never} className="block rounded-2xl border border-line bg-surface px-4 py-3 text-base">
                {note.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Frame>
  );
}

export function SchemesPage() {
  const data = useShowcase();
  return (
    <Frame title="Schemes">
      <h1 className="text-4xl">Five scholarship families</h1>
      <ul className="space-y-3">
        {SCHEMES.map((scheme) => {
          const decision = eligibilityDecision(data, scheme.code);
          return (
            <li key={scheme.code}>
              <Card>
                <h2 className="text-2xl">
                  <T pack={scheme.name} />
                </h2>
                <p className="mt-1 text-base text-muted">
                  <T pack={scheme.purpose} />
                </p>
                <div className="mt-2">
                  <Pill tone={decision === "possibly" ? "ok" : decision === "not" ? "bad" : "warn"}>{tx(data.lang, decisionCopy[decision])}</Pill>
                </div>
                {!scheme.full ? <p className="mt-2 text-sm text-warning">Information View — Full application journey is future scope</p> : null}
                <p className="mt-2 text-sm text-muted">Scheme information should be confirmed from official current guidelines.</p>
                <div className="mt-3 grid gap-2">
                  <GhostLink to={`/schemes/${scheme.code}`}>Know More</GhostLink>
                  {scheme.full ? <PrimaryLink to={`/eligibility/${scheme.code}`}>Check Eligibility</PrimaryLink> : null}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

export function SchemeDetail({ code }: { code: string }) {
  const scheme = SCHEMES.find((item) => item.code === code);
  const data = useShowcase();
  if (!scheme) return <Frame title="Scheme">Scheme not on this desk.</Frame>;
  const decision = eligibilityDecision(data, scheme.code);
  return (
    <Frame title={tx(data.lang, scheme.name)}>
      <h1 className="text-4xl">
        <T pack={scheme.name} />
      </h1>
      <Card>
        <h2 className="text-xl">What this support is for</h2>
        <p className="mt-2 text-base">
          <T pack={scheme.purpose} />
        </p>
      </Card>
      <Card>
        <h2 className="text-xl">Who may benefit</h2>
        <p className="mt-2 text-base text-muted">ST students who match the published class, institute, and income lines for this family. This screen is guidance only.</p>
        <div className="mt-2">
          <Pill>{tx(data.lang, decisionCopy[decision])}</Pill>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl">Documents commonly required</h2>
        <p className="mt-2 text-base text-muted">ST certificate, income certificate, study proof, and a masked bank record. Exact lists change. Confirm on the official page.</p>
      </Card>
      <Card>
        <h2 className="text-xl">Your readiness</h2>
        <p className="mt-2 text-base">{scheme.code === "post-matric" && data.role === "student" ? "Asha’s file is in Deficiency Resolution until the name is clarified." : "Readiness is guidance, not a decision."}</p>
      </Card>
      <Card>
        <h2 className="text-xl">Official information source</h2>
        <a className="mt-2 block text-base text-primary underline" href={scheme.url}>
          {scheme.url}
        </a>
        <p className="mt-2 text-sm text-muted">Last reviewed 30 Sep 2026 · Curated from official public pages.</p>
        <p className="mt-2 text-base">This is guidance, not a final government eligibility decision.</p>
      </Card>
      {scheme.full ? (
        <div className="grid gap-2">
          <PrimaryLink to={`/eligibility/${scheme.code}`}>Check My Eligibility</PrimaryLink>
          <GhostLink to="/documents">Use My Document Passport</GhostLink>
        </div>
      ) : (
        <div className="grid gap-2">
          <GhostLink to={`/schemes/${scheme.code}`}>View checklist</GhostLink>
          <FutureAsk />
        </div>
      )}
      {scheme.code === "pre-matric" && data.role !== "guardian" ? (
        <Notice>For Classes IX–X. Open the parent desk to explore this flow with Rina.</Notice>
      ) : null}
    </Frame>
  );
}

function FutureAsk() {
  const value = useShowcase((s) => s.futureAsk);
  const set = useShowcase((s) => s.setFutureAsk);
  return (
    <Card>
      <h2 className="text-xl">Request future support</h2>
      <label className="mt-2 block text-base" htmlFor="future">
        What should a later version explain?
      </label>
      <textarea id="future" className="mt-2 min-h-24 w-full rounded-xl border border-line bg-paper p-3 text-base" value={value} onChange={(event) => set(event.target.value)} />
      <p className="mt-2 text-sm text-muted">{value.trim() ? "Saved on this phone. Not sent to a ministry." : "Nothing is sent to a ministry."}</p>
    </Card>
  );
}

export function EligibilityPage({ code }: { code: string }) {
  const data = useShowcase();
  const scheme = SCHEMES.find((item) => item.code === code);
  if (!scheme) return <Frame>Unknown scheme.</Frame>;
  const decision = eligibilityDecision(data, scheme.code);
  const reasons =
    scheme.code === "post-matric" && data.role === "student"
      ? [
          "You are enrolled in a post-secondary course.",
          "ST category has been provided on your file.",
          "Income declaration is available in your Document Passport.",
          "Final scheme eligibility must be verified through the official process.",
          data.scenario === "name_mismatch" ? "Name mismatch in income certificate must be clarified." : "No open name mismatch in this scenario.",
        ]
      : scheme.code === "pre-matric"
        ? data.role === "guardian"
          ? ["Rina’s profile is Class IX.", "ST category is in the parent file.", "This is guidance only."]
          : ["Asha is in B.A. first year.", "Pre-Matric on the ministry page is for Classes IX–X.", "This scheme is not for her current class."]
        : ["Institute or course confirmation is still needed.", "Do not treat this as approval."];
  return (
    <Frame title="Eligibility">
      <h1 className="text-4xl">
        <T pack={scheme.name} />
      </h1>
      <Card>
        <p className="text-sm text-muted">Rule result · DEMO-2026-09</p>
        <h2 className="mt-1 text-3xl">{tx(data.lang, decisionCopy[decision])}</h2>
        <p className="mt-2 text-base">This is a guidance result based on the published rule notes. Final eligibility is determined only by the official authority.</p>
      </Card>
      <ul className="space-y-2">
        {reasons.map((reason) => (
          <li key={reason} className="rounded-2xl border border-line bg-surface px-4 py-3 text-base">
            {reason}
          </li>
        ))}
      </ul>
      <div className="grid gap-2">
        <GhostLink to="/documents">Review documents</GhostLink>
        <PrimaryLink to="/verify-once">Resolve mismatch</PrimaryLink>
        <GhostLink to="/jago">Ask JAGO</GhostLink>
      </div>
    </Frame>
  );
}

export function DocumentsPage() {
  const data = useShowcase();
  const docs = documentsFor(data);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const setConsent = useShowcase((s) => s.setConsentImport);
  const importIncome = useShowcase((s) => s.importIncome);
  return (
    <Frame title="Document Passport">
      <h1 className="text-4xl">Document Passport / Dastavej Passport</h1>
      <p className="text-base text-muted">Metadata only. No raw certificate image is stored.</p>
      <button type="button" className="min-h-12 w-full rounded-full bg-deep text-base font-medium text-primary-fg" onClick={() => setOpen(true)}>
        Import from DigiLocker
      </button>
      {open ? (
        <Card>
          <h2 className="text-xl">Import</h2>
          <p className="mt-2 text-base">In production, this action requires approved DigiLocker requester integration and your consent.</p>
          <label className="mt-3 flex min-h-11 items-start gap-3 text-base">
            <input type="checkbox" className="mt-1 size-5" onChange={(event) => setConsent(event.target.checked)} />
            I consent to import and use selected documents only for this application.
          </label>
          <button
            type="button"
            className="mt-3 min-h-11 w-full rounded-full bg-primary text-base text-primary-fg"
            onClick={() => {
              const result = importIncome();
              setMessage(result === "ok" ? "Income Certificate imported successfully" : "Consent is required before import.");
            }}
          >
            Continue import
          </button>
          {message ? <p className="mt-2 text-base">{message}</p> : null}
          <p className="mt-2 text-sm text-muted">Source: DigiLocker gateway</p>
          <AdapterNote />
        </Card>
      ) : null}
      <ul className="space-y-3">
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link to="/documents/$documentId" params={{ documentId: doc.id }} className="block rounded-2xl border border-line bg-surface p-4">
              <span className="block text-lg font-medium">{tx(data.lang, doc.name)}</span>
              <span className="mt-1 block text-base text-muted">
                {doc.state === "attention" ? "Needs attention" : doc.state === "missing" ? "Missing" : doc.state === "shared" ? "Shared with application" : "Available"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function DocumentDetail({ id }: { id: string }) {
  const data = useShowcase();
  const doc = documentsFor(data).find((item) => item.id === id);
  const toggle = useShowcase((s) => s.toggleShare);
  if (!doc) return <Frame>Document not on this file.</Frame>;
  const shared = Boolean(data.shares[doc.id]);
  return (
    <Frame title="Document">
      <h1 className="text-4xl">{tx(data.lang, doc.name)}</h1>
      <Card>
        <p className="text-base">Issued {doc.issued}</p>
        <p className="text-base">Expiry {doc.expiry ?? "No known expiry"}</p>
        <p className="mt-2 text-base">Source: {tx(data.lang, doc.source)}</p>
        <p className="text-base">Name on record: {doc.holder}</p>
        <p className="mt-2 text-base">Consent: {shared ? "Shared with JM-POST-2026-ASH-001" : "Not shared"}</p>
        <p className="mt-2 text-sm text-muted">Raw document content is not shown.</p>
      </Card>
      <div className="grid gap-2">
        <button type="button" className="min-h-11 rounded-full bg-primary text-base text-primary-fg" onClick={() => toggle(doc.id)}>
          {shared ? "Revoke sharing" : "Share with application"}
        </button>
        <GhostLink to="/documents">Replace document</GhostLink>
      </div>
      <Card>
        <h2 className="text-xl">What is shared</h2>
        <p className="mt-2 text-base">Type, masked reference, and name line. Used only for the Post-Matric file. You can revoke it here.</p>
      </Card>
    </Frame>
  );
}

export function VerifyPage() {
  const data = useShowcase();
  const [choice, setChoice] = useState<string | null>(null);
  const mismatch = data.scenario === "name_mismatch" && data.role !== "guardian";
  return (
    <Frame title="VerifyOnce">
      <h1 className="text-4xl">VerifyOnce</h1>
      <p className="text-base text-muted">Ek baar documents organise karein, har application mein safely reuse karein.</p>
      <ol className="grid grid-cols-2 gap-2 text-sm">
        {["Profile Match", "Document Match", "Application Readiness", "Manual Review if Needed"].map((step, index) => (
          <li key={step} className="rounded-xl bg-surface px-3 py-3 ring-1 ring-line">
            <span className="text-muted">{index + 1}</span>
            <span className="mt-1 block text-base text-ink">{step}</span>
          </li>
        ))}
      </ol>
      <Card>
        <p className="text-base">Profile Match: Passed</p>
        <p className="text-base">ST Certificate: Available</p>
        <p className="text-base">College Proof: Available</p>
        <p className="text-base">Income Certificate: {mismatch ? "Needs clarification" : data.scenario === "missing_income_doc" ? "Missing" : "Available"}</p>
        <p className="text-base">Bank Details: Masked record available</p>
        <p className="mt-2 text-lg font-medium">{mismatch ? "1 issue needs your attention" : "No open mismatch in this scenario"}</p>
      </Card>
      {mismatch ? (
        <Card>
          <h2 className="text-2xl">Name mismatch detected</h2>
          <p className="mt-2 text-base">Profile: Asha Munda</p>
          <p className="text-base">Income Certificate: Asha Kumari Munda</p>
          <div className="mt-2">
            <Pill tone="warn">Needs Clarification</Pill>
          </div>
          <p className="mt-3 text-base">Difference could be a middle name variation. JANMARG cannot decide validity. You can submit a clarification to the officer review queue.</p>
          <p className="mt-2 text-base">Your uploaded/integrated document has an additional middle name. This is not an automatic rejection. Please confirm your preferred name and submit a clarification for officer review.</p>
        </Card>
      ) : null}
      <div className="grid gap-2">
        <button type="button" className="min-h-11 rounded-full bg-surface text-base ring-1 ring-line" onClick={() => setChoice("confirm")}>
          Confirm this is my document
        </button>
        <PrimaryLink to={`/applications/${APP_REF}/resolve`}>Add clarification</PrimaryLink>
        <GhostLink to="/manual-review">Request Manual Review</GhostLink>
        <GhostLink to="/documents/income">Replace Document</GhostLink>
      </div>
      {choice === "confirm" ? <p className="text-base">Next, add the prefilled clarification. JANMARG will not auto-reject.</p> : null}
      <Notice>JANMARG does not auto-reject applications. Exceptions are routed for manual review.</Notice>
    </Frame>
  );
}

export function ApplicationsPage() {
  const data = useShowcase();
  return (
    <Frame title="Applications">
      <h1 className="text-4xl">Applications</h1>
      {data.role !== "guardian" ? (
        <Card>
          <h2 className="text-2xl">Post-Matric Scholarship</h2>
          <p className="mt-1 text-base">{APP_REF}</p>
          <p className="mt-1 text-base">
            <T pack={stageLabel(data)} /> · Progress 60%
          </p>
          <div className="mt-3">
            <PrimaryLink to={`/applications/${APP_REF}`}>Track</PrimaryLink>
          </div>
        </Card>
      ) : null}
      <Card>
        <h2 className="text-2xl">Top Class Education Scheme</h2>
        <p className="mt-1 text-base">Eligibility check saved</p>
        <div className="mt-3">
          <GhostLink to="/eligibility/top-class">Continue</GhostLink>
        </div>
      </Card>
      <Card>
        <h2 className="text-2xl">Pre-Matric</h2>
        <p className="mt-1 text-base">{data.role === "guardian" ? "Rina Munda · Class IX · Possibly Eligible" : "Open the parent desk"}</p>
        {data.role === "guardian" ? (
          <div className="mt-3">
            <PrimaryLink to="/eligibility/pre-matric">Open readiness</PrimaryLink>
          </div>
        ) : null}
      </Card>
      <Card>
        <h2 className="text-xl">National Fellowship</h2>
        <p className="mt-2 text-base">Journey information available. Full flow is not part of this current release.</p>
      </Card>
      <Card>
        <h2 className="text-xl">National Overseas Scholarship</h2>
        <p className="mt-2 text-base">Journey information available. Full flow is not part of this current release.</p>
      </Card>
    </Frame>
  );
}

export function ApplicationPage() {
  const data = useShowcase();
  const events = timeline(data);
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <Frame title="Track Application">
      {offline ? <Notice>You are offline. Your draft is saved on this device.</Notice> : null}
      {data.scenario === "source_unavailable" ? <Notice>We could not fetch the latest status.</Notice> : null}
      <h1 className="text-4xl">Post-Matric Scholarship</h1>
      <p className="text-base">{APP_REF}</p>
      <Pill tone="warn">
        <T pack={stageLabel(data)} />
      </Pill>
      <ol className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className={`rounded-2xl border bg-surface p-4 ${event.current ? "border-marigold" : "border-line"}`}>
            <p className="text-sm text-muted">{event.at}</p>
            <h2 className="text-xl">
              <T pack={event.title} />
            </h2>
            <p className="mt-1 text-base">
              <T pack={event.detail} />
            </p>
            <p className="mt-2 text-base">
              <span className="font-medium">What this means. </span>
              <T pack={event.meaning} />
            </p>
            <p className="text-base">
              <span className="font-medium">What you can do next. </span>
              <T pack={event.next} />
            </p>
            {event.synthetic ? <p className="mt-2 text-sm text-warning">{ADAPTER_LABEL}</p> : null}
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">Sanction and DBT disbursement stay future official stages. JANMARG does not complete them.</p>
      <div className="grid gap-2">
        <PrimaryLink to={`/applications/${APP_REF}/resolve`}>Resolve Deficiency</PrimaryLink>
        <GhostLink to="/jago">Ask JAGO</GhostLink>
        <GhostLink to="/manual-review">Request Manual Review</GhostLink>
      </div>
    </Frame>
  );
}

export function ResolvePage() {
  const data = useShowcase();
  const setClarification = useShowcase((s) => s.setClarification);
  const submit = useShowcase((s) => s.submitReview);
  const setDraft = useShowcase((s) => s.setDraft);
  const [done, setDone] = useState(data.reviewSubmitted);
  const [consent, setConsent] = useState(false);
  return (
    <Frame title="Resolve">
      <h1 className="text-4xl">Resolve deficiency</h1>
      <Card>
        <h2 className="text-xl">1. Understand the issue</h2>
        <p className="mt-2 text-base">Your name appears differently in the income certificate.</p>
      </Card>
      <Card>
        <h2 className="text-xl">2. Choose an action</h2>
        <p className="mt-2 text-base">Confirm the document, replace it, ask for review, or save for later.</p>
        <button type="button" className="mt-3 min-h-11 text-base text-primary" onClick={() => setDraft(data.clarification)}>
          Save and do later
        </button>
        {data.draft ? <p className="mt-2 text-sm text-muted">Draft saved on this phone. Not submitted.</p> : null}
      </Card>
      <Card>
        <h2 className="text-xl">3. Add clarification</h2>
        <label className="mt-2 block text-base" htmlFor="note">
          Clarification
        </label>
        <textarea id="note" className="mt-2 min-h-28 w-full rounded-xl border border-line bg-paper p-3 text-base" value={data.clarification} onChange={(event) => setClarification(event.target.value)} />
      </Card>
      <Card>
        <h2 className="text-xl">4. Confirm consent</h2>
        <label className="mt-2 flex items-start gap-3 text-base">
          <input type="checkbox" className="mt-1 size-5" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          Share this clarification only for Post-Matric Scholarship application {APP_REF}.
        </label>
      </Card>
      <button
        type="button"
        disabled={!consent || data.clarification.trim().length < 8}
        className="min-h-12 w-full rounded-full bg-primary text-base font-medium text-primary-fg disabled:opacity-50"
        onClick={() => {
          submit();
          setDone(true);
        }}
      >
        Submit for manual review
      </button>
      {done ? (
        <Card>
          <h2 className="text-2xl">Clarification submitted for manual review.</h2>
          <p className="mt-2 text-base">JANMARG has not made a final decision.</p>
          <div className="mt-3">
            <PrimaryLink to={`/applications/${APP_REF}`}>See timeline</PrimaryLink>
          </div>
        </Card>
      ) : null}
    </Frame>
  );
}

export function PaymentsPage() {
  const data = useShowcase();
  const pending = data.scenario === "payment_pending";
  return (
    <Frame title="Payments">
      <h1 className="text-4xl">Payment & DBT Status</h1>
      <Card>
        <p className="text-base">Post-Matric Scholarship</p>
        <h2 className="mt-1 text-2xl">{pending ? "Payment pending" : "Payment Initiated"}</h2>
        <p className="mt-2 text-base">Reference DEMO-PFMS-POST-2026-0182</p>
        <p className="text-base">Destination: Bank account ending 8724</p>
        <p className="text-base">Last update: 14 Aug 2026</p>
      </Card>
      <Notice>This status is supplied by a gateway row. JANMARG does not send payments and is not the PFMS system.</Notice>
      <ol className="space-y-2 text-base">
        <li className="rounded-xl bg-surface px-4 py-3 ring-1 ring-line">Sanction — Future official stage</li>
        <li className="rounded-xl bg-surface px-4 py-3 ring-1 ring-line">{pending ? "Payment pending" : "Payment initiated"} — status</li>
        <li className="rounded-xl bg-surface px-4 py-3 ring-1 ring-line">Bank confirmation pending — status</li>
        <li className="rounded-xl bg-surface px-4 py-3 ring-1 ring-line">Disbursed — Not confirmed</li>
      </ol>
      <p className="text-base">Payment status only. Verify final status through official channel.</p>
      <div className="grid gap-2">
        <PrimaryLink to="/jago">Payment delayed? Ask JAGO</PrimaryLink>
        <GhostLink to="/manual-review">Request support</GhostLink>
      </div>
    </Frame>
  );
}

export function NotesPage() {
  const data = useShowcase();
  const mark = useShowcase((s) => s.markRead);
  const [filter, setFilter] = useState("All");
  const items = notifications(data).filter((item) => filter === "All" || item.priority === filter);
  return (
    <Frame title="Alerts">
      <h1 className="text-4xl">Notifications</h1>
      <div className="flex gap-2 overflow-x-auto">
        {["All", "Action Required", "Application Updates", "Document Reminders", "Payment Updates", "General Information"].map((name) => (
          <button key={name} type="button" className={`min-h-11 shrink-0 rounded-full px-3 text-sm ${filter === name ? "bg-deep text-primary-fg" : "bg-surface ring-1 ring-line"}`} onClick={() => setFilter(name)}>
            {name}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={item.to as never} onClick={() => mark(item.id)} className="block rounded-2xl border border-line bg-surface p-4">
              <span className="text-sm text-warning">{item.priority}</span>
              <span className="mt-1 block text-base font-medium">{item.title}</span>
              <span className="mt-1 block text-base text-muted">{item.body}</span>
              {!data.readNotes.includes(item.id) ? <span className="mt-2 block text-sm text-primary">Unread</span> : <span className="mt-2 block text-sm text-muted">Read</span>}
            </Link>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

const CHIPS = [
  "Am I eligible for Post-Matric?",
  "Why is my application delayed?",
  "What does name mismatch mean?",
  "Which documents are needed?",
  "Where is my payment?",
  "Mujhe kya karna chahiye?",
];

export function JagoPage() {
  const data = useShowcase();
  const askLocal = useShowcase((s) => s.askLocal);
  const push = useShowcase((s) => s.pushAssistant);
  const clear = useShowcase((s) => s.clearChat);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(false);

  async function send(question: string) {
    const clean = question.trim();
    if (!clean || busy) return;
    setText("");
    const local = localAnswer(clean, data);
    const known = local.text !== JAGO_FALLBACK;
    if (known) {
      askLocal(clean);
      return;
    }
    setBusy(true);
    try {
      const result = await askJago({ data: { question: clean } });
      push(clean, {
        id: `g-${Date.now()}`,
        role: "assistant",
        text: result.text,
        citations: result.citations.map((item) => ({ title: item.title, url: item.url, excerpt: item.excerpt })),
        fileBased: false,
        actions: [{ label: "Manual review", to: "/manual-review" }],
      });
    } catch {
      askLocal(clean);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Frame title="JAGO">
      <h1 className="text-4xl">JAGO — Scholarship Saathi</h1>
      <p className="text-base text-muted">Official-source guidance, simple language, clear next steps.</p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button key={chip} type="button" className="min-h-11 rounded-full bg-surface px-3 text-sm ring-1 ring-line" onClick={() => void send(chip)}>
            {chip}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {data.chat.length === 0 ? <p className="text-base text-muted">Ask about Asha’s file or a published scheme line.</p> : null}
        {busy ? <p className="text-base text-muted">Checking official-source notes…</p> : null}
        {data.chat.map((turn) => (
          <article key={turn.id} className={`rounded-2xl p-4 text-base ${turn.role === "user" ? "bg-deep text-primary-fg" : "border border-line bg-surface"}`}>
            <p>{turn.text}</p>
            {turn.role === "assistant" && turn.fileBased ? <p className="mt-2 text-sm opacity-80">Based on your your file.</p> : null}
            {turn.citations.length > 0 ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">Sources · Source-grounded guidance</p>
                {turn.citations.map((cite) => (
                  <a key={cite.url} href={cite.url} className="block rounded-xl bg-paper px-3 py-2 text-sm text-primary underline">
                    {cite.title}
                    <span className="mt-1 block text-muted no-underline">{cite.excerpt}</span>
                  </a>
                ))}
              </div>
            ) : null}
            {turn.actions.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {turn.actions.map((action) => (
                  <GhostLink key={action.to} to={action.to}>
                    {action.label}
                  </GhostLink>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send(text);
        }}
      >
        <label className="text-base" htmlFor="jago-q">
          Your question
        </label>
        <textarea id="jago-q" className="min-h-24 w-full rounded-2xl border border-line bg-surface p-3 text-base" value={text} onChange={(event) => setText(event.target.value)} />
        <button type="submit" className="min-h-12 rounded-full bg-primary text-base font-medium text-primary-fg">
          Send
        </button>
      </form>
      <div className="flex gap-3">
        <button type="button" className="min-h-11 text-base text-muted" onClick={() => clear()}>
          Clear chat
        </button>
        <button type="button" className="min-h-11 text-base text-muted" onClick={() => setReported(true)}>
          Report incorrect answer
        </button>
      </div>
      {reported ? <p className="text-base">Noted on this device. A human should check the official page.</p> : null}
      <Card>
        <h2 className="text-xl">Curated sources</h2>
        <ul className="mt-2 space-y-2">
          {KNOWLEDGE.slice(0, 4).map((item) => (
            <li key={item.id}>
              <a className="text-base text-primary underline" href={item.url}>
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </Frame>
  );
}

export function ManualReviewPage() {
  const data = useShowcase();
  return (
    <Frame title="Manual review">
      <h1 className="text-4xl">Manual review</h1>
      <Card>
        <p className="text-base">Subject: Name mismatch on income certificate</p>
        <p className="mt-2 text-base">Status: {data.reviewSubmitted ? "Submitted for review" : "Not submitted yet"}</p>
        <p className="mt-2 text-base">{data.clarification}</p>
        {data.officerNote ? <p className="mt-2 text-base">Officer note: {data.officerNote}</p> : null}
      </Card>
      {!data.reviewSubmitted ? <PrimaryLink to={`/applications/${APP_REF}/resolve`}>Submit clarification</PrimaryLink> : <GhostLink to={`/applications/${APP_REF}`}>Back to timeline</GhostLink>}
      <Notice>JANMARG does not auto-reject applications. Exceptions are routed for manual review.</Notice>
    </Frame>
  );
}

export function HealthPage() {
  const scenario = useShowcase((s) => s.scenario);
  const setScenario = useShowcase((s) => s.setScenario);
  const role = useShowcase((s) => s.role);
  return (
    <Frame title="Integrations">
      <h1 className="text-4xl">Integration health</h1>
      <p className="text-base text-muted">Gateway health. These rows are not live ministry sessions.</p>
      <label className="block text-base" htmlFor="scenario">
        File scenario
      </label>
      <select
        id="scenario"
        className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base"
        value={scenario}
        disabled={role === "student"}
        onChange={(event) => setScenario(event.target.value as typeof scenario)}
      >
        <option value="name_mismatch">name_mismatch</option>
        <option value="happy_path">happy_path</option>
        <option value="missing_income_doc">missing_income_doc</option>
        <option value="payment_pending">payment_pending</option>
        <option value="source_unavailable">source_unavailable</option>
      </select>
      {role === "student" ? <p className="text-sm text-muted">Students see the active scenario. The officer desk can switch it.</p> : null}
      <ul className="space-y-2">
        {ADAPTERS.map((adapter) => (
          <li key={adapter.name} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-lg font-medium">{adapter.name}</p>
            <p className="text-base">
              {adapter.health} · {adapter.mode}
              {adapter.ms ? ` · ${adapter.ms} ms` : ""}
            </p>
            <p className="mt-1 text-sm text-warning">{ADAPTER_LABEL}</p>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function ProfilePage() {
  const data = useShowcase();
  const reset = useShowcase((s) => s.resetDemo);
  const leave = useShowcase((s) => s.leave);
  const person =
    data.role === "guardian"
      ? { name: "Parent", detail: "Assisting Rina Munda, Class IX, Jharkhand" }
      : data.role === "officer"
        ? { name: "Officer", detail: "Sees one assigned case" }
        : {
            name: "Asha Munda",
            detail: "19 · Jharkhand · Ranchi · B.A. First Year · Government College, Ranchi · ST · family income ₹1,80,000",
          };
  return (
    <Frame title="Profile">
      <h1 className="text-4xl">{person.name}</h1>
      <p className="text-base">{person.detail}</p>
      <Card>
        <div className="flex items-center gap-3">
          <span className="mark" aria-hidden="true">
            {person.name.slice(0, 1)}
          </span>
          <div>
            <p className="text-lg font-medium">{person.name}</p>
            <p className="text-base text-muted">{person.detail}</p>
          </div>
        </div>
        <UserButton />
        <p className="mt-3 text-base">Phone +91 98XXXXXX24</p>
        <p className="text-base">Email asha.munda@students.janmarg.app</p>
        <p className="text-base">Aadhaar XXXX-XXXX-4821</p>
        <p className="text-base">Account XXXX8724</p>
        <p className="mt-2 text-sm text-muted">{DATA_LABEL}</p>
      </Card>
      <div className="grid gap-2">
        <GhostLink to="/settings">Settings</GhostLink>
        <GhostLink to="/privacy-consent">Privacy and consent</GhostLink>
        <GhostLink to="/integration-health">Integration health</GhostLink>
        <GhostLink to="/about">About</GhostLink>
        <GhostLink to="/officer">Officer desk</GhostLink>
      </div>
      <button type="button" className="min-h-11 text-base text-primary" onClick={() => reset()}>
        Reset file
      </button>
      <button type="button" className="min-h-11 text-base text-danger" onClick={() => leave()}>
        Leave
      </button>
    </Frame>
  );
}

export function PrivacyPage() {
  return (
    <Frame title="Privacy">
      <h1 className="text-4xl">Privacy and consent</h1>
      <Card>
        <p className="text-base">What is stored: display name, masked phone, masked account ending, scheme stage, and document metadata.</p>
        <p className="mt-2 text-base">Why: to explain this file and reuse a document only after you share it.</p>
        <p className="mt-2 text-base">Where: this browser, for the rehearsal. Not a government system.</p>
        <p className="mt-2 text-base">You can revoke a document share from its card.</p>
      </Card>
      <p className="text-base">{TRUST_LINE}</p>
    </Frame>
  );
}

export function OfficerPage() {
  const data = useShowcase();
  const setNote = useShowcase((s) => s.setOfficerNote);
  const setScenario = useShowcase((s) => s.setScenario);
  if (data.role !== "officer") {
    return (
      <Frame title="Officer">
        <h1 className="text-3xl">Officer is a separate entry</h1>
        <p className="text-base">Leave this session and choose Officer desk. Students cannot approve sanction or payment.</p>
      </Frame>
    );
  }
  return (
    <Frame title="Officer">
      <h1 className="text-4xl">Manual review queue</h1>
      <Card>
        <p className="text-base font-medium">Asha Munda · {APP_REF}</p>
        <p className="mt-2 text-base">Profile name: Asha Munda</p>
        <p className="text-base">Income certificate: Asha Kumari Munda</p>
        <p className="mt-2 text-base text-muted">Masked comparison only. Storage path hidden.</p>
        <label className="mt-3 block text-base" htmlFor="officer-note">
          Officer note
        </label>
        <textarea id="officer-note" className="mt-2 min-h-24 w-full rounded-xl border border-line p-3 text-base" value={data.officerNote} onChange={(event) => setNote(event.target.value)} />
        <p className="mt-2 text-sm text-muted">You can ask for a document. You cannot mark sanction or payment.</p>
      </Card>
      <label className="block text-base" htmlFor="officer-scenario">
        Switch scenario
      </label>
      <select id="officer-scenario" className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base" value={data.scenario} onChange={(event) => setScenario(event.target.value as typeof data.scenario)}>
        <option value="name_mismatch">name_mismatch</option>
        <option value="happy_path">happy_path</option>
        <option value="missing_income_doc">missing_income_doc</option>
        <option value="payment_pending">payment_pending</option>
        <option value="source_unavailable">source_unavailable</option>
      </select>
    </Frame>
  );
}

export function AboutPage() {
  return (
    <Frame title="About">
      <h1 className="text-4xl">About JANMARG</h1>
      <p className="text-lg">An explainable scholarship recovery and orchestration platform, not only a scholarship discovery dashboard.</p>
      <Card>
        <p className="text-base">{TRUST_LINE}</p>
      </Card>
      <Card>
        <p className="text-base">{DISCLAIMER}</p>
      </Card>
      <p className="text-base text-muted">JANMARG does not replace official scholarship portals or government systems of record.</p>
      <ul className="space-y-2 text-base">
        {KNOWLEDGE.map((item) => (
          <li key={item.id}>
            <a className="text-primary underline" href={item.url}>
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function isScheme(value: string): value is SchemeCode {
  return SCHEMES.some((item) => item.code === value);
}
