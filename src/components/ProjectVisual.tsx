import {
  AudioLines,
  Check,
  GitBranch,
  Terminal,
  Circle,
  ArrowRight,
  ArrowDownRight,
  Timer,
} from "lucide-react";
export default function ProjectVisual({
  type,
  name,
  projectId,
}: {
  type: string;
  name: string;
  projectId: string;
}) {
  if (type === "pipeline")
    return (
      <div className="project-visual pipeline-visual" aria-hidden="true">
        <div className="visual-topline"><span>◎ OFFERLOOP / YOUR NEXT MOVE</span><span>JOB SEARCH CRM</span></div>
        <div className="pipeline-heading">Less scattered.<br /><em>More forward.</em></div>
        <div className="pipeline-stages">
          <div><span>01 / CAPTURE</span><i /><strong>The right role</strong><small>Posting + context</small></div>
          <div><span>02 / FOLLOW UP</span><i /><strong>Your next action</strong><small>A grounded draft</small></div>
          <div><span>03 / PREPARE</span><i /><strong>A real conversation</strong><small>Your own proof points</small></div>
        </div>
        <p className="visual-caption">Your applications. Your voice. A system to keep moving.</p>
      </div>
    );
  if (type === "voice")
    return (
      <div className="project-visual voice-visual" aria-hidden="true">
        <div className="visual-topline">
          <span>
            <AudioLines size={14} /> BENCHBACK / LIVE WORKFLOW
          </span>
          <span>DEMO RECORD</span>
        </div>
        <div className="voice-line">
          “The alternator is ready
          <br />
          to go back.”
        </div>
        <div className="waveform">
          {Array.from({ length: 58 }, (_, i) => (
            <i
              key={i}
              style={{
                height: `${6 + Math.abs(Math.sin(i * 0.67) * Math.cos(i * 0.21)) * 54}px`,
                animationDelay: `${i * 25}ms`,
              }}
            />
          ))}
        </div>
        <div className="voice-flow">
          <span>
            <Check size={12} /> IDENTIFIED
          </span>
          <b aria-hidden="true">→</b>
          <span>
            <Check size={12} /> INSPECTED
          </span>
          <b aria-hidden="true">→</b>
          <span>RETURN READY</span>
        </div>
        <div className="credit-card">
          <div>
            <span>REFUNDABLE CORE DEPOSIT</span>
            <strong>$240.00</strong>
          </div>
          <div className="credit-ring">
            <Check size={22} />
          </div>
        </div>
      </div>
    );
  if (type === "terminal")
    return (
      <div className="project-visual terminal-visual" aria-hidden="true">
        <div className="visual-topline">
          <span>
            <Terminal size={14} /> REPOGYM / ENVIRONMENT 001
          </span>
          <span>PYTHON</span>
        </div>
        <div className="code-line">
          <b>01</b>
          <span>
            <em>env</em> = RepoEnv(task)
          </span>
        </div>
        <div className="code-line">
          <b>02</b>
          <span>
            state = env.<em>reset</em>()
          </span>
        </div>
        <div className="code-line">
          <b>03</b>
          <span>
            result = env.<em>step</em>(Submit())
          </span>
        </div>
        <div className="terminal-result">
          <span>
            <Circle size={10} /> BASELINE
          </span>
          <strong className="failed">0.00</strong>
          <div />
          <span>
            <Check size={13} /> GOLDEN PATCH
          </span>
          <strong>1.00</strong>
        </div>
        <p className="terminal-foot">
          same task. verifiable difference. <span>▌</span>
        </p>
      </div>
    );
  if (type === "checkpoint")
    return (
      <div className="project-visual checkpoint-visual" aria-hidden="true">
        <div className="visual-topline">
          <span>UNPAUSE / A WAY BACK</span>
          <span>LOCAL-FIRST</span>
        </div>
        <div className="checkpoint-orbit">
          <span>u.</span>
          <i />
          <i />
          <i />
        </div>
        <div className="checkpoint-note">
          <span>
            <Timer size={13} /> 10 MINUTES · LOW ENERGY
          </span>
          <strong>
            A small step
            <br />
            is still a step.
          </strong>
          <p>Pick up where you left off.</p>
          <span className="resume-chip">
            Resume your project <ArrowRight size={15} />
          </span>
        </div>
      </div>
    );
  if (type === "fault" && projectId === "casecrop")
    return (
      <div className="project-visual fault-visual" aria-hidden="true">
        <div className="visual-topline">
          <span>
            <GitBranch size={14} /> CASECROP / CACHE FIXTURE
          </span>
          <span>SAME FAILURE</span>
        </div>
        <div className="fault-nodes">
          <div>
            TRACE<span>events</span>
          </div>
          <i>→</i>
          <div>
            REPLAY<span>links kept</span>
          </div>
          <i>→</i>
          <div>
            CASE<span>failing</span>
          </div>
        </div>
        <div className="fault-policies">
          <div>
            <span>Recorded trace</span>
            <strong>36 events</strong>
          </div>
          <div>
            <span>Reduced trace</span>
            <strong>
              6 events <Check size={15} />
            </strong>
          </div>
        </div>
        <p className="visual-caption">Bundled cache fixture. Smaller trace, same failure.</p>
      </div>
    );
  const checkout = projectId === "agent-rehearsal";
  if (type === "fault")
    return (
      <div className="project-visual fault-visual" aria-hidden="true">
        <div className="visual-topline">
          <span>
            <GitBranch size={14} />{" "}
            {checkout ? "AGENT REHEARSAL / CHECKOUT FIXTURE" : "TOOLSTORM / FAILURE 001"}
          </span>
          <span>DETERMINISTIC</span>
        </div>
        <div className="fault-nodes">
          <div>
            AGENT<span>request</span>
          </div>
          <i>→</i>
          <div className="fault-tool">
            {checkout ? "PAYMENT" : "TOOL"}
            <span>committed ✓</span>
          </div>
          <i>→</i>
          <div className="lost-response">
            ×<span>ack lost</span>
          </div>
        </div>
        <div className="fault-policies">
          <div>
            <span>Blind retry</span>
            <strong>{checkout ? "2 charges" : "2 shipments"}</strong>
          </div>
          <div>
            <span>Verified recovery</span>
            <strong>
              {checkout ? "1 charge" : "1 shipment"} <Check size={15} />
            </strong>
          </div>
        </div>
        <p className="visual-caption">
          The action succeeded. The response didn't.
        </p>
      </div>
    );
  if (type === "graph")
    return (
      <div className="project-visual graph-visual" aria-hidden="true">
        <div className="visual-topline">
          <span>{name.toUpperCase()} / EVIDENCE MAP</span>
          <span>SOURCE-LINKED</span>
        </div>
        <svg viewBox="0 0 500 240">
          <g fill="none" stroke="#82a78e" strokeWidth="1">
            <path d="M75 115L230 57L412 63M75 115L230 173L412 177M230 57L412 177M230 173L412 63" />
            <circle cx="75" cy="115" r="31" />
            <circle cx="230" cy="57" r="25" />
            <circle cx="230" cy="173" r="25" />
            <circle cx="412" cy="63" r="25" />
            <circle cx="412" cy="177" r="25" />
          </g>
          <g fill="#d7fc70">
            <circle cx="75" cy="115" r="6" />
            <circle cx="230" cy="57" r="5" />
            <circle cx="230" cy="173" r="5" />
            <circle cx="412" cy="63" r="5" />
          </g>
          <circle cx="412" cy="177" r="5" fill="#d4ad75" />
          <g fill="#b9c8b5" fontSize="9" fontFamily="monospace">
            <text x="51" y="163">
              SOURCE LOT
            </text>
            <text x="209" y="101">
              BATCH A
            </text>
            <text x="209" y="217">
              BATCH B
            </text>
            <text x="391" y="107">
              VERIFIED
            </text>
            <text x="385" y="221">
              ON HOLD
            </text>
          </g>
        </svg>
        <p className="visual-caption">One source. Every consequence.</p>
      </div>
    );
  return (
    <div className="project-visual type-visual" aria-hidden="true">
      <div className="visual-topline">
        <span>PLOT TWIST / ORIGINAL CHARACTERS</span>
        <span>JUST FOR FUN</span>
      </div>
      <div className="plot-type">
        main
        <br />
        <span>character</span>
        <br />
        energy
        <ArrowDownRight />
      </div>
      <p className="visual-caption">36 scenes. 16 characters. Your plot.</p>
    </div>
  );
}
