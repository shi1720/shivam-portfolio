import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowDown, BookOpen } from "lucide-react";
import { backgroundChapters } from "../background";

/** A paper scene is decorative; the full story is always readable alongside it. */
export default function BackgroundBook() {
  const [current, setCurrent] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const chapter = backgroundChapters[current];
  function moveTo(index: number, focus = false, fromPager = false) {
    setCurrent(index);
    if (focus) tabs.current[index]?.focus();
    if (fromPager) requestAnimationFrame(() => {
      const panel = document.getElementById(`background-panel-${backgroundChapters[index].id}`);
      panel?.focus({ preventScroll: true });
      panel?.scrollIntoView({ block: "start" });
    });
  }
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
    event.preventDefault();
    const last = backgroundChapters.length - 1;
    moveTo(
      key === "Home" ? 0 : key === "End" ? last :
        (current + (key === "ArrowRight" ? 1 : last)) % backgroundChapters.length,
      true,
    );
  }
  return (
    <section className="background-book" aria-labelledby="background-title">
      <header className="book-intro">
        <div>
          <p className="eyebrow"><BookOpen size={16} aria-hidden="true" /> A FEW PAGES FROM MY BACKGROUND</p>
          <h2 id="background-title">How I think.<br /><em>How we build.</em></h2>
        </div>
        <p>Engineering gave me a way to make things work.<br className="book-intro-break" /> Design taught me to ask who they work for.<br className="book-intro-break" /> Leading people brings the work together.</p>
      </header>
      <div className="book-tabs" role="tablist" aria-label="Chapters of Shivam’s background">
        {backgroundChapters.map((item, index) => (
          <button
            key={item.id}
            ref={(element) => { tabs.current[index] = element; }}
            id={`background-tab-${item.id}`}
            role="tab"
            aria-selected={current === index}
            aria-controls={`background-panel-${item.id}`}
            tabIndex={current === index ? 0 : -1}
            onKeyDown={onTabKey}
            onClick={() => moveTo(index)}
          >
            <span className="book-tab-number">0{index + 1}</span>
            <span>{item.tab}</span>
          </button>
        ))}
      </div>
      {backgroundChapters.map((item, index) => (
        <div
          key={item.id}
          id={`background-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`background-tab-${item.id}`}
          tabIndex={0}
          hidden={current !== index}
          className={`book-spread book-spread-${item.id}`}
        >
          <div className="book-illustration" aria-hidden="true">
            <div className="paper-stage">
              <div className="paper-book">
                <div className="paper-leaf paper-leaf-left"><span>SHIVAM / FIELD NOTES</span></div>
                <div className="paper-leaf paper-leaf-right"><span>0{index + 1} / 04</span></div>
                <div className="paper-spine" />
                <div className="paper-path" />
                <div className="paper-fold paper-fold-one">
                  <div className="paper-face">
                    <span className="paper-piece-index">01</span>
                    <div className={`paper-symbol paper-symbol-${item.id}-one`}><i /><i /><i /></div>
                    <strong>{item.words[0]}</strong>
                  </div>
                </div>
                <div className="paper-fold paper-fold-two">
                  <div className="paper-face">
                    <span className="paper-piece-index">02</span>
                    <div className={`paper-symbol paper-symbol-${item.id}-two`}><i /><i /><i /></div>
                    <strong>{item.words[1]}</strong>
                  </div>
                </div>
                <div className="paper-fold paper-fold-three">
                  <div className="paper-face">
                    <span className="paper-piece-index">03</span>
                    <div className={`paper-symbol paper-symbol-${item.id}-three`}><i /><i /><i /></div>
                    <strong>{item.words[2]}</strong>
                  </div>
                </div>
              </div>
            </div>
            <p className="paper-caption"><span>↳</span>{item.caption}</p>
          </div>
          <div className="book-copy">
            <p className="book-chapter-count">CHAPTER 0{index + 1} / 04</p>
            <h3>{item.heading}</h3>
            {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p className="book-note"><span />{item.note}</p>
          </div>
        </div>
      ))}
      <footer className="book-footer">
        <p aria-live="polite" aria-atomic="true">0{current + 1} / 04 <span>{chapter.tab}</span></p>
        <div className="book-page-controls">
          <button type="button" aria-label="Previous chapter" disabled={current === 0} onClick={() => moveTo(current - 1, false, true)}><ArrowLeft size={19} aria-hidden="true" /></button>
          {current < backgroundChapters.length - 1 ? (
            <button type="button" onClick={() => moveTo(current + 1, false, true)}>Turn the page <ArrowRight size={18} aria-hidden="true" /></button>
          ) : (
            <button type="button" onClick={() => { const heading = document.getElementById("career-title"); heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ block: "start" }); }}>Meet the work <ArrowDown size={18} aria-hidden="true" /></button>
          )}
        </div>
      </footer>
    </section>
  );
}
