import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { t } from "@/lib/janmarg/copy";
import type { EligibilityStatus, Lang } from "@/lib/janmarg/types";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const look =
    variant === "primary"
      ? "bg-primary text-primary-fg shadow-[0_8px_20px_rgba(20,107,69,0.22)]"
      : variant === "secondary"
        ? "border border-line bg-surface text-ink"
        : "text-ink";
  return (
    <button
      className={`press inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-base font-medium disabled:opacity-50 ${look} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  to,
  params,
  children,
  variant = "primary",
  className = "",
}: {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const look =
    variant === "primary"
      ? "bg-marigold text-deep shadow-[0_8px_20px_rgba(227,155,43,0.28)]"
      : variant === "secondary"
        ? "border border-line bg-surface text-ink"
        : "text-ink";
  return (
    <Link
      to={to}
      params={params}
      className={`press inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-base font-medium ${look} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <section
      style={style}
      className={`rounded-2xl border border-line bg-surface p-4 shadow-[0_10px_30px_rgba(20,36,28,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "ok" | "wait" | "no" | "bad" | "neutral";
}) {
  const look =
    tone === "ok"
      ? "bg-soft text-primary"
      : tone === "wait"
        ? "bg-[#f8edd6] text-warning"
        : tone === "bad"
          ? "bg-[#f8e4df] text-danger"
          : tone === "no"
            ? "bg-[#ece7df] text-muted"
            : "bg-[#ece7df] text-muted";
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-medium ${look}`}>{children}</span>
  );
}

export function statusTone(status: EligibilityStatus): "ok" | "wait" | "no" | "bad" {
  if (status === "likelyEligible") return "ok";
  if (status === "needsEvidence") return "wait";
  if (status === "unavailable") return "bad";
  return "no";
}

export function Field({ label, value, source }: { label: string; value: string; source?: string }) {
  return (
    <div className="border-t border-line py-3 first:border-t-0">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-base text-ink">{value}</p>
      {source ? <p className="text-sm text-faint">{source}</p> : null}
    </div>
  );
}

export function LoadingBlock({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-3" aria-live="polite">
      <p className="text-base text-muted">{t(lang, "common.loading")}</p>
      <div className="h-28 animate-pulse rounded-2xl bg-line" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-2xl bg-line" />
        <div className="h-24 animate-pulse rounded-2xl bg-line" />
      </div>
    </div>
  );
}

export function StateBlock({
  lang,
  kind,
  onRetry,
  title,
  body,
  action,
}: {
  lang: Lang;
  kind: "error" | "offline" | "denied" | "empty";
  onRetry?: () => void;
  title?: string;
  body?: string;
  action?: ReactNode;
}) {
  const Icon = kind === "offline" ? WifiOff : AlertTriangle;
  const fallbackTitle =
    kind === "error"
      ? "common.errorTitle"
      : kind === "offline"
        ? "common.offlineTitle"
        : kind === "denied"
          ? "common.deniedTitle"
          : "common.emptyTitle";
  const fallbackBody =
    kind === "error" ? "common.errorBody" : kind === "offline" ? "common.offlineBody" : "common.deniedBody";
  return (
    <Card>
      <Icon className="size-6 text-ink" aria-hidden="true" />
      <h2 className="mt-3 text-2xl text-ink">{title ?? t(lang, fallbackTitle)}</h2>
      <p className="mt-2 text-base text-muted">{body ?? (kind === "empty" ? "" : t(lang, fallbackBody))}</p>
      {onRetry ? (
        <Button className="mt-4 w-full" variant="secondary" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          {t(lang, "common.retry")}
        </Button>
      ) : null}
      {action}
    </Card>
  );
}

export function ProgressRing({ done, total }: { done: number; total: number }) {
  const ratio = total === 0 ? 0 : done / total;
  const radius = 26;
  const c = 2 * Math.PI * radius;
  const dash = `${c * ratio} ${c}`;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" className="shrink-0">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#e39b2b"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={dash}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fill="#f7f3ea" fontSize="13" fontFamily="Outfit, sans-serif">
        {done}/{total}
      </text>
    </svg>
  );
}
