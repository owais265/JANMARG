import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, X } from "lucide-react";
import { askJago } from "@/lib/janmarg/jago-server";
import { JAGO_FALLBACK, localAnswer } from "@/lib/janmarg/showcase";
import { useShowcase } from "@/lib/janmarg/showcase-store";

let open = false;
const listeners = new Set<() => void>();

export function setChatOpen(value: boolean) {
  open = value;
  listeners.forEach((listener) => listener());
}

function useChatOpen() {
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

const CHIPS = ["Why is my file delayed?", "Name mismatch?", "Payment status?"];

export function ChatDock() {
  const shown = useChatOpen();
  const chat = useShowcase((state) => state.chat);
  const askLocal = useShowcase((state) => state.askLocal);
  const push = useShowcase((state) => state.pushAssistant);
  const data = useShowcase();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (shown) boxRef.current?.focus();
  }, [shown]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chat.length, busy, shown]);

  async function send(question: string) {
    const clean = question.trim();
    if (!clean || busy) return;
    setText("");
    const local = localAnswer(clean, data);
    if (local.text !== JAGO_FALLBACK) {
      askLocal(clean);
      return;
    }
    setBusy(true);
    try {
      const result = await askJago({ data: { question: clean } });
      push(clean, {
        id: `g-${Date.now()}`,
        role: "assistant",
        text: result.text,
        citations: result.citations.map((item) => ({ title: item.title, url: item.url, excerpt: item.excerpt })),
        fileBased: false,
        actions: [{ label: "Review", to: "/manual-review" }],
      });
    } catch {
      askLocal(clean);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-dock">
      {shown ? (
        <section className="chat-panel" aria-label="JAGO">
          <header className="flex items-center justify-between px-3 py-2">
            <p className="text-base font-medium">JAGO</p>
            <button type="button" className="grid size-11 place-items-center" aria-label="Close" onClick={() => setChatOpen(false)}>
              <X className="size-5" />
            </button>
          </header>
          <div ref={listRef} className="chat-log">
            {chat.length === 0 ? (
              <div className="flex flex-wrap gap-2 p-3">
                {CHIPS.map((chip) => (
                  <button key={chip} type="button" className="min-h-10 rounded-full bg-paper px-3 text-sm ring-1 ring-line" onClick={() => void send(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            ) : null}
            {chat.map((turn) => (
              <article key={turn.id} className={turn.role === "user" ? "chat-me" : "chat-them"}>
                <p>{turn.text}</p>
                {turn.citations.map((cite) => (
                  <a key={cite.url} href={cite.url} className="mt-2 block text-sm underline">
                    {cite.title}
                  </a>
                ))}
                {turn.actions.map((action) => (
                  <Link key={action.to} to={action.to as never} className="mt-2 block text-sm font-medium underline" onClick={() => setChatOpen(false)}>
                    {action.label}
                  </Link>
                ))}
              </article>
            ))}
            {busy ? <p className="px-3 text-sm text-muted">…</p> : null}
          </div>
          <form
            className="chat-bar"
            onSubmit={(event) => {
              event.preventDefault();
              void send(text);
            }}
          >
            <label className="sr-only" htmlFor="jago-ask">
              Message
            </label>
            <input
              id="jago-ask"
              ref={boxRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ask"
              className="min-w-0 flex-1 bg-transparent text-base outline-none"
            />
            <button type="submit" className="grid size-10 place-items-center rounded-full bg-primary text-primary-fg" aria-label="Send">
              <ArrowUp className="size-4" />
            </button>
          </form>
        </section>
      ) : null}
      {!shown ? (
        <button type="button" className="chat-launch" aria-label="Open JAGO" onClick={() => setChatOpen(true)}>
          JAGO
        </button>
      ) : null}
    </div>
  );
}
