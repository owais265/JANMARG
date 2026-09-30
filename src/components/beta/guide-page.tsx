import { useNavigate, Navigate } from "@tanstack/react-router";
import { Compass, Home, Layers, MessageCircle, Settings, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useBeta } from "@/lib/beta/store";
import { useT } from "@/lib/beta/use-t";

const cards = [
  { icon: Home, title: "guide.dash.t", body: "guide.dash.b" },
  { icon: Layers, title: "guide.schemes.t", body: "guide.schemes.b" },
  { icon: Compass, title: "guide.ready.t", body: "guide.ready.b" },
  { icon: MessageCircle, title: "guide.jago.t", body: "guide.jago.b" },
  { icon: Settings, title: "guide.set.t", body: "guide.set.b" },
  { icon: ShieldCheck, title: "guide.lock.t", body: "guide.lock.b" },
] as const;

export function GuidePage() {
  const navigate = useNavigate();
  const { t } = useT();
  const session = useCurrentUserState();
  const entry = useBeta((state) => state.entry);
  const guideSeen = useBeta((state) => state.guideSeen);
  const [index, setIndex] = useState(0);
  const signed = Boolean(session.user) || entry !== "none";

  if (!session.isPending && !signed) return <Navigate to="/login" />;
  if (!session.isPending && signed && guideSeen) return <Navigate to="/dashboard" />;

  const card = cards[index] ?? cards[0];
  const Icon = card.icon;
  const last = index >= cards.length - 1;

  function finish() {
    useBeta.getState().markGuide();
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-deep text-primary-fg">
      <div className="flex items-center justify-between px-4 pt-4">
        <p className="text-sm text-primary-fg/70">{t("guide.step", { n: index + 1, total: cards.length })}</p>
        <button
          type="button"
          className="min-h-11 rounded-full px-4 text-sm ring-1 ring-primary-fg/30"
          onClick={finish}
        >
          {t("guide.skip")}
        </button>
      </div>
      <button
        type="button"
        className="flex min-h-0 flex-1 flex-col px-6 pt-6 pb-8 text-left"
        onClick={() => {
          if (last) finish();
          else setIndex(index + 1);
        }}
      >
        <span className="my-auto block">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-fg">
            <Icon className="size-7" aria-hidden />
          </span>
          <h1 className="mt-6 font-display text-4xl">{t(card.title)}</h1>
          <p className="mt-3 max-w-sm text-lg leading-snug text-primary-fg/85">{t(card.body)}</p>
        </span>
        <span className="pt-8 text-sm text-primary-fg/70">{last ? t("guide.start") : t("guide.tap")}</span>
        <span className="mt-4 flex gap-1.5" aria-hidden>
          {cards.map((item, dot) => (
            <span key={item.title} className={`h-1.5 flex-1 rounded-full ${dot === index ? "bg-marigold" : "bg-primary-fg/25"}`} />
          ))}
        </span>
      </button>
    </div>
  );
}
