import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Home, Layers, MessageCircle, Settings } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { MAINTENANCE_MODE } from "@/lib/beta/content";
import { htmlLang } from "@/lib/beta/i18n";
import { alertsFor } from "@/lib/beta/module";
import { useT } from "@/lib/beta/use-t";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useBeta } from "@/lib/beta/store";

const deskSchemes = ["Pre-Matric", "Post-Matric", "Top Class", "NFST", "Overseas"];

function DeskMark() {
  return (
    <aside className="stage-aside">
      <p className="text-sm tracking-[0.18em] text-[#e7d7b4] uppercase">Ministry of Tribal Affairs</p>
      <div>
        <h1 className="font-display text-7xl leading-none text-[#f7f3ea]">JANMARG</h1>
        <p className="mt-4 max-w-md text-lg text-[#d9e4db]">
          One student path across five scholarships. See what is stuck, what is verified, and when money moves.
        </p>
      </div>
      <ol className="max-w-sm space-y-2">
        {deskSchemes.map((name, index) => (
          <li key={name} className="flex items-center gap-3 text-[#f4efe4]">
            <span className="grid size-7 place-items-center rounded-full bg-white/10 text-sm text-[#e39b2b] tabular-nums">{index + 1}</span>
            {name}
          </li>
        ))}
      </ol>
      <p className="max-w-md text-sm leading-relaxed text-[#c9d5cc]">
        A practice file for students. JANMARG does not decide eligibility, sanction, or payment, and it does not store an Aadhaar number.
      </p>
    </aside>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <DeskMark />
      <div className="stage-clip">
        <div className="phone-frame">{children}</div>
      </div>
    </div>
  );
}

const tabs = [
  { to: "/dashboard", label: "nav.dashboard", icon: Home, match: (path: string) => path === "/" || path.startsWith("/dashboard") },
  { to: "/schemes", label: "nav.schemes", icon: Layers, match: (path: string) => path.startsWith("/schemes") },
  { to: "/jago", label: "dash.jago", icon: MessageCircle, match: (path: string) => path.startsWith("/jago") },
  { to: "/settings", label: "nav.settings", icon: Settings, match: (path: string) => path.startsWith("/settings") || path.startsWith("/profile") },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useCurrentUserState();
  const inside = useBeta((state) => Boolean(state.locker) || state.profile.onboarded || state.entry !== "none");
  const locker = useBeta((state) => state.locker);
  const seenAlerts = useBeta((state) => state.seenAlerts ?? []);
  const unread = alertsFor(locker).filter((item) => item.tone === "action" && !seenAlerts.includes(item.id)).length;
  const { t, language } = useT();
  const chat = path === "/jago";
  const bare = path === "/" || path === "/login" || path === "/signup" || path === "/guide";
  useEffect(() => {
    document.documentElement.lang = htmlLang(language);
  }, [language]);
  if (bare) {
    return (
      <Frame>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">
          {t("skip")}
        </a>
        <main id="main" className="app-scroll flex min-h-0 flex-1 flex-col">
          {children}
        </main>
      </Frame>
    );
  }
  return (
    <Frame>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">
          {t("skip")}
        </a>
        {MAINTENANCE_MODE ? (
          <p className="shrink-0 bg-amber-soft px-3 py-1 text-center text-xs text-warning">{t("maint")}</p>
        ) : null}
        <header className="phone-head shrink-0">
          <div className="flex h-14 items-center gap-2 px-4">
            <Link to={user || inside ? "/dashboard" : "/"} className="flex min-h-11 items-center gap-2">
              <span className="mark">JM</span>
              <span className="font-display text-lg leading-none">JANMARG</span>
            </Link>
            <Link to="/notifications" aria-label={t("mod.alerts")} className="relative ml-auto grid size-11 place-items-center rounded-full text-ink">
              <Bell className="size-5" aria-hidden />
              {unread > 0 ? (
                <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-xs leading-4 text-primary-fg">
                  {unread}
                </span>
              ) : null}
            </Link>
          </div>
        </header>
        <main id="main" className={chat ? "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-none" : "app-scroll min-h-0 flex-1 px-4 py-4"}>
          {chat ? <div className="flex min-h-0 flex-1 flex-col">{children}</div> : children}
        </main>
        <nav className="phone-nav shrink-0" aria-label="Primary">
          <ul className="nav-pill">
            {tabs.map((item) => {
              const active = item.match(path);
              const Icon = item.icon;
              const dest = item.to === "/dashboard" && !user && !inside ? "/" : item.to;
              return (
                <li key={item.to} className="flex-1">
                  <Link
                    to={dest}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${active ? "text-primary" : "text-muted"}`}
                  >
                    <Icon className="size-5" aria-hidden />
                    {item.to === "/jago" ? "JAGO" : t(item.label)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
    </Frame>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-line bg-surface p-4">{children}</section>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-base">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "min-h-12 w-full rounded-xl border border-line bg-paper px-3 text-base";

export function ClosedPage() {
  const { t } = useT();
  return (
    <Shell>
      <h1 className="app-title">{t("mod.closedTitle")}</h1>
      <p className="mt-3 max-w-xl text-lg">{t("mod.closedBody")}</p>
      <Link to="/schemes" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-primary-fg">
        {t("closed.cta")}
      </Link>
    </Shell>
  );
}
