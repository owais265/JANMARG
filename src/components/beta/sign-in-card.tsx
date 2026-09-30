import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { signIn as signInWithSupabase } from "@/lib/janmarg/account";
import { randomStudentId } from "@/lib/beta/locker";
import { useBeta } from "@/lib/beta/store";
import { useT } from "@/lib/beta/use-t";
import { Field, inputClass } from "@/components/beta/shell";

export function SignInCard() {
  const { t } = useT();
  const navigate = useNavigate();
  const enterGuest = useBeta((state) => state.enterGuest);
  const markAccount = useBeta((state) => state.markAccount);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function goNext() {
    const seen = useBeta.getState().guideSeen;
    void navigate({ to: seen ? "/dashboard" : "/guide" });
  }

  function goGuest() {
    enterGuest(randomStudentId());
    goNext();
  }

  return (
    <section className="grid max-w-md gap-3 rounded-3xl border border-line bg-surface p-4 shadow-[0_12px_40px_rgba(16,36,28,0.06)]">
      <div>
        <h2 className="font-display text-3xl">{t("login.title")}</h2>
        <p className="mt-1 text-base text-muted">{t("auth.lead")}</p>
      </div>
      <button type="button" className="min-h-12 rounded-full bg-primary px-5 text-primary-fg" onClick={goGuest}>
        {t("gate.guest")}
      </button>
      <p className="text-sm text-muted">{t("auth.guestNote")}</p>
      <div className="flex items-center gap-3 text-sm text-faint">
        <span className="h-px flex-1 bg-line" />
        {t("gate.or")}
        <span className="h-px flex-1 bg-line" />
      </div>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setBusy(true);
          void (async () => {
            try {
              await signInWithSupabase(email, password);
              markAccount();
              goNext();
              return;
            } catch {
              /* Fall through to the app account if this email is not on Supabase yet. */
            }
            const result = await authClient.signIn.email({ email, password, callbackURL: "/guide" });
            setBusy(false);
            if (result.error) {
              setError("login.fail");
              return;
            }
            markAccount();
            goNext();
          })();
        }}
      >
        <Field label={t("common.email")}>
          <input type="email" required autoComplete="email" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label={t("common.password")}>
          <input type="password" required autoComplete="current-password" className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        {error ? <p className="text-danger">{t(error)}</p> : null}
        <button className="min-h-12 rounded-full bg-deep text-primary-fg disabled:opacity-60" type="submit" disabled={busy}>
          {t("login.title")}
        </button>
      </form>
      {authEnabled ? (
        <div className="grid gap-2">
          {GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              className="min-h-12 rounded-full bg-paper ring-1 ring-line"
              onClick={() => {
                markAccount();
                signIn(provider.providerId, { callbackURL: "/guide" });
              }}
            >
              {t("common.with")} {provider.label}
            </button>
          ))}
        </div>
      ) : null}
      <Link to="/signup" className="inline-flex min-h-11 items-center justify-center text-sm text-primary">
        {t("login.create")}
      </Link>
    </section>
  );
}

export function AuthScreen() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-deep px-5 py-10 text-primary-fg">
      <div className="flex flex-1 flex-col items-center justify-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary-fg font-display text-2xl text-deep">JM</span>
        <p className="mt-4 font-display text-4xl tracking-tight">JANMARG</p>
      </div>
      <div className="pb-6 text-ink">
        <SignInCard />
      </div>
    </div>
  );
}
