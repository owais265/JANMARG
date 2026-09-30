import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowUp, Download, Mic, Volume2, X } from "lucide-react";
import { fileBrief } from "@/lib/janmarg/brief";
import { t } from "@/lib/janmarg/copy";
import { askJago, speakJago } from "@/lib/janmarg/jago-api";
import { useJanmarg } from "@/lib/janmarg/store";

let open = false;
const listeners = new Set<() => void>();

export function setDockOpen(value: boolean) {
  open = value;
  listeners.forEach((listener) => listener());
}

function useSyncOpen() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const pull = () => setTick((value) => value + 1);
    listeners.add(pull);
    return () => {
      listeners.delete(pull);
    };
  }, []);
  return open;
}

const PROMPTS = ["dock.q1", "dock.q2", "dock.q3"] as const;

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function JagoDock() {
  const shown = useSyncOpen();
  const data = useJanmarg((state) => state.data);
  const recordExchange = useJanmarg((state) => state.recordExchange);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLTextAreaElement | null>(null);
  const lang = data.lang;
  const messages = data.messages.filter((item) => item.personaId === data.personaId);
  const first = data.personaId ? data.profiles[data.personaId]?.legalName.split(" ")[0] : "";
  const asked = new Set(messages.filter((item) => item.role === "user").map((item) => item.text));
  const follow = PROMPTS.filter((key) => !asked.has(t(lang, key)));

  const stick = useRef(true);

  useEffect(() => {
    if (shown) boxRef.current?.focus();
  }, [shown]);

  useEffect(() => {
    if (stick.current) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, busy, shown]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDockOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function send(query: string) {
    const clean = query.trim();
    if (!clean || busy || !data.personaId) return;
    const context = fileBrief(data, lang, path);
    setText("");
    if (boxRef.current) boxRef.current.style.height = "";
    setBusy(true);
    setNote(null);
    void askJago({ data: { query: clean, lang, ...context } })
      .then((reply) => recordExchange(clean, reply))
      .catch(() => recordExchange(clean, { text: context.fallbackText, nextAction: context.fallbackNext, citations: [], confident: Boolean(context.fallbackText) }))
      .finally(() => setBusy(false));
  }

  function readAloud(value: string) {
    setNote(null);
    void speakJago({ data: { text: value, lang } })
      .then((result) => {
        if (!result.ok) {
          setNote(t(lang, "jago.speakFail"));
          return;
        }
        void new Audio(`data:audio/mpeg;base64,${result.audio}`).play();
      })
      .catch(() => setNote(t(lang, "jago.speakFail")));
  }

  function exportChat() {
    const lines = messages.map((item) => `${item.role === "user" ? "You" : "JAGO"}\n${item.text || t(lang, "jago.fallback")}`);
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jago-chat.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleVoice() {
    const host = window as Window & { SpeechRecognition?: { new (): SpeechRec }; webkitSpeechRecognition?: { new (): SpeechRec } };
    const Ctor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
    if (!Ctor) {
      setNote(t(lang, "jago.voiceNo"));
      return;
    }
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript ?? "";
      if (said) setText(said);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  if (!shown) {
    return (
      <button type="button" className="jago-launcher" aria-label={t(lang, "jago.title")} onClick={() => setDockOpen(true)}>
        J
      </button>
    );
  }

  return (
    <section className="jago-pop" role="dialog" aria-label={t(lang, "jago.title")}>
      <header className="jago-head">
        <span className="mark" aria-hidden="true">J</span>
        <div className="min-w-0">
          <p className="font-display text-xl leading-none text-ink">JAGO</p>
          <p className="mt-1 truncate text-sm text-muted">{t(lang, "dock.caption")}</p>
        </div>
        <div className="ml-auto flex">
          <button type="button" className="grid size-10 place-items-center text-muted" aria-label={t(lang, "jago.export")} onClick={exportChat}>
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button type="button" className="grid size-10 place-items-center text-ink" aria-label={t(lang, "dock.close")} onClick={() => setDockOpen(false)}>
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3"
        aria-live="polite"
        onScroll={(event) => {
          const list = event.currentTarget;
          stick.current = list.scrollHeight - list.scrollTop - list.clientHeight < 120;
        }}
      >
        {messages.length === 0 ? (
          <div className="jago-empty">
            <p className="font-display text-3xl text-ink">{t(lang, "jago.title")}</p>
            <p className="mt-2 max-w-sm text-base text-muted">{first ? t(lang, "dock.withName", { name: first }) : t(lang, "dock.empty")}</p>
            <div className="mt-5 flex flex-col gap-2">
              {PROMPTS.map((key) => (
                <button key={key} type="button" className="jago-prompt" onClick={() => send(t(lang, key))}>
                  {t(lang, key)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((item) => {
          const body = item.role === "jago" && !item.confident ? t(lang, "jago.fallback") : item.text;
          const mine = item.role === "user";
          return (
            <article key={item.id} className={mine ? "flex justify-end" : "flex items-start gap-2"}>
              {mine ? null : <span className="mark mark-sm" aria-hidden="true">J</span>}
              <div className={mine ? "max-w-[85%]" : "min-w-0 max-w-[85%]"}>
                <p className={mine ? "bubble-user px-3 py-2 text-base leading-relaxed" : "bubble-jago px-3 py-2 text-base leading-relaxed text-ink"}>
                  {body}
                </p>
                {item.role === "jago" && item.nextAction ? <p className="mt-2 text-sm text-primary">{item.nextAction}</p> : null}
                {item.role === "jago" && item.citations.length > 0 ? (
                  <p className="mt-1.5 flex flex-wrap gap-2">
                    {item.citations.slice(0, 2).map((citation) => (
                      <a key={citation.id} className="jago-cite" href={citation.url} target={citation.url.startsWith("/") ? undefined : "_blank"} rel="noreferrer">
                        {citation.title}
                      </a>
                    ))}
                  </p>
                ) : null}
                {item.role === "jago" && item.confident && item.text ? (
                  <button type="button" className="mt-1 grid size-9 place-items-center text-muted" aria-label={t(lang, "jago.speak")} onClick={() => readAloud(item.text)}>
                    <Volume2 className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
        {messages.length > 0 && !busy && follow.length > 0 ? (
          <div className="flex flex-col gap-2">
            {follow.map((key) => (
              <button key={key} type="button" className="jago-prompt" onClick={() => send(t(lang, key))}>
                {t(lang, key)}
              </button>
            ))}
          </div>
        ) : null}
        {busy ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="jago-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            {t(lang, "jago.thinking")}
          </p>
        ) : null}
      </div>
      <footer className="jago-foot">
        <form
          className="jago-bar"
          onSubmit={(event) => {
            event.preventDefault();
            send(text);
          }}
        >
          <label className="sr-only" htmlFor="dock-q">
            {t(lang, "jago.placeholder")}
          </label>
          <textarea
            id="dock-q"
            ref={boxRef}
            rows={1}
            value={text}
            placeholder={t(lang, "jago.placeholder")}
            onChange={(event) => {
              setText(event.target.value);
              const box = event.target;
              box.style.height = "auto";
              box.style.height = `${Math.min(box.scrollHeight, 104)}px`;
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(text);
              }
            }}
            className="jago-input"
          />
          <button type="button" className={`jago-icon ${listening ? "bg-deep text-primary-fg" : "text-muted"}`} aria-label={t(lang, "jago.voice")} onClick={toggleVoice}>
            <Mic className="size-4" aria-hidden="true" />
          </button>
          <button type="submit" className="jago-send" aria-label={t(lang, "jago.ask")} disabled={!text.trim() || busy}>
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
        </form>
        {note ? <p className="px-3 pt-1 text-xs text-muted">{note}</p> : null}
      </footer>
    </section>
  );
}
