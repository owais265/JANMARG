import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { Bell, FolderOpen, Home, LayoutGrid, MessageCircle, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { ChatDock, setChatOpen } from "@/components/janmarg/chat-dock";
import { ADAPTER_LABEL, DATA_LABEL, notifications, tx, type AppLang, type DemoLang, type Pack } from "@/lib/janmarg/showcase";
import { useShowcase } from "@/lib/janmarg/showcase-store";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/schemes", label: "Schemes", icon: LayoutGrid },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/jago", label: "JAGO", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export const LANGS: { id: AppLang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "hinglish", label: "Hinglish" },
  { id: "bn", label: "বাংলা" },
  { id: "or", label: "ଓଡ଼ିଆ" },
  { id: "te", label: "తెలుగు" },
  { id: "ta", label: "தமிழ்" },
  { id: "mr", label: "मराठी" },
  { id: "gu", label: "ગુજરાતી" },
  { id: "as", label: "অসমীয়া" },
  { id: "kn", label: "ಕನ್ನಡ" },
  { id: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ" },
];

export function LangGrid() {
  const lang = useShowcase((state) => state.lang);
  const setLang = useShowcase((state) => state.setLang);
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Language">
      {LANGS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`min-h-11 rounded-full px-2 text-sm ${lang === item.id ? "bg-deep text-primary-fg" : "bg-surface ring-1 ring-line"}`}
          onClick={() => setLang(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export function useLang(): DemoLang {
  return useShowcase((state) => state.lang);
}

export function T({ pack }: { pack: Pack }) {
  const lang = useLang();
  return <>{tx(lang, pack)}</>;
}

export function Gate({ children }: { children: ReactNode }) {
  const role = useShowcase((state) => state.role);
  const onboarded = useShowcase((state) => state.onboarded);
  const path = useRouterState({ select: (state) => state.location.pathname });
  if (!role) return <Navigate to="/" />;
  if (!onboarded && path !== "/onboarding") return <Navigate to="/onboarding" />;
  return <>{children}</>;
}

export function Frame({ children, title }: { children: ReactNode; title?: string }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const unread = useShowcase((state) => notifications(state).filter((item) => !state.readNotes.includes(item.id)).length);
  return (
    <Gate>
      <div className="min-h-full text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:bg-surface focus:p-3">
          Skip to content
        </a>
        <header className="phone-head">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
            <Link to="/dashboard" className="flex min-h-11 items-center gap-3">
              <span className="mark" aria-hidden="true">
                JM
              </span>
              <span>
                <span className="block font-display text-lg leading-none">JANMARG</span>
                <span className="block text-sm text-muted">{title ?? "Understand. Verify. Recover. Track."}</span>
              </span>
            </Link>
            <Link to="/notifications" className="relative grid size-11 place-items-center rounded-full bg-surface ring-1 ring-line" aria-label="Notifications">
              <Bell className="size-5" aria-hidden="true" />
              {unread > 0 ? (
                <span className="absolute top-1 right-1 min-w-4 rounded-full bg-marigold px-1 text-center text-xs text-deep">{unread}</span>
              ) : null}
            </Link>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-xl space-y-4 px-4 pt-4 pb-28">
          {children}
          <p className="text-sm leading-relaxed text-muted">{DATA_LABEL}</p>
        </main>
        <nav className="phone-nav" aria-label="Primary">
          <ul className="nav-pill mx-auto max-w-xl">
            {nav.map((item) => {
              const active = item.to !== "/jago" && (path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to)));
              const Icon = item.icon;
              if (item.to === "/jago") {
                return (
                  <li key={item.to} className="flex-1">
                    <button type="button" className="flex min-h-14 w-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted" onClick={() => setChatOpen(true)}>
                      <Icon className="size-5" aria-hidden="true" />
                      JAGO
                    </button>
                  </li>
                );
              }
              return (
                <li key={item.to} className="flex-1">
                  <Link
                    to={item.to as never}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-primary" : "text-muted"}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <ChatDock />
      </div>
    </Gate>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>{children}</section>;
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-soft px-3 py-2 text-sm leading-relaxed text-warning ring-1 ring-line">
      {children ?? ADAPTER_LABEL}
    </p>
  );
}

export function AdapterNote() {
  return <Notice>{ADAPTER_LABEL}</Notice>;
}

export function Pill({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" | "ok" | "bad" }) {
  const map = {
    info: "bg-soft text-primary",
    warn: "bg-amber-soft text-warning",
    ok: "bg-soft text-primary",
    bad: "bg-rose-soft text-danger",
  } as const;
  return <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-sm font-medium ${map[tone]}`}>{children}</span>;
}

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to as never} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-base font-medium text-primary-fg">
      {children}
    </Link>
  );
}

export function GhostLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to as never} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-surface px-4 text-base font-medium text-ink ring-1 ring-line">
      {children}
    </Link>
  );
}
