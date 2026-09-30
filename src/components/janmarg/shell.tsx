import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Ellipsis, FolderOpen, Home } from "lucide-react";
import type { ReactNode } from "react";
import { JagoDock } from "@/components/janmarg/jago-dock";
import { t } from "@/lib/janmarg/copy";
import { useAccountGate } from "@/lib/janmarg/account";
import { useJanmarg } from "@/lib/janmarg/store";

const items = [
  { to: "/dashboard", key: "nav.home", icon: Home },
  { to: "/documents", key: "nav.documents", icon: FolderOpen },
  { to: "/notifications", key: "nav.alerts", icon: Bell },
  { to: "/profile", key: "nav.more", icon: Ellipsis },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const lang = useJanmarg((state) => state.data.lang);
  const setLang = useJanmarg((state) => state.setLang);
  const personaId = useJanmarg((state) => state.data.personaId);
  const profile = useJanmarg((state) => (personaId ? state.data.profiles[personaId] : null));
  const unread = useJanmarg(
    (state) => state.data.notifications.filter((item) => item.personaId === personaId && !item.read).length,
  );
  const path = useRouterState({ select: (state) => state.location.pathname });
  const session = useAccountGate().session;
  const first = profile?.legalName.split(" ")[0] ?? "Student";

  return (
    <div className="min-h-full text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:bg-surface focus:p-3">
        {t(lang, "skip")}
      </a>
      <header className="phone-head">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="mark" aria-hidden="true">
              JM
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg leading-none text-ink">JANMARG</p>
              <p className="truncate text-sm text-muted">{first}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session && !session.guest && session.email ? (
              <span className="hidden max-w-40 truncate rounded-full bg-soft px-2 py-1 text-[11px] font-medium text-primary sm:inline">
                {session.email}
              </span>
            ) : null}
            <div className="flex rounded-full bg-surface p-1 ring-1 ring-line" aria-label={t(lang, "more.language")}>
              <button
                type="button"
                className={`min-h-9 rounded-full px-3 text-sm font-medium ${lang === "en" ? "bg-deep text-primary-fg" : "text-ink"}`}
                onClick={() => setLang("en")}
              >
                {t(lang, "lang.en")}
              </button>
              <button
                type="button"
                className={`min-h-9 rounded-full px-3 text-sm font-medium ${lang === "hi" ? "bg-deep text-primary-fg" : "text-ink"}`}
                onClick={() => setLang("hi")}
              >
                {t(lang, "lang.hi")}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-xl overflow-x-clip px-4 pt-4 pb-6">
        {children}
      </main>
      <nav className="phone-nav" aria-label={t(lang, "nav.menu")}>
        <ul className="nav-pill mx-auto max-w-xl">
          {items.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? "text-primary" : "text-muted"}`}
                >
                  <span className={`relative grid size-8 place-items-center rounded-full ${active ? "bg-soft" : ""}`}>
                    <Icon className="size-4" aria-hidden="true" />
                    {item.to === "/notifications" && unread > 0 ? (
                      <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-marigold px-1 text-center text-[10px] text-deep tabular-nums">
                        {unread}
                      </span>
                    ) : null}
                  </span>
                  {t(lang, item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <JagoDock />
    </div>
  );
}
