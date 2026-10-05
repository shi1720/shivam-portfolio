import { ArrowUpRight, Code2, BookOpen } from "lucide-react";
import papers from "../research.json";

export default function Research() {
  return <section className="research-room" aria-labelledby="research-title">
    <div className="research-intro">
      <div><p className="eyebrow">RESEARCH / QUESTIONS WORTH TESTING</p>
        <h2 id="research-title">Build it.<br />Then <em>question it.</em></h2></div>
      <div className="research-note"><BookOpen size={28} aria-hidden="true" />
        <p>What makes an AI system reliable? What does its behavior actually prove? My research follows those questions from product decisions into memory, learning and infrastructure.</p>
        <span>Independent research by Shivam Gupta.</span>
      </div>
    </div>
    <div className="research-grid">
      {papers.map((paper, i) => <article className="research-paper" key={paper.id}>
        <div className="paper-meta"><span>{String(i + 1).padStart(2, "0")} / {paper.topic}</span><span>PREPRINT</span></div>
        <h3>{paper.question}</h3>
        <h4 className="paper-title">{paper.title}</h4>
        <p className="paper-evidence">{paper.evidence}</p>
        <details><summary>Paper details & scope</summary><p className="paper-summary">{paper.summary}</p><p>{paper.boundary}</p><p className="paper-date">Shivam Gupta · {paper.date}</p></details>
        <div className="paper-links"><a href={paper.paper} target="_blank" rel="noreferrer" aria-label={`Read paper: ${paper.title}`}>Read the paper <ArrowUpRight size={16} /></a><a href={paper.code} target="_blank" rel="noreferrer" aria-label={`Code and evidence: ${paper.title}`}><Code2 size={16} /> Code & evidence</a></div>
      </article>)}
    </div>
  </section>;
}
