import { Link } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { LANGS, type Lang } from "@/lib/beta/i18n";
import { useBeta } from "@/lib/beta/store";
import { useT } from "@/lib/beta/use-t";
import { UserButton } from "@/lib/auth/gates";
import { Card, Shell } from "@/components/beta/shell";

const study = [
  { to: "/applications", label: "mod.track" },
  { to: "/documents", label: "mod.wallet" },
  { to: "/payments", label: "mod.pay" },
  { to: "/notifications", label: "mod.alerts" },
  { to: "/verify-once", label: "mod.verify" },
  { to: "/readiness", label: "ready.title" },
  { to: "/checklist", label: "check.title" },
] as const;

const rows = [
  { to: "/saved-guidance", label: "saved.title" },
  { to: "/privacy", label: "foot.privacy" },
  { to: "/terms", label: "foot.terms" },
  { to: "/support", label: "nav.support" },
  { to: "/about", label: "foot.about" },
  { to: "/how-it-works", label: "nav.how" },
  { to: "/feedback", label: "dash.feedback" },
  { to: "/account/delete", label: "profile.delete" },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "JM";
  const letters = parts.slice(0, 2).map((part) => part[0] ?? "");
  return letters.join("").toUpperCase();
}

export function SettingsPage() {
  const { t, language, setLanguage } = useT();
  const profile = useBeta((state) => state.profile);
  const locker = useBeta((state) => state.locker);
  const entry = useBeta((state) => state.entry);
  const name = profile.fullName || locker?.student.legal_name || "";
  const who = name || (entry === "guest" ? t("set.guest") : t("set.you"));
  const place = [profile.district || locker?.student.district, profile.state || locker?.student.state_name].filter(Boolean).join(", ");
  const course = profile.course || locker?.student.course_name || "";

  return (
    <Shell>
      <h1 className="app-title">{t("set.title")}</h1>
      <p className="mt-2 text-base text-muted">{t("set.lead")}</p>

      <Link to="/profile" className="mt-5 flex items-center gap-3 rounded-3xl border border-line bg-surface p-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary font-display text-xl text-primary-fg">
          {initials(name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-medium">{who}</span>
          <span className="mt-0.5 block truncate text-sm text-muted">{course || place || t("profile.title")}</span>
          {place && course ? <span className="block truncate text-sm text-muted">{place}</span> : null}
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
      </Link>

      <div className="mt-3">
        <Card>
          <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-soft text-primary">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl">{t("set.locker")}</h2>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${locker ? "bg-soft text-primary" : "bg-paper text-muted"}`}>
                {locker ? t("set.lockerOn") : t("set.lockerOff")}
              </span>
            </div>
            {locker ? (
              <p className="mt-1 text-sm">
                {locker.student.legal_name}
                <span className="block text-muted">{locker.student.course_name}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">{t("set.lockerBody")}</p>
            )}
            <Link
              to="/connect"
              className={`mt-3 inline-flex min-h-11 items-center rounded-full px-4 ${locker ? "ring-1 ring-line" : "bg-primary text-primary-fg"}`}
            >
              {locker ? t("set.open") : t("gate.connect")}
            </Link>
          </div>
          </div>
        </Card>
      </div>

      <div className="mt-3">
        <Card>
          <h2 className="text-xl">{t("mod.track")}</h2>
          <div className="mt-3 grid gap-2">
            {study.map((row) => (
              <Link key={row.to} to={row.to} className="flex min-h-12 items-center justify-between rounded-2xl bg-paper px-3">
                <span>{t(row.label)}</span>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-3 grid gap-3">
        <Card>
          <h2 className="text-xl">{t("lang")}</h2>
          <label className="mt-3 block">
            <span className="sr-only">{t("lang")}</span>
            <select
              className="min-h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Lang)}
            >
              {LANGS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </Card>
        <Card>
          <h2 className="text-xl">{t("set.more")}</h2>
          <div className="mt-3">
            <UserButton />
          </div>
          <div className="mt-3 grid gap-2">
            {rows.map((row) => (
              <Link key={row.to} to={row.to} className="flex min-h-12 items-center justify-between rounded-2xl bg-paper px-3">
                <span>{t(row.label)}</span>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
