import { Link, useParams } from "@tanstack/react-router";
import { Bell, ChevronRight, FolderOpen, Route, ShieldCheck, Wallet } from "lucide-react";
import { type SchemeCode } from "@/lib/beta/content";
import {
  alertsFor,
  isSchemeCode,
  journeyIndex,
  JOURNEY,
  paymentsFor,
  reuseOf,
  tracksFor,
  type Journey,
  type PayTone,
} from "@/lib/beta/module";
import { useBeta } from "@/lib/beta/store";
import { useT } from "@/lib/beta/use-t";
import { Card } from "@/components/beta/shell";

const PREFIX: Record<SchemeCode, string> = {
  "pre-matric": "pre",
  "post-matric": "post",
  "top-class": "top",
  nfst: "nfst",
  nos: "nos",
};

const SHORT: Record<SchemeCode, string> = {
  "pre-matric": "mod.short.pre",
  "post-matric": "mod.short.post",
  "top-class": "mod.short.top",
  nfst: "mod.short.nfst",
  nos: "mod.short.nos",
};

function schemeName(code: SchemeCode, t: (key: string) => string) {
  return t(`sch.${PREFIX[code]}.name`);
}

function shortName(code: SchemeCode, t: (key: string) => string) {
  return t(SHORT[code]);
}

function Dots({ journey, held, started }: { journey: Journey; held: boolean; started: boolean }) {
  const current = started ? journeyIndex(journey) : -1;
  return (
    <span className="mt-1.5 flex gap-1" aria-hidden>
      {JOURNEY.map((step, index) => (
        <span
          key={step}
          className={`h-1 w-4 rounded-full ${index === current && held ? "bg-marigold" : index <= current ? "bg-primary" : "bg-line"}`}
        />
      ))}
    </span>
  );
}

function Stepper({ journey, held }: { journey: Journey; held: boolean }) {
  const { t } = useT();
  const current = journeyIndex(journey);
  return (
    <ol className="mt-3 grid grid-cols-4 gap-1">
      {JOURNEY.map((step, index) => {
        const on = index <= current;
        const hot = index === current && held;
        return (
          <li key={step}>
            <span className={`block h-1.5 rounded-full ${hot ? "bg-marigold" : on ? "bg-primary" : "bg-line"}`} />
            <span className={`mt-1 block text-xs ${on ? "text-ink" : "text-muted"}`}>{t(`mod.step.${step}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function ScholarshipHome() {
  const { t } = useT();
  const profile = useBeta((state) => state.profile);
  const locker = useBeta((state) => state.locker);
  const seen = useBeta((state) => state.seenAlerts ?? []);
  const tracks = tracksFor(locker);
  const alerts = alertsFor(locker);
  const unread = alerts.filter((item) => item.tone === "action" && !seen.includes(item.id)).length;
  const held = tracks.find((track) => track.held);
  const first = profile.fullName?.split(" ")[0] || locker?.student.legal_name.split(" ")[0] || "";
  const shortcuts = [
    { to: "/applications" as const, icon: Route, label: "mod.chip.track" },
    { to: "/documents" as const, icon: FolderOpen, label: "mod.chip.wallet" },
    { to: "/payments" as const, icon: Wallet, label: "mod.chip.pay" },
    { to: "/notifications" as const, icon: Bell, label: "mod.chip.alerts", badge: unread },
  ];
  return (
    <div>
      <h1 className="app-title">
        {t("dash.hello")}
        {first ? `, ${first}` : ""}
      </h1>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {shortcuts.map((item) => (
          <Link key={item.to} to={item.to} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-surface py-2 ring-1 ring-line">
            <span className="relative text-primary">
              <item.icon className="size-5" aria-hidden />
              {"badge" in item && item.badge ? (
                <span className="absolute -top-1.5 -right-2 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-xs leading-4 text-primary-fg">
                  {item.badge}
                </span>
              ) : null}
            </span>
            <span className="text-xs font-medium">{t(item.label)}</span>
          </Link>
        ))}
      </div>
      {held ? (
        <Link to="/applications/$applicationId" params={{ applicationId: held.code }} className="mt-3 block rounded-2xl bg-amber-soft px-4 py-3">
          <p className="text-xs font-medium text-warning">{t("mod.held")}</p>
          <p className="mt-0.5 font-medium">{shortName(held.code, t)}</p>
          <p className="mt-1 line-clamp-2 text-sm">{held.note}</p>
        </Link>
      ) : null}
      <div className="mt-4 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        <p className="px-4 pt-3 pb-1 text-xs font-medium tracking-wide text-muted uppercase">{t("mod.allFive")}</p>
        {tracks.map((track) => (
          <Link
            key={track.code}
            to="/applications/$applicationId"
            params={{ applicationId: track.code }}
            className="flex min-h-14 items-center gap-3 border-t border-line px-4 py-3"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{shortName(track.code, t)}</span>
              <Dots journey={track.journey} held={track.held} started={Boolean(track.note) || track.held || track.journey !== "prepare"} />
            </span>
            <span className={`shrink-0 text-xs ${track.held ? "text-warning" : "text-muted"}`}>
              {track.held ? t("mod.held") : track.journey === "prepare" && !track.note ? t("mod.noLocker") : t(`mod.step.${track.journey}`)}
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
          </Link>
        ))}
        <Link to="/verify-once" className="flex min-h-14 items-center gap-3 border-t border-line px-4">
          <ShieldCheck className="size-5 text-primary" aria-hidden />
          <span className="flex-1 font-medium">{t("mod.verify")}</span>
          <ChevronRight className="size-4 text-muted" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function TrackIndex() {
  const { t } = useT();
  const locker = useBeta((state) => state.locker);
  const tracks = tracksFor(locker);
  return (
    <div>
      <h1 className="app-title">{t("mod.track")}</h1>
      <div className="mt-4 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        {tracks.map((track) => (
          <Link key={track.code} to="/applications/$applicationId" params={{ applicationId: track.code }} className="flex min-h-14 items-center gap-3 border-t border-line px-4 py-3 first:border-t-0">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{shortName(track.code, t)}</span>
              <Dots journey={track.journey} held={track.held} started={Boolean(track.note) || track.held || track.journey !== "prepare"} />
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ApplicationView() {
  const { t } = useT();
  const { applicationId } = useParams({ strict: false }) as { applicationId?: string };
  const locker = useBeta((state) => state.locker);
  const code = applicationId && isSchemeCode(applicationId) ? applicationId : null;
  if (!code) {
    return (
      <div>
        <h1 className="app-title">{t("scheme.missing")}</h1>
        <Link to="/applications" className="mt-4 inline-flex min-h-11 items-center text-primary">{t("mod.track")}</Link>
      </div>
    );
  }
  const track = tracksFor(locker).find((item) => item.code === code);
  if (!track) return null;
  return (
    <div>
      <Link to="/applications" className="inline-flex min-h-11 items-center text-sm text-primary">{t("mod.track")}</Link>
      <p className="mt-2 text-sm text-muted">{t("mod.practice")}</p>
      <h1 className="mt-1 app-title">{schemeName(code, t)}</h1>
      {track.held ? <p className="mt-3 inline-flex min-h-10 items-center rounded-full bg-amber-soft px-3 text-warning">{t("mod.held")}</p> : null}
      <Card>
        <h2 className="text-xl">{t("mod.timeline")}</h2>
        <Stepper journey={track.journey} held={track.held} />
        <p className="mt-3 text-sm">{track.note || (locker ? t("mod.noFile") : t("mod.noLocker"))}</p>
      </Card>
      {track.portals.length ? (
        <div className="mt-3">
          <Card>
            <h2 className="text-xl">{t("mod.sources")}</h2>
            <div className="mt-2 grid gap-2">
              {track.portals.map((portal) => (
                <div key={portal.id} className="rounded-2xl bg-paper px-3 py-2">
                  <p className="font-medium">{portal.name}</p>
                  <p className="text-sm text-muted">{t(`gate.status.${portal.status}`)}</p>
                  <p className="mt-1 text-sm">{portal.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/readiness/$schemeCode" params={{ schemeCode: code }} className="inline-flex min-h-12 items-center rounded-full bg-primary px-4 text-primary-fg">
          {t("dash.open")}
        </Link>
        <Link to="/checklist" className="inline-flex min-h-12 items-center rounded-full px-4 ring-1 ring-line">{t("check.title")}</Link>
        <Link to="/jago" className="inline-flex min-h-12 items-center px-2">{t("mod.ask")}</Link>
      </div>
      <p className="mt-4 text-sm text-muted">{t("mod.notOfficial")}</p>
    </div>
  );
}

export function WalletIndex() {
  const { t } = useT();
  const locker = useBeta((state) => state.locker);
  return (
    <div>
      <h1 className="app-title">{t("mod.wallet")}</h1>
      <p className="mt-2 text-sm text-muted">{t("mod.practice")}</p>
      {!locker ? (
        <div className="mt-4">
          <Card>
            <p>{t("mod.walletEmpty")}</p>
            <Link to="/connect" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-primary-fg">{t("gate.connect")}</Link>
          </Card>
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {locker.documents.map((doc) => (
            <Link key={doc.kind} to="/documents/$documentId" params={{ documentId: doc.kind }} className="rounded-3xl border border-line bg-surface p-4">
              <span className="block text-lg font-medium">{t(`mod.doc.${doc.kind}`)}</span>
              <span className="mt-1 block text-sm text-muted">{t(`mod.docStatus.${doc.status}`)}</span>
              <span className="mt-1 block text-sm">{reuseOf(doc) === "ready" ? t("mod.reuseReady") : t("mod.reuseFix")}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentView() {
  const { t } = useT();
  const { documentId } = useParams({ strict: false }) as { documentId?: string };
  const locker = useBeta((state) => state.locker);
  const doc = locker?.documents.find((item) => item.kind === documentId);
  if (!doc || !locker) {
    return (
      <div>
        <h1 className="app-title">{t("mod.wallet")}</h1>
        <p className="mt-3">{t("mod.verifyEmpty")}</p>
        <Link to="/documents" className="mt-3 inline-flex min-h-11 items-center text-primary">{t("mod.wallet")}</Link>
      </div>
    );
  }
  return (
    <div>
      <Link to="/documents" className="inline-flex min-h-11 items-center text-sm text-primary">{t("mod.wallet")}</Link>
      <h1 className="mt-2 app-title">{t(`mod.doc.${doc.kind}`)}</h1>
      <p className="mt-3 inline-flex min-h-10 items-center rounded-full bg-soft px-3">{t(`mod.docStatus.${doc.status}`)}</p>
      <Card>
        <p className="text-sm text-muted">{t("mod.ref")}</p>
        <p className="text-lg">{doc.reference}</p>
        <p className="mt-3 text-sm text-muted">{t("mod.profileName")}</p>
        <p>{locker.student.legal_name}</p>
        <p className="mt-3 text-sm text-muted">{t("mod.nameOn")}</p>
        <p>{doc.name_on_document || t("common.notSet")}</p>
        <p className="mt-3 text-sm">{reuseOf(doc) === "ready" ? t("mod.reuseReady") : t("mod.reuseFix")}</p>
      </Card>
      <p className="mt-4 text-sm text-muted">{t("mod.notOfficial")}</p>
    </div>
  );
}

const PAY_KEY: Record<PayTone, string> = {
  held: "mod.pay.held",
  waiting: "mod.pay.waiting",
  empty: "mod.pay.empty",
  clear: "mod.pay.clear",
};

export function PaymentsView() {
  const { t } = useT();
  const locker = useBeta((state) => state.locker);
  const rows = paymentsFor(locker);
  return (
    <div>
      <h1 className="app-title">{t("mod.pay")}</h1>
      <p className="mt-2 text-sm text-muted">{t("mod.payNote")}</p>
      {!locker ? <p className="mt-4">{t("mod.emptyPay")}</p> : null}
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <Link key={row.code} to="/applications/$applicationId" params={{ applicationId: row.code }} className="rounded-3xl border border-line bg-surface p-4">
            <span className="block text-lg font-medium">{schemeName(row.code, t)}</span>
            <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs ${row.tone === "held" ? "bg-amber-soft text-warning" : "bg-soft text-primary"}`}>
              {t(PAY_KEY[row.tone])}
            </span>
            {row.note ? <span className="mt-2 block text-sm text-muted">{row.note}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AlertsView() {
  const { t } = useT();
  const locker = useBeta((state) => state.locker);
  const seen = useBeta((state) => state.seenAlerts ?? []);
  const seeAlert = useBeta((state) => state.seeAlert);
  const seeAlerts = useBeta((state) => state.seeAlerts);
  const items = alertsFor(locker);
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <h1 className="app-title">{t("mod.alerts")}</h1>
        {items.length ? (
          <button type="button" className="min-h-11 text-sm text-primary" onClick={() => seeAlerts(items.map((item) => item.id))}>
            {t("mod.markRead")}
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted">{t("mod.practice")}</p>
      {items.length === 0 ? <p className="mt-4">{t("mod.alertsEmpty")}</p> : null}
      <div className="mt-4 grid gap-2">
        {items.map((item) => {
          const fresh = !seen.includes(item.id);
          const body = item.body || (item.idParam ? t(`mod.doc.${item.idParam}`) : t("mod.connectBody"));
          const className = "block rounded-3xl border border-line bg-surface p-4";
          const inner = (
            <>
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{t(item.titleKey)}</span>
                {fresh ? <span className="size-2 shrink-0 rounded-full bg-marigold" /> : null}
              </span>
              <span className="mt-1 block text-sm text-muted">{body}</span>
            </>
          );
          if (item.to === "/applications/$applicationId" && item.idParam) {
            return (
              <Link key={item.id} to="/applications/$applicationId" params={{ applicationId: item.idParam }} onClick={() => seeAlert(item.id)} className={className}>
                {inner}
              </Link>
            );
          }
          if (item.to === "/documents/$documentId" && item.idParam) {
            return (
              <Link key={item.id} to="/documents/$documentId" params={{ documentId: item.idParam }} onClick={() => seeAlert(item.id)} className={className}>
                {inner}
              </Link>
            );
          }
          return (
            <Link key={item.id} to="/connect" onClick={() => seeAlert(item.id)} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function VerifyOnceView() {
  const { t } = useT();
  const locker = useBeta((state) => state.locker);
  return (
    <div>
      <h1 className="app-title">{t("mod.verify")}</h1>
      <p className="mt-2 text-sm">{t("mod.verifyLead")}</p>
      {!locker || locker.documents.length === 0 ? (
        <div className="mt-4">
          <Card>
            <p>{t("mod.verifyEmpty")}</p>
            <Link to="/connect" className="mt-3 inline-flex min-h-11 items-center text-primary">{t("gate.connect")}</Link>
          </Card>
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {locker.documents.map((doc) => {
            const ready = reuseOf(doc) === "ready";
            return (
              <Link key={doc.kind} to="/documents/$documentId" params={{ documentId: doc.kind }} className="rounded-3xl border border-line bg-surface p-4">
                <span className="block text-lg font-medium">{t(`mod.doc.${doc.kind}`)}</span>
                <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs ${ready ? "bg-soft text-primary" : "bg-amber-soft text-warning"}`}>
                  {ready ? t("mod.reuseReady") : t("mod.reuseFix")}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
