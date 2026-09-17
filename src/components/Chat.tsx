import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUp,
  ArrowUpRight,
  X,
  Sparkles,
  RotateCcw,
  Square,
  BookOpen,
} from "lucide-react";
import { projects, email } from "../data";
import { stories } from "../stories";
type Source = { id: string; title: string; url: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  mode?: string;
};
const suggestions = [
  "Where should I start?",
  "What did Shivam build at Khoros?",
  "Show me the strongest agent engineering.",
  "What could Siloed build for my team?",
];
function newSession() {
  return crypto.randomUUID();
}
export default function Chat({
  open,
  onOpenChange,
  question,
  onQuestionUsed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  question: string;
  onQuestionUsed: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState(false);
  const [session, setSession] = useState(newSession);
  const controller = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (question && open) {
      setDraft(question);
      onQuestionUsed();
    }
  }, [question, open, onQuestionUsed]);
  useEffect(() => {
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: "instant",
    });
  }, [messages, busy, error]);
  useEffect(() => () => controller.current?.abort(), []);
  async function send(value = draft) {
    const clean = value.trim();
    if (!clean || busy) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setDraft("");
    setError("");
    setBusy(true);
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 32000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.current.signal,
        body: JSON.stringify({
          sessionId: session,
          messages: next
            .slice(-7)
            .map(({ role, content }) => ({
              role,
              content: content.slice(0, 1600),
            })),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "The guide is temporarily unavailable.");
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          mode: "ai",
        },
      ]);
    } catch (e) {
      setMessages(messages);
      setDraft(clean);
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Request stopped. You can try again or browse the project notes."
          : e instanceof Error
            ? e.message
            : "Unable to reach the guide.",
      );
    } finally {
      clearTimeout(timeout);
      setBusy(false);
      controller.current = null;
      input.current?.focus();
    }
  }
  function clear() {
    controller.current?.abort();
    setMessages([]);
    setError("");
    setNotes(false);
    setSession(newSession());
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay chat-overlay" />
        <Dialog.Content className="chat-dialog">
          <div className="chat-header">
            <div className="chat-avatar">
              <Sparkles size={20} />
            </div>
            <div>
              <Dialog.Title>Meet the work.</Dialog.Title>
              <span>SHIVAM’S AI PORTFOLIO GUIDE</span>
            </div>
            <button
              aria-label="Clear conversation"
              onClick={clear}
              disabled={busy}
            >
              <RotateCcw size={16} />
            </button>
            <Dialog.Close aria-label="Close AI guide">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="chat-description">
            A guide to my projects, experience, and approach. Grounded in public
            project notes and my resume.
          </Dialog.Description>
          <div
            className="chat-messages"
            ref={log}
            role="log"
            aria-label="Conversation"
            aria-live="polite"
          >
            {messages.length === 0 && !notes && (
              <div className="chat-welcome">
                <span className="chat-welcome-icon">✳</span>
                <h3>
                  Good questions.
                  <br />
                  Real answers.
                </h3>
                <p>
                  Ask about an engineering decision, find a project to try, or
                  explore working together.
                </p>
                <div className="chat-suggestions">
                  {suggestions.map((q) => (
                    <button key={q} onClick={() => send(q)} disabled={busy}>
                      {q}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={index}>
                <span className="message-label">
                  {message.role === "user" ? "YOU" : "AI GUIDE"}
                </span>
                <p>{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="chat-sources">
                    <span>EXPLORE THE SOURCES</span>
                    {message.sources.map((s) => (
                      <a
                        href={s.url}
                        key={s.id}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.title}
                        <ArrowUpRight size={12} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="chat-thinking" role="status">
                <span />
                <span />
                <span />
                Reading the project notes…
              </div>
            )}
            {error && (
              <div className="chat-error" role="alert">
                <p>{error}</p>
                <button onClick={() => send()} disabled={busy || !draft.trim()}>
                  Retry question <ArrowUpRight size={14} />
                </button>
                <button
                  onClick={() => {
                    setNotes(true);
                    setError("");
                  }}
                >
                  Browse project notes <BookOpen size={14} />
                </button>
              </div>
            )}
            {notes && (
              <div className="chat-notes">
                <p className="eyebrow">PROJECT NOTES · NOT AI GENERATED</p>
                {projects
                  .filter((p) =>
                    [
                      "AssemblyAI",
                      "repogym",
                      "toolstorm",
                      "RevenueCat-Shipaton",
                    ].includes(p.id),
                  )
                  .map((p) => (
                    <a href={p.url} target="_blank" rel="noreferrer" key={p.id}>
                      <strong>
                        {p.name} <ArrowUpRight size={14} />
                      </strong>
                      <span>{stories[p.id]?.summary || p.description}</span>
                    </a>
                  ))}
                <a href={`mailto:${email}`}>
                  <strong>
                    Talk to Shivam <ArrowUpRight size={14} />
                  </strong>
                  <span>{email}</span>
                </a>
              </div>
            )}
          </div>
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="sr-only" htmlFor="chat-question">
              Your question
            </label>
            <textarea
              ref={input}
              id="chat-question"
              value={draft}
              maxLength={1600}
              rows={2}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask something you're curious about…"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.nativeEvent.keyCode !== 229
                ) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            {busy ? (
              <button
                type="button"
                aria-label="Stop response"
                onClick={() => controller.current?.abort()}
              >
                <Square size={17} />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send question"
                disabled={!draft.trim()}
              >
                <ArrowUp size={20} />
              </button>
            )}
          </form>
          <p className="chat-disclosure">
            AI can make mistakes. Messages go to Google’s AI service.
            <br />
            No chat history is saved by this site. Please avoid sensitive
            details.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
