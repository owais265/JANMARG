import { useRouterState } from "@tanstack/react-router";
import { ArrowUp, Download, ImagePlus, Mic, PanelLeft, Plus, Square, SquarePen, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { askGuidance, clearGuidance, exportGuidance, listGuidance, schemeNotes } from "@/lib/beta/guide-server";
import { practiceBrief } from "@/lib/beta/locker";
import { transcribeGuidance } from "@/lib/beta/media-server";
import { JAGO_ENABLED } from "@/lib/beta/content";
import { useBeta, type ChatTurn } from "@/lib/beta/store";
import { useT } from "@/lib/beta/use-t";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const FOLLOW = ["jago.follow.docs", "jago.follow.next"] as const;

type Shot = { data: string; mime: "image/png" | "image/jpeg"; name: string };

function fileToBase64(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? "").split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function wrap(text: string, width: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word.slice(0, width);
    } else {
      line = next.slice(0, width * 2);
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export function useJagoAsk() {
  const { t, language } = useT();
  const { user } = useCurrentUserState();
  const chat = useBeta((state) => state.chat);
  const push = useBeta((state) => state.pushChat);
  const replace = useBeta((state) => state.replaceChat);
  const clearLocal = useBeta((state) => state.clearChat);
  const allow = useBeta((state) => state.noteJagoHit);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    window.speechSynthesis?.cancel();
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    void listGuidance()
      .then((rows) => {
        if (cancel || !rows.length) return;
        const state = useBeta.getState();
        if (state.chat.length > 0 || state.threads.length > 0) return;
        replace(rows.map((row) => ({ id: row.id, role: row.role, text: row.text, cites: row.cites })));
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [user, replace]);

  async function ask(question: string, shot?: Shot | null) {
    const clean = question.trim();
    if ((!clean && !shot) || busy) return;
    if (!JAGO_ENABLED) {
      setNote(t("jago.down"));
      return;
    }
    if (!allow()) {
      setNote(t("jago.wait"));
      return;
    }
    setNote("");
    const prior = useBeta.getState().chat.slice(-6).map((turn) => ({ role: turn.role, text: turn.text }));
    const file = practiceBrief(useBeta.getState().locker);
    const stamp = Date.now();
    const shown = clean || t("jago.shot");
    push({
      id: `u-${stamp}`,
      role: "user",
      text: shown,
      cites: [],
      attachment: shot ? shot.name || "PNG" : undefined,
    });
    setBusy(true);
    try {
      const result = await askGuidance({
        data: {
          question: clean,
          language,
          image: shot?.data,
          mime: shot?.mime,
          history: prior,
          file,
        },
      });
      push({
        id: `a-${stamp}`,
        role: "assistant",
        text: result.text,
        cites: result.cites,
      });
    } catch {
      push({
        id: `a-${stamp}`,
        role: "assistant",
        text: t("jago.fallback"),
        cites: [],
      });
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    clearLocal();
    window.speechSynthesis?.cancel();
    if (user) {
      try {
        await clearGuidance();
      } catch {
        setNote(t("jago.fallback"));
      }
    }
  }

  async function linesForExport(): Promise<ChatTurn[]> {
    if (chat.length) return chat;
    try {
      const remote = await exportGuidance();
      return remote.lines.map((row, index) => ({
        id: `e-${index}`,
        role: row.role,
        text: row.text,
        cites: [],
      }));
    } catch {
      return chat;
    }
  }

  return { chat, ask, busy, note, setNote, clear, t, language, linesForExport };
}

function Bubble({ turn }: { turn: ChatTurn }) {
  const user = turn.role === "user";
  return (
    <article className={user ? "ml-auto max-w-[85%] rounded-3xl bg-deep px-4 py-2.5 text-sm leading-snug text-primary-fg" : "max-w-full px-1 py-1 text-base leading-snug"}>
      <p className="whitespace-pre-wrap">{turn.text}</p>
      {turn.attachment ? <p className="mt-1 text-xs opacity-80">{turn.attachment}</p> : null}
      {turn.cites.map((cite) => (
        <a key={cite.url} href={cite.url} className={`mt-1 block text-xs underline ${user ? "" : "text-primary"}`} target="_blank" rel="noreferrer">
          {cite.title}
        </a>
      ))}
    </article>
  );
}

export function JagoThread({ compact = false }: { compact?: boolean }) {
  const { chat, ask, busy, note, setNote, clear, t, language, linesForExport } = useJagoAsk();
  const threads = useBeta((state) => state.threads);
  const activeId = useBeta((state) => state.activeId);
  const newChat = useBeta((state) => state.newChat);
  const openThread = useBeta((state) => state.openThread);
  const deleteThread = useBeta((state) => state.deleteThread);
  const [text, setText] = useState("");
  const [shot, setShot] = useState<Shot | null>(null);
  const [listening, setListening] = useState(false);
  const [menu, setMenu] = useState(false);
  const [history, setHistory] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [chat, busy]);

  function browserSpeech() {
    const host = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
    };
    const Ctor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
    if (!Ctor) {
      setNote(t("jago.voiceMissing"));
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = language === "en" ? "en-IN" : language === "hinglish" ? "hi-IN" : `${language}-IN`;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript?.trim();
      if (heard) setText((current) => (current ? `${current} ${heard}` : heard));
    };
    rec.onerror = () => setNote(t("jago.voiceMissing"));
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  async function toggleListen() {
    if (recRef.current && recRef.current.state === "recording") {
      recRef.current.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      browserSpeech();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setListening(false);
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        void fileToBase64(blob).then(async (audio) => {
          if (audio.length < 20) {
            browserSpeech();
            return;
          }
          try {
            const result = await transcribeGuidance({ data: { audio, mime: blob.type || "audio/webm", language } });
            if (result.ok && result.text) {
              setText((current) => (current ? `${current} ${result.text}` : result.text));
              return;
            }
          } catch {
            /* fall through */
          }
          browserSpeech();
        });
      };
      recRef.current = rec;
      setListening(true);
      setNote("");
      rec.start();
      window.setTimeout(() => {
        if (rec.state === "recording") rec.stop();
      }, 12000);
    } catch {
      browserSpeech();
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const mime = file.type === "image/jpeg" ? "image/jpeg" : file.type === "image/png" ? "image/png" : "";
    if (!mime) {
      setNote(t("jago.imageNote"));
      return;
    }
    if (file.size > 900_000) {
      setNote(t("jago.imageNote"));
      return;
    }
    const data = await fileToBase64(file);
    setShot({ data, mime, name: file.name || "picture.png" });
    setNote("");
  }

  async function gather() {
    const rows = await linesForExport();
    if (!rows.length) {
      setNote(t("jago.emptyExport"));
      return null;
    }
    return rows;
  }

  async function saveText() {
    const rows = await gather();
    if (!rows) return;
    const body = rows
      .map((turn) => {
        const who = turn.role === "user" ? "You" : "JAGO";
        const extra = turn.attachment ? `\n(${turn.attachment})` : "";
        const cites = turn.cites.map((cite) => `\n- ${cite.title} ${cite.url}`).join("");
        return `${who}: ${turn.text}${extra}${cites}`;
      })
      .join("\n\n");
    const blob = new Blob([`JANMARG JAGO\n\n${body}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jago-guidance.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function savePng() {
    const rows = await gather();
    if (!rows) return;
    const lines = ["JANMARG · JAGO", ""];
    for (const turn of rows) {
      const who = turn.role === "user" ? "You" : "JAGO";
      wrap(`${who}: ${turn.text}`, 78).forEach((line) => lines.push(line));
      if (turn.attachment) lines.push(` ${turn.attachment}`);
      lines.push("");
    }
    const kept = lines.slice(0, 140);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = Math.max(420, 96 + kept.length * 34);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f4efe6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#146b45";
    ctx.fillRect(0, 0, canvas.width, 8);
    ctx.fillStyle = "#14241c";
    ctx.font = "600 28px Outfit, sans-serif";
    kept.forEach((line, index) => {
      ctx.font = index === 0 ? "600 32px Fraunces, serif" : "400 22px Outfit, sans-serif";
      ctx.fillStyle = index === 0 ? "#146b45" : "#14241c";
      ctx.fillText(line, 48, 64 + index * 34);
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "jago-guidance.png";
    link.click();
  }

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col ${compact ? "" : "h-full"}`}>
      <div className="flex h-12 shrink-0 items-center px-1">
        <button type="button" className="grid size-11 place-items-center rounded-full" aria-label={t("jago.history")} onClick={() => setHistory(true)}>
          <PanelLeft className="size-5" aria-hidden />
        </button>
        <p className="flex-1 text-center text-sm font-medium">JAGO</p>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full"
          aria-label={t("jago.new")}
          onClick={() => {
            newChat();
            setHistory(false);
          }}
        >
          <SquarePen className="size-5" aria-hidden />
        </button>
      </div>
      <div className="app-scroll grid min-h-0 flex-1 content-start gap-3 px-3 py-2">
        {chat.length === 0 ? (
          <div className="grid min-h-full place-items-center px-6 py-10 text-center">
            <div>
              <p className="font-display text-4xl">JAGO</p>
              <p className="mt-2 text-sm text-muted">{t("jago.sub")}</p>
            </div>
          </div>
        ) : null}
        {chat.map((turn) => (
          <Bubble key={turn.id} turn={turn} />
        ))}
        {busy ? <p className="text-sm text-muted">…</p> : null}
        <div ref={end} />
      </div>
      {chat.length > 0 && !busy ? (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {FOLLOW.map((key) => (
            <button key={key} type="button" className="min-h-10 rounded-full bg-surface px-3 text-sm ring-1 ring-line" onClick={() => void ask(t(key))}>
              {t(key)}
            </button>
          ))}
        </div>
      ) : null}
      {shot ? (
        <div className="flex items-center gap-2 px-3 pb-2">
          <img src={`data:${shot.mime};base64,${shot.data}`} alt="" className="size-12 rounded-lg object-cover ring-1 ring-line" />
          <p className="min-w-0 flex-1 truncate text-xs text-muted">{shot.name}</p>
          <button type="button" className="inline-flex size-11 items-center justify-center" onClick={() => setShot(null)} aria-label={t("jago.clear")}>
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
      <form
        className={`relative px-2 pb-2 ${compact ? "border-t border-line pt-2" : ""}`}
        onSubmit={(event) => {
          event.preventDefault();
          const next = text;
          const picture = shot;
          setText("");
          setShot(null);
          setMenu(false);
          void ask(next, picture);
        }}
      >
        {menu ? (
          <div className="absolute bottom-full left-2 z-10 mb-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
            <button
              type="button"
              className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm"
              onClick={() => {
                setMenu(false);
                fileRef.current?.click();
              }}
            >
              <ImagePlus className="size-4" aria-hidden />
              {t("jago.photo")}
            </button>
            <button type="button" className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm" onClick={() => { setMenu(false); void saveText(); }}>
              <Download className="size-4" aria-hidden />
              {t("jago.txt")}
            </button>
            <button type="button" className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm" onClick={() => { setMenu(false); void savePng(); }}>
              <Download className="size-4" aria-hidden />
              {t("jago.png")}
            </button>
            <button type="button" className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm" onClick={() => { setMenu(false); void clear(); }}>
              {t("jago.clear")}
            </button>
            <p className="px-3 py-2 text-xs text-muted">{t("jago.imageNote")}</p>
          </div>
        ) : null}
        <div className="flex items-end gap-1 rounded-[1.7rem] border border-line bg-surface py-1 pr-1 pl-1">
          <label className="sr-only" htmlFor={compact ? "jago-dock-q" : "jago"}>
            {t("jago.ask")}
          </label>
          <button
            type="button"
            className="mb-0.5 grid size-11 shrink-0 place-items-center rounded-full text-ink"
            aria-label={t("jago.plus")}
            aria-expanded={menu}
            onClick={() => setMenu((open) => !open)}
          >
            <Plus className={`size-5 ${menu ? "rotate-45" : ""}`} aria-hidden />
          </button>
          <textarea
            id={compact ? "jago-dock-q" : "jago"}
            rows={1}
            className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-1 py-2.5 text-base outline-none"
            value={text}
            placeholder={listening ? t("jago.listening") : t("jago.ask")}
            onChange={(event) => {
              setText(event.target.value);
              const box = event.target;
              box.style.height = "auto";
              box.style.height = `${Math.min(box.scrollHeight, 112)}px`;
            }}
          />
          <button
            type="button"
            className={`mb-0.5 grid size-11 shrink-0 place-items-center rounded-full ${listening ? "bg-deep text-primary-fg" : "text-ink"}`}
            onClick={() => void toggleListen()}
            aria-pressed={listening}
            aria-label={listening ? t("jago.stop") : t("jago.listen")}
          >
            {listening ? <Square className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
          </button>
          <button className="mb-0.5 grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-fg disabled:opacity-40" type="submit" disabled={busy || (!text.trim() && !shot)} aria-label={t("jago.send")}>
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void onFile(file);
          }}
        />
      </form>
      {note ? <p className="px-3 pb-2 text-xs text-warning">{note}</p> : null}
      {history ? (
        <div className="absolute inset-0 z-30 flex">
          <aside className="flex h-full w-[82%] max-w-xs flex-col bg-paper shadow-xl" role="dialog" aria-label={t("jago.history")}>
            <div className="flex h-12 items-center px-4">
              <p className="text-sm font-medium">{t("jago.history")}</p>
            </div>
            <button
              type="button"
              className="mx-3 mb-2 flex h-11 items-center justify-center rounded-full bg-primary text-sm text-primary-fg"
              onClick={() => {
                newChat();
                setHistory(false);
              }}
            >
              {t("jago.new")}
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto px-2">
              {threads.length === 0 ? <p className="px-2 py-3 text-sm text-muted">{t("jago.noHistory")}</p> : null}
              {threads.map((thread) => (
                <div key={thread.id} className={`mb-1 flex items-center rounded-2xl ${thread.id === activeId ? "bg-soft" : ""}`}>
                  <button
                    type="button"
                    className="min-h-12 min-w-0 flex-1 truncate px-3 text-left text-sm"
                    onClick={() => {
                      openThread(thread.id);
                      setHistory(false);
                    }}
                  >
                    {thread.title}
                  </button>
                  <button type="button" className="grid size-11 shrink-0 place-items-center text-muted" aria-label={t("jago.delete")} onClick={() => deleteThread(thread.id)}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="m-3 flex h-11 items-center justify-center rounded-full ring-1 ring-line text-sm"
              onClick={() => {
                void clear();
                setHistory(false);
              }}
            >
              {t("jago.clear")}
            </button>
          </aside>
          <button type="button" className="h-full flex-1 bg-deep/40" aria-label={t("jago.history")} onClick={() => setHistory(false)} />
        </div>
      ) : null}
    </div>
  );
}

export function JagoDock() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  if (path === "/jago" || path === "/settings") return null;
  return (
    <div className="fixed right-3 bottom-3 z-30 flex w-[min(24rem,calc(100vw-1.5rem))] flex-col items-end gap-2">
      {open ? (
        <section className="flex h-[min(78dvh,36rem)] w-full flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-lg">
          <header className="flex h-12 items-center justify-between border-b border-line px-3">
            <p className="font-medium">JAGO</p>
            <button type="button" className="inline-flex size-11 items-center justify-center" onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-4" aria-hidden />
            </button>
          </header>
          <JagoThread compact />
        </section>
      ) : null}
      <button type="button" className="h-12 rounded-full bg-deep px-5 text-sm text-primary-fg shadow-lg" onClick={() => setOpen((value) => !value)}>
        JAGO
      </button>
    </div>
  );
}

export function SchemeNotes({ scheme }: { scheme: string }) {
  const { t, language } = useT();
  const [notes, setNotes] = useState<{ id: string; title: string; body: string; url: string; sourceTitle: string }[]>([]);
  useEffect(() => {
    let cancel = false;
    void schemeNotes({ data: { scheme, language } })
      .then((rows) => {
        if (!cancel) setNotes(rows);
      })
      .catch(() => {
        if (!cancel) setNotes([]);
      });
    return () => {
      cancel = true;
    };
  }, [scheme, language]);
  if (!notes.length) return null;
  return (
    <section className="mt-4 grid gap-2">
      <h2 className="text-xl">{t("jago.notes")}</h2>
      {notes.map((note) => (
        <article key={note.id} className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-lg">{note.title}</h3>
          <p className="mt-1 text-sm text-muted">{note.body}</p>
          <a className="mt-2 inline-flex min-h-11 items-center text-sm text-primary" href={note.url} target="_blank" rel="noreferrer">
            {note.sourceTitle}
          </a>
        </article>
      ))}
    </section>
  );
}
