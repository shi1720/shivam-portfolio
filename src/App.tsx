import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Pause,
  Play,
  Sparkles,
  Search,
  X,
  Copy,
  Check,
  ArrowDownLeft,
  Plus,
  ChevronLeft,
} from "lucide-react";
import {
  categories,
  projects,
  featured,
  career,
  email,
  linkedin,
  type District,
  type Project,
} from "./data";
import { stories } from "./stories";
import ProjectVisual from "./components/ProjectVisual";
import ProjectDialog from "./components/ProjectDialog";
import Chat from "./components/Chat";
import Lab from "./components/Lab";
import BackgroundBook from "./components/BackgroundBook";
import { usePortfolioTools } from "./usePortfolioTools";
const Intelligence = lazy(() => import("./components/Intelligence"));
type Room = "studio" | "work" | "about" | "lab" | "contact";
const rooms: { id: Room; name: string; num: string }[] = [
  { id: "studio", name: "The studio", num: "00" },
  { id: "work", name: "The work", num: "01" },
  { id: "about", name: "The human", num: "02" },
  { id: "lab", name: "The lab", num: "03" },
  { id: "contact", name: "Let’s talk", num: "04" },
];
export default function App() {
  const [room, setRoom] = useState<Room>("studio");
  const [district, setDistrict] = useState<District>("all");
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<District>("all");
  const [copied, setCopied] = useState(false);
  const [activeId, setActiveId] = useState("AssemblyAI");
  const useQuestion = useCallback(() => setQuestion(""), []);
  const ask = (q = "") => {
    setQuestion(q);
    setChatOpen(true);
  };
  const navigate = (target: Room) => {
    setRoom(target);
    history.pushState(null, "", target === "studio" ? "#studio" : `#${target}`);
    window.scrollTo(0, 0);
  };
  const chooseProject = (p: Project) => {
    setSelected(p);
    history.pushState(null, "", `#project=${encodeURIComponent(p.id)}`);
  };
  usePortfolioTools(chooseProject);
  const closeProject = () => {
    setSelected(null);
    history.replaceState(null, "", `#${room}`);
  };
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith("project=")) {
        let id = "";
        try {
          id = decodeURIComponent(hash.slice(8));
        } catch {
          // A malformed shared URL should still lead to usable project browsing.
        }
        const p = projects.find((p) => p.id === id);
        setRoom("work");
        setSelected(p || null);
      } else if (rooms.some((r) => r.id === hash)) {
        setSelected(null);
        setRoom(hash as Room);
      } else if (hash === "catalog") {
        setRoom("work");
      } else {
        setRoom("studio");
        setSelected(null);
      }
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, []);
  useEffect(() => {
    document.title = `${room === "studio" ? "Shivam Gupta | A mind in motion" : `${rooms.find((r) => r.id === room)?.name} | Shivam Gupta`}`;
  }, [room]);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      location.href = `mailto:${email}`;
    }
  }
  const filtered = projects.filter(
    (p) =>
      (filter === "all" || p.district === filter) &&
      `${p.name} ${p.description} ${p.language}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const ordered = [...filtered].sort((a, b) => {
    const x = featured.indexOf(a.id),
      y = featured.indexOf(b.id);
    return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
  });
  const active =
    ordered.find((p) => p.id === activeId) || ordered[0] || projects[0];
  const story = stories[active.id];
  const visibleNodes = projects.filter(
    (p) => district === "all" || p.district === district,
  );
  return (
    <div className={`studio-shell room-${room}`}>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="studio-header">
        <a
          href="#studio"
          className="studio-brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("studio");
          }}
          aria-label="Shivam Gupta studio"
        >
          <span className="sg-mark">
            s/g<span>✳</span>
          </span>
          <span>
            SHIVAM GUPTA
            <br />
            <b>APPLIED AI & PRODUCT</b>
          </span>
        </a>
        <div className="header-location">
          <span>DEL ↗ DXB ↗ EVERYWHERE</span>
          <span>INDEPENDENT MIND. COLLECTIVE IMPACT.</span>
        </div>
        <button className="availability" onClick={() => navigate("contact")}>
          <i />
          OPEN TO ROLES & PROJECTS <ArrowUpRight size={14} />
        </button>
      </header>
      <main id="main" tabIndex={-1} className="room-main" key={room}>
        {room === "studio" && (
          <section
            className="studio-room"
            aria-label="Shivam Gupta, applied AI engineer and product builder"
          >
            <div className="studio-intro">
              <p className="eyebrow">APPLIED AI ENGINEER / FOUNDER, SILOED.</p>
              <h2>
                I make intelligence
                <br />
                do something <em>useful.</em>
              </h2>
              <p>
                From the first “what if”
                <br />
                to the thing you can actually use.
              </p>
              <button className="text-link" onClick={() => navigate("work")}>
                Enter the work <ArrowUpRight size={19} />
              </button>
            </div>
            <div className="studio-art">
              <Suspense fallback={<div className="scene-loading" />}>
                <Intelligence
                  district={district}
                  paused={paused || chatOpen || !!selected}
                  onSelect={chooseProject}
                />
              </Suspense>
            </div>
            <div className="studio-side">
              <span className="side-note">A MIND IN MOTION / VOL. 01</span>
              <div className="discipline-select">
                {categories.slice(1).map((c, i) => (
                  <button
                    key={c.id}
                    aria-pressed={district === c.id}
                    onClick={() =>
                      setDistrict(district === c.id ? "all" : c.id)
                    }
                  >
                    <span>0{i + 1}</span>
                    {c.short}
                    <i />
                  </button>
                ))}
              </div>
              <div className="scene-control">
                <span>
                  DRAG THE SCULPTURE
                  <br />
                  FOLLOW A PROJECT NODE
                </span>
                <button
                  onClick={() => setPaused(!paused)}
                  aria-label={paused ? "Animate sculpture" : "Pause sculpture"}
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
              </div>
              <div className="artifact-label">
                <span className="crosshair" aria-hidden="true">
                  +
                </span>
                <div>
                  NOTHING HERE IS ISOLATED.
                  <br />
                  <b>FOUR DISCIPLINES. ONE BUILDER.</b>
                </div>
              </div>
            </div>
            <h1 className="monument-name" aria-label="Shivam Gupta">
              SHI<span>V</span>AM<span className="name-period">.</span>
            </h1>
            <div className="studio-bottom">
              <p>
                BUILDER OF SYSTEMS.
                <br />
                <span>AND OCCASIONALLY, GOOD TROUBLE.</span>
              </p>
              <div
                className="studio-project-links"
                aria-label="Explore real projects"
              >
                {visibleNodes.slice(0, 2).map((p) => (
                  <button key={p.id} onClick={() => chooseProject(p)}>
                    {p.name} <ArrowUpRight size={12} />
                  </button>
                ))}
              </div>
              <span className="studio-ai-note">
                The AI guide is one click away. <ArrowDownLeft size={15} />
              </span>
            </div>
          </section>
        )}
        {room === "work" && (
          <section className="work-room" aria-labelledby="work-title">
            <div className="room-heading">
              <div>
                <p className="eyebrow">
                  01 / A FEW THINGS I’VE PUT INTO THE WORLD
                </p>
                <h1 id="work-title">
                  Proof of
                  <br />
                  <em>curiosity.</em>
                </h1>
              </div>
              <p>
                Tools. Experiments. Products.
                <br />
                Real source. Honest boundaries.
              </p>
            </div>
            <div className="work-layout">
              <div className="work-index">
                <div className="work-filters">
                  <div>
                    <Search size={16} />
                    <input
                      aria-label="Search projects"
                      placeholder="Find something interesting…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    aria-label="Project category"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as District)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="index-heading">
                  <span>PROJECT / {ordered.length}</span>
                  <span>OPEN TO EXPLORE ↘</span>
                </div>
                <div className="work-list">
                  {ordered.map((p, i) => (
                    <button
                      className={activeId === p.id ? "active" : ""}
                      key={p.id}
                      onMouseEnter={() => setActiveId(p.id)}
                      onFocus={() => setActiveId(p.id)}
                      onClick={() => chooseProject(p)}
                    >
                      <span className="work-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="work-project-name">{p.name}</span>
                      <ArrowUpRight size={22} />
                    </button>
                  ))}
                </div>
                {!ordered.length && (
                  <div className="empty-results">
                    <p>No projects found.</p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
              <aside
                className="work-preview"
                key={active.id}
                hidden={!ordered.length}
              >
                <div className="preview-caption">
                  <span>IN FOCUS</span>
                  <span>{active.language}</span>
                </div>
                <div className="work-preview-copy">
                  <p className="eyebrow">
                    {story?.kicker ||
                      categories.find((c) => c.id === active.district)?.label}
                  </p>
                  <h2>{story?.title || active.name}</h2>
                  <p>{story?.summary || active.description}</p>
                  <button
                    className="text-link"
                    onClick={() => chooseProject(active)}
                  >
                    Open {active.name} <ArrowUpRight size={18} />
                  </button>
                </div>
                <ProjectVisual
                  type={story?.visual || "graph"}
                  name={active.name}
                />
                <div className="preview-footer">
                  <span>LESS CLAIM. MORE EVIDENCE.</span>
                  <span>↗</span>
                </div>
              </aside>
            </div>
          </section>
        )}
        {room === "about" && (
          <section className="human-room" aria-labelledby="human-title">
            <div className="human-intro">
              <div className="human-poster">
                <p className="eyebrow">02 / THE PERSON, NOT THE PROMPT</p>
                <h1 id="human-title">
                  Part engineer.
                  <br />
                  Part founder.
                  <br />
                  <em>
                    Entirely
                    <br />
                    curious.
                  </em>
                </h1>
                <div className="human-signature">
                  Shivam Gupta <ArrowDownLeft size={28} />
                </div>
                <p className="human-location">
                  DUBAI / DELHI
                  <br />
                  COMPUTER SCIENCE & DESIGN, IIIT DELHI
                </p>
              </div>
              <div className="human-story">
                <p className="human-lead">Design-trained. Production-tested.</p>
                <p>
                  Computer Science & Design at IIIT Delhi taught me to think about
                  the person and the system together. I’ve taken that into
                  learning tools for 5,000+ learners, enterprise AI at Khoros and
                  IgniteTech, and my own consultancy.
                </p>
                <p>
                  I'm an applied AI engineer and product builder. I founded{" "}
                  <strong>Siloed</strong> to help teams turn difficult workflows
                  into useful systems. My work spans enterprise software,
                  education, agents, and the occasional experiment that simply
                  needed to exist.
                </p>
                <div className="human-numbers">
                  <div>
                    <strong>5,000+</strong>
                    <span>learners reached</span>
                  </div>
                  <div>
                    <strong>10+</strong>
                    <span>consultancy clients</span>
                  </div>
                </div>
              </div>
            </div>
            <BackgroundBook />
            <section className="human-career" aria-labelledby="career-title">
              <div className="career-intro">
                <p className="eyebrow">THE WORK, WITH PEOPLE</p>
                <h2 id="career-title" tabIndex={-1}>A few places<br />I’ve put it<br /><em>into practice.</em></h2>
                <p>Building products, leading work, and learning from the people around me.</p>
              </div>
              <div className="human-story career-story">
                <div className="experience-heading">
                  <span>IN TEAMS, AT SCALE</span>
                  <span>OPEN A CHAPTER ↓</span>
                </div>
                <div className="career-list">
                  {career.map((c) => (
                    <details key={c.company} className="career-row">
                      <summary>
                        <div>
                          <h3>{c.company}</h3>
                          <p>{c.role}</p>
                        </div>
                        <span className="career-period">{c.period}</span>
                        <Plus size={16} />
                      </summary>
                      <div className="career-details">
                        <p>{c.summary}</p>
                        <p>{c.detail}</p>
                        <strong>{c.metric}</strong>
                      </div>
                    </details>
                  ))}
                </div>
                <p className="learning-impact">
                  I helped develop learning products and end-to-end AI systems for
                  a pioneering, successful network of AI-first schools.
                </p>
                <p className="earlier-work">
                  Before this, I worked on founding Giggles, a product company,
                  alongside research work and engineering and product roles at
                  various startups.
                </p>
                <p className="ai-training-work">
                  I’ve also contributed to AI training projects through Scale AI
                  and micro1, spanning software engineering and AI engineering.
                </p>
                <a
                  className="text-link"
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  The longer story on LinkedIn <ArrowUpRight size={17} />
                </a>
              </div>
            </section>
          </section>
        )}
        {room === "lab" && <Lab />}
        {room === "contact" && (
          <section className="contact-room" aria-labelledby="contact-title">
            <div className="contact-poster">
              <p className="eyebrow">04 / THIS IS WHERE SOMETHING STARTS</p>
              <h1 id="contact-title">
                LET’S
                <br />
                MAKE
                <br />
                <span>IT REAL</span>
                <span className="contact-star">✳</span>
              </h1>
              <p className="contact-invitation">
                Good people. Difficult problems.
                <br />
                Something worth putting into the world.
              </p>
              <a
                className="contact-immediate text-link"
                href={`mailto:${email}`}
              >
                Start a conversation <ArrowUpRight size={19} />
              </a>
            </div>
            <div className="contact-right">
              <span className="contact-availability">
                <i />
                OPEN TO ROLES & COLLABORATIONS
              </span>
              <a
                className="contact-choice"
                href={`mailto:${email}?subject=${encodeURIComponent("An opportunity for Shivam")}`}
              >
                <span>01 / BUILD THE TEAM</span>
                <h2>
                  One more builder.
                  <br />A lot more possibility.
                </h2>
                <p>
                  Applied AI and product engineering roles.
                  <br />
                  Remote, relocation, and ambitious problems.
                </p>
                <ArrowUpRight />
              </a>
              <a
                className="contact-choice"
                href={`mailto:${email}?subject=${encodeURIComponent("Let’s build with Siloed")}`}
              >
                <span>02 / BUILD THE THING</span>
                <h2>Bring it to Siloed.</h2>
                <p>
                  AI products, agent systems, internal tools,
                  <br />
                  evaluation, and hands-on AI adoption.
                </p>
                <ArrowUpRight />
              </a>
              <div className="contact-email">
                <a href={`mailto:${email}`}>
                  {email}
                  <ArrowUpRight size={18} />
                </a>
                <button
                  onClick={copyEmail}
                  aria-label={copied ? "Email copied" : "Copy email address"}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="contact-social">
                <a
                  href="https://github.com/shi1720"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
                <a href={linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
                <button
                  onClick={() => ask("What could Siloed build for my team?")}
                >
                  Ask the AI guide ↗
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
      <div className="studio-dock-wrap">
        <span className="dock-side-label">EXPLORE A DIFFERENT SIDE</span>
        <nav className="studio-dock" aria-label="Explore the portfolio">
          {rooms.map((r) => (
            <a
              key={r.id}
              href={`#${r.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(r.id);
              }}
              aria-current={room === r.id ? "page" : undefined}
            >
              <span>{r.num}</span>
              {r.name}
            </a>
          ))}
          <button
            className="dock-ai"
            aria-label="Open AI portfolio guide"
            onClick={() => ask()}
          >
            <Sparkles size={19} />
          </button>
        </nav>
        <span className="dock-side-label dock-copyright">
          © 2026 / MADE WITH INTENT
        </span>
      </div>
      <ProjectDialog project={selected} onClose={closeProject} onAsk={ask} />
      <Chat
        open={chatOpen}
        onOpenChange={setChatOpen}
        question={question}
        onQuestionUsed={useQuestion}
      />
    </div>
  );
}
