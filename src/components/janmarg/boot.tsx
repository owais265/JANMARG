import { useEffect } from "react";
import { profileFromAccount, restoreAccount, useAccountGate } from "@/lib/janmarg/account";
import { useJanmarg } from "@/lib/janmarg/store";

export function Boot() {
  const setReady = useJanmarg((state) => state.setReady);
  const adoptAccount = useJanmarg((state) => state.adoptAccount);
  const lang = useJanmarg((state) => state.data.lang);
  const accountGate = useAccountGate();

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        await useJanmarg.persist.rehydrate();
        await restoreAccount();
      } finally {
        if (live) setReady(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [setReady]);

  useEffect(() => {
    const account = accountGate.account;
    if (!accountGate.ready || !account?.profile_complete) return;
    const data = useJanmarg.getState().data;
    if (data.personaId === account.user_id && data.otpVerified && data.consentAccepted) return;
    adoptAccount(profileFromAccount(account), account.file);
  }, [accountGate.ready, accountGate.account, adoptAccount]);

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  return null;
}
