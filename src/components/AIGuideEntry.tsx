import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, X } from "lucide-react";

const visitKey = "shivam-ai-guide-introduced";
const prompts = ["What has Shivam built?", "Would he fit our team?"];

export default function AIGuideEntry({
  blocked,
  open,
  onAsk,
}: {
  blocked: boolean;
  open: boolean;
  onAsk: (question?: string, autoSend?: boolean) => void;
}) {
  const [introduced, setIntroduced] = useState(() => {
    try { return sessionStorage.getItem(visitKey) === "yes"; }
    catch { return false; }
  });
  const [visible, setVisible] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const trigger = useRef<HTMLButtonElement>(null);
  const entry = useRef<HTMLDivElement>(null);

  function remember() {
    setIntroduced(true);
    try { sessionStorage.setItem(visitKey, "yes"); } catch { /* Optional visit memory. */ }
  }
  function dismiss() {
    remember();
    setVisible(false);
  }
  function ask(question = "") {
    dismiss();
    onAsk(question, Boolean(question));
  }

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (blocked) setVisible(false);
  }, [blocked]);

  useEffect(() => {
    if (open) {
      setVisible(false);
      setIntroduced(true);
      try { sessionStorage.setItem(visitKey, "yes"); } catch { /* Optional visit memory. */ }
    }
  }, [open]);

  useEffect(() => {
    if (introduced || blocked || !pageVisible) return;
    const timer = window.setTimeout(() => {
      setVisible(true);
      setIntroduced(true);
      try { sessionStorage.setItem(visitKey, "yes"); } catch { /* Optional visit memory. */ }
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [introduced, blocked, pageVisible]);

  useEffect(() => {
    if (!visible || engaged) return;
    const timer = window.setTimeout(() => setVisible(false), 12000);
    return () => window.clearTimeout(timer);
  }, [visible, engaged]);

  useEffect(() => {
    if (!visible) return;
    const outside = (event: PointerEvent) => {
      if (!entry.current?.contains(event.target as Node)) setVisible(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (entry.current?.contains(document.activeElement)) trigger.current?.focus();
      setVisible(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [visible]);

  const show = visible && !blocked && pageVisible;
  return (
    <div className="ai-entry" ref={entry}>
      <button
        ref={trigger}
        id="ai-guide-trigger"
        className="dock-ai"
        data-nudge={show}
        aria-label="Ask AI about Shivam and his projects"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => ask()}
      >
        <Sparkles size={17} aria-hidden="true" />
        <span>Ask AI</span>
      </button>
      {show && (
        <aside
          className="ai-invitation"
          aria-label="Meet the AI guide"
          onPointerEnter={() => setEngaged(true)}
          onPointerLeave={(event) => setEngaged(event.currentTarget.contains(document.activeElement))}
          onFocusCapture={() => setEngaged(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(event.currentTarget.matches(":hover"));
          }}
        >
          <div className="ai-invitation-heading">
            <span><Sparkles size={13} aria-hidden="true" /> YOUR WAY INTO THE WORK</span>
            <button aria-label="Dismiss AI invitation" onClick={() => {
              dismiss();
              trigger.current?.focus();
            }}><X size={16} aria-hidden="true" /></button>
          </div>
          <strong>Curious about my work?</strong>
          <p>Ask my AI guide about projects, experience or working together.</p>
          <div className="ai-preview-questions">
            {prompts.map((prompt) => (
              <button key={prompt} onClick={() => ask(prompt)}>
                {prompt}<ArrowUpRight size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
