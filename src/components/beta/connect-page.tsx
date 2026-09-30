import { Link, Navigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { docLabel, fetchLocker, type LockerFile, type PortalStatus } from "@/lib/beta/locker";
import { useBeta } from "@/lib/beta/store";
import { useT } from "@/lib/beta/use-t";
import { Shell } from "@/components/beta/shell";

const STEPS = ["gate.step.id", "gate.step.st", "gate.step.income", "gate.step.academic", "gate.step.portals"] as const;

const TONE: Record<PortalStatus, string> = {
  action: "bg-rose-soft text-danger",
  watching: "bg-amber-soft text-warning",
  clear: "bg-soft text-primary",
  none: "bg-paper text-muted",
};

export function ConnectPage() {
  const { t } = useT();
  const session = useCurrentUserState();
  const entry = useBeta((state) => state.entry);
  const pendingStudentId = useBeta((state) => state.pendingStudentId);
  const locker = useBeta((state) => state.locker);
  const applyLocker = useBeta((state) => state.applyLocker);
  const markAccount = useBeta((state) => state.markAccount);
  const [agree, setAgree] = useState(false);
  const [phase, setPhase] = useState<"ask" | "pull" | "done">(locker ? "done" : "ask");
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<LockerFile | null>(locker);
  const [error, setError] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  const signedIn = Boolean(session.user) || entry !== "none";
  if (!session.isPending && !signedIn) return <Navigate to="/login" />;

  function start() {
    if (session.user) markAccount();
    setError("");
    setPhase("pull");
    setStep(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setStep(Math.min(index, STEPS.length - 1));
      if (index >= STEPS.length) window.clearInterval(timer);
    }, 420);
    timerRef.current = timer;
    const id = pendingStudentId || "random";
    void fetchLocker(id)
      .then((next) => {
        window.clearInterval(timer);
        setStep(STEPS.length - 1);
        applyLocker(next);
        setFile(next);
        setPhase("done");
      })
      .catch(() => {
        window.clearInterval(timer);
        setPhase("ask");
        setError("gate.fail");
      });
  }

  const view = file ?? locker;
  const blocked = view?.portals.filter((portal) => portal.status === "action") ?? [];

  return (
    <Shell>
      <Link to="/settings" className="inline-flex min-h-11 items-center text-sm text-primary">{t("nav.settings")}</Link>
      <p className="text-sm font-medium tracking-wide text-primary uppercase">{t("gate.kicker")}</p>
      <h1 className="mt-1 max-w-xl font-display text-4xl">{t("gate.connect")}</h1>
      <p className="mt-2 max-w-xl text-base text-muted">{t("gate.connectBody")}</p>

      {phase !== "done" ? (
        <section className="mt-5 max-w-md overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="bg-[#0b3a82] px-4 py-4 text-white">
            <p className="text-xs tracking-[0.14em] uppercase">DigiLocker</p>
            <p className="mt-1 font-display text-2xl">{t("gate.sheet")}</p>
          </div>
          <div className="grid gap-3 p-4">
            <p className="text-base">{t("gate.sheetBody")}</p>
            <label className="flex items-start gap-2 text-base">
              <input type="checkbox" className="mt-1 size-5" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
              <span>{t("gate.consent")}</span>
            </label>
            {phase === "pull" ? (
              <ol className="grid gap-2">
                {STEPS.map((key, index) => (
                  <li key={key} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 ${index <= step ? "bg-soft" : "bg-paper"}`}>
                    <span className={`size-2.5 rounded-full ${index <= step ? "bg-primary" : "bg-line"} ${index === step ? "locker-live" : ""}`} />
                    {t(key)}
                  </li>
                ))}
              </ol>
            ) : null}
            {error ? <p className="text-danger">{t(error)}</p> : null}
            <button
              type="button"
              disabled={!agree || phase === "pull"}
              className="min-h-12 rounded-full bg-[#0b3a82] px-5 text-white disabled:opacity-40"
              onClick={start}
            >
              {phase === "pull" ? t("gate.pulling") : t("gate.fetch")}
            </button>
          </div>
        </section>
      ) : null}

      {phase === "done" && view ? (
        <div className="mt-5 grid max-w-xl gap-3">
          <section className="rounded-3xl border border-line bg-surface p-4">
            <p className="text-sm text-muted">{t("gate.fileFor")}</p>
            <h2 className="font-display text-3xl">{view.student.legal_name}</h2>
            <p className="mt-1 text-base">
              {view.student.course_name} · {view.student.district}, {view.student.state_name}
            </p>
            <p className="text-sm text-muted">{view.student.institution_name}</p>
            <p className="mt-2 text-sm text-muted">
              {t("gate.mobile")} {view.student.mobile_masked}
            </p>
          </section>

          {blocked.length ? (
            <section className="rounded-3xl bg-rose-soft p-4">
              <h2 className="text-xl">{t("gate.blocked", { n: blocked.length })}</h2>
              <p className="mt-1">{blocked[0]?.detail}</p>
            </section>
          ) : (
            <section className="rounded-3xl bg-soft p-4">
              <h2 className="text-xl">{t("gate.clear")}</h2>
            </section>
          )}

          <section className="rounded-3xl border border-line bg-surface p-4">
            <h2 className="text-xl">{t("gate.docs")}</h2>
            <ul className="mt-2 grid gap-2">
              {view.documents.map((doc) => (
                <li key={`${doc.kind}-${doc.reference}`} className="flex items-start justify-between gap-3 rounded-2xl bg-paper px-3 py-3">
                  <span>
                    <span className="block font-medium">{docLabel(doc.kind)}</span>
                    <span className="text-sm text-muted">{doc.reference}</span>
                    {doc.name_on_document ? <span className="block text-sm">{doc.name_on_document}</span> : null}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-sm ${doc.status === "verified" ? "bg-soft text-primary" : doc.status === "expired" || doc.status === "mismatch" ? "bg-rose-soft text-danger" : "bg-amber-soft text-warning"}`}>
                    {t(`gate.doc.${doc.status}`)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-2">
            <h2 className="text-xl">{t("gate.synced")}</h2>
            {view.portals.map((portal) => (
              <article key={portal.id} className="rounded-3xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg">{portal.name}</h3>
                    <p className="text-sm text-muted">{portal.scheme}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-sm ${TONE[portal.status]}`}>{t(`gate.status.${portal.status}`)}</span>
                </div>
                <p className="mt-2 text-base">{portal.detail}</p>
                <a className="mt-2 inline-flex min-h-11 items-center text-primary" href={portal.url}>
                  {t("gate.openPortal")}
                </a>
              </article>
            ))}
          </section>

          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard" className="inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-primary-fg">
              {t("gate.dashboard")}
            </Link>
            <button
              type="button"
              className="min-h-12 rounded-full px-4 ring-1 ring-line"
              onClick={() => {
                setPhase("ask");
                setAgree(false);
              }}
            >
              {t("gate.again")}
            </button>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
