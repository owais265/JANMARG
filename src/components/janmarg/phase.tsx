import { useEffect, useState } from "react";
import { useJanmarg } from "@/lib/janmarg/store";

export function usePhase(live: boolean) {
  const ready = useJanmarg((state) => state.ready);
  const connection = useJanmarg((state) => state.data.connection);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!ready) return;
    setPhase("loading");
    const id = window.setTimeout(() => {
      setPhase(live && connection === "sourceUnavailable" ? "error" : "ready");
    }, 280);
    return () => window.clearTimeout(id);
  }, [ready, connection, live, attempt]);

  const mode = !ready || phase === "loading" ? "loading" : phase === "error" ? "error" : "ready";
  return {
    mode: mode as "loading" | "error" | "ready",
    offline: connection === "offline",
    connection,
    retry: () => setAttempt((value) => value + 1),
  };
}
