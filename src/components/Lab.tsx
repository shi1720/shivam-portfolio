import { useEffect, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Download,
  ArrowUpRight,
  Check,
  Zap,
} from "lucide-react";
import {
  runExperiment,
  exportPython,
  type ExperimentConfig,
  type ExperimentResult,
} from "../../shared/simulator.mjs";
export default function Lab() {
  const [fault, setFault] = useState<ExperimentConfig["fault"]>("lost_ack");
  const [policy, setPolicy] = useState<ExperimentConfig["policy"]>("retry");
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  function run() {
    if (timer.current) clearInterval(timer.current);
    const next = runExperiment({ fault, policy });
    setResult(next);
    setShown(0);
    setRunning(true);
    let count = 0;
    timer.current = setInterval(
      () => {
        count++;
        setShown(count);
        if (count >= next.events.length) {
          clearInterval(timer.current!);
          setRunning(false);
        }
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 250,
    );
  }
  function reset() {
    if (timer.current) clearInterval(timer.current);
    setResult(null);
    setRunning(false);
    setShown(0);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([exportPython({ fault, policy })], { type: "text/x-python" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "shivam-agent-experiment.py";
    a.click();
    URL.revokeObjectURL(url);
  }
  const complete = result && !running;
  return (
    <section className="section lab" id="lab">
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 / THE HANDS-ON PART</p>
          <h1>
            Trust is built.
            <br />
            <span>Break something.</span>
          </h1>
        </div>
        <p>
          A tool can succeed while its response fails.
          <br />
          Build a recovery policy. See the difference.
        </p>
      </div>
      <div className="lab-workbench">
        <div className="lab-config">
          <div className="lab-label">
            <Zap size={16} />
            <span>AGENT RELIABILITY LAB</span>
          </div>
          <p className="lab-intro">
            Your agent creates a shipment.
            <br />
            Then something goes wrong.
          </p>
          <label htmlFor="fault">01 &nbsp; Introduce a failure</label>
          <select
            id="fault"
            value={fault}
            disabled={running}
            onChange={(e) => {
              setFault(e.target.value as ExperimentConfig["fault"]);
              reset();
            }}
          >
            <option value="lost_ack">Lost acknowledgement</option>
            <option value="unavailable">Service unavailable</option>
            <option value="invalid_output">Malformed response</option>
          </select>
          <label htmlFor="policy">02 &nbsp; Choose its response</label>
          <select
            id="policy"
            value={policy}
            disabled={running}
            onChange={(e) => {
              setPolicy(e.target.value as ExperimentConfig["policy"]);
              reset();
            }}
          >
            <option value="stop">Stop on failure</option>
            <option value="retry">Retry blindly</option>
            <option value="verified">Idempotent retry + validation</option>
          </select>
          <button
            className="button primary lab-run"
            onClick={run}
            disabled={running}
          >
            {running
              ? "Running experiment…"
              : result
                ? "Run again"
                : "Run experiment"}
            <Play size={16} />
          </button>
          <p className="lab-local">
            Deterministic simulation · Runs in your browser.
            <br />
            No LLM, API calls, or real shipments.
          </p>
        </div>
        <div className="lab-output">
          <div className="lab-output-header">
            <span className="mono">EXECUTION TRACE</span>
            <button
              onClick={reset}
              disabled={!result || running}
              aria-label="Reset experiment"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div
            className={`lab-causal-diagram ${complete ? (result.success ? "verified" : "faulted") : ""}`}
            aria-label="A request commits a shipment, then returns an acknowledgement"
          >
            <div>
              <span>01 / INTENT</span>
              <strong>Agent request</strong>
            </div>
            <i>→</i>
            <div>
              <span>02 / SIDE EFFECT</span>
              <strong>
                {complete
                  ? `${result.shipments} shipment${result.shipments === 1 ? "" : "s"}`
                  : "Create shipment"}
              </strong>
            </div>
            <i className="ack-arrow">
              {complete && !result.success ? "×" : "→"}
            </i>
            <div>
              <span>03 / EVIDENCE</span>
              <strong>
                {complete
                  ? result.success
                    ? "Verified ✓"
                    : "Needs review"
                  : "Acknowledgement"}
              </strong>
            </div>
          </div>
          <div className="trace" aria-live="polite" aria-busy={running}>
            {!result ? (
              <div className="lab-empty">
                <span className="trace-symbol">→ ?</span>
                <h3>The happy path is easy.</h3>
                <p>
                  Start with a lost acknowledgement and a blind retry.
                  <br />
                  Then try a policy that remembers the operation.
                </p>
              </div>
            ) : (
              result.events.slice(0, shown).map((event, i) => (
                <div className={`trace-event ${event.tone}`} key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{event.label}</strong>
                    <p>{event.detail}</p>
                  </div>
                  {event.tone === "good" && <Check size={14} />}
                </div>
              ))
            )}
          </div>
          <div
            className={`lab-result ${complete ? (result.success ? "success" : "failure") : ""}`}
            aria-live="polite"
          >
            <div>
              <span>TOOL CALLS</span>
              <strong>{complete ? result.calls : "Pending"}</strong>
            </div>
            <div>
              <span>SHIPMENTS</span>
              <strong>{complete ? result.shipments : "Pending"}</strong>
            </div>
            <div>
              <span>OUTCOME</span>
              <strong>
                {complete
                  ? result.success
                    ? "Verified"
                    : "Needs review"
                  : "Awaiting run"}
              </strong>
            </div>
          </div>
        </div>
      </div>
      <div className="lab-foot">
        <p>
          Inspired by my work on{" "}
          <a
            href="https://github.com/shi1720/toolstorm"
            target="_blank"
            rel="noreferrer"
          >
            ToolStorm
          </a>{" "}
          &{" "}
          <a
            href="https://github.com/shi1720/agent-rehearsal"
            target="_blank"
            rel="noreferrer"
          >
            Agent Rehearsal <ArrowUpRight size={12} />
          </a>
          .
        </p>
        <button onClick={download}>
          <Download size={15} /> Take the experiment with you <span>.py</span>
        </button>
      </div>
    </section>
  );
}
