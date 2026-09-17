export type Story = {
  kicker: string;
  title: string;
  summary: string;
  problem: string;
  built: string;
  evidence: string;
  boundary: string;
  tags: string[];
  demo?: string;
  architecture?: string;
  visual: string;
};
export const stories: Record<string, Story> = {
  AssemblyAI: {
    kicker: "VOICE AI / OPERATIONAL SYSTEMS",
    title: "A conversation that actually closes the loop.",
    summary:
      "Benchback turns parts-core returns into voice-guided, auditable workflows. From a mechanic’s inspection to the supplier credit that finally arrives.",
    problem:
      "A shop ships a used part back. The deposit is still outstanding. A voice interface helps only if the return, the evidence, and the eventual credit stay in agreement.",
    built:
      "A voice agent with scoped tools, server-owned workflow state, integer-cent transactions, revision checks, and idempotent credit reconciliation. Human approval stays explicit.",
    evidence:
      "A fictional $240 deposit runs from inspection through dispatch and two partial credits. Unit, integration, and browser tests cover the lifecycle.",
    boundary:
      "Working hackathon product. No paid pilot, ERP integration, carrier purchase, or automatic supplier submission is claimed.",
    tags: ["AssemblyAI", "Next.js", "Firebase", "State machines"],
    demo: "https://benchback-ai.web.app",
    architecture:
      "https://github.com/shi1720/AssemblyAI/blob/main/docs/architecture.md",
    visual: "voice",
  },
  repogym: {
    kicker: "AGENT INFRASTRUCTURE / OPEN SOURCE",
    title: "Better agents start with trustworthy environments.",
    summary:
      "Real repositories become verifiable training and evaluation environments. Inspect the task, the patch, and the reward.",
    problem:
      "A coding-agent score is only useful when its tests really distinguish a working solution from a plausible shortcut.",
    built:
      "Declarative repository tasks, a reset/step interface, composable graders, protected test files, sandbox adapters, and golden/no-op validation.",
    evidence:
      "Executable examples and a Python test suite verify task lifecycle and grading. The site explains how to build and validate an environment.",
    boundary:
      "A framework and example environments; not a claim that a frontier model was trained or improved. Local execution is not hostile-code isolation.",
    tags: ["Python", "Agent evaluation", "RL environments"],
    demo: "https://shi1720.github.io/repogym/",
    architecture:
      "https://github.com/shi1720/repogym/blob/main/ARCHITECTURE.md",
    visual: "terminal",
  },
  "RevenueCat-Shipaton": {
    kicker: "PRODUCT CRAFT / CROSS-PLATFORM",
    title: "Leave yourself a way back.",
    summary:
      "Unpause is a home for unfinished creative projects. Remember where you stopped, pick a small next step, and begin again.",
    problem:
      "When you finally have ten spare minutes, remembering where you stopped should not consume all ten.",
    built:
      "A local-first web and native experience with durable project storage, restart-safe timers, checkpoint history, portable backups, and purchase/restore integration.",
    evidence:
      "Web and native tests, plus documented emulator and test-store evidence. A public web app and Android preview are available.",
    boundary:
      "Projects stay on the device; accounts do not sync them. App-store launch, production billing, and remaining physical-device gates are separate.",
    tags: ["React Native", "Local-first", "RevenueCat", "Product design"],
    demo: "https://unpause-studio.web.app",
    visual: "checkpoint",
  },
  toolstorm: {
    kicker: "AGENT RELIABILITY / OPEN SOURCE",
    title: "The tool failed. Did the action?",
    summary:
      "ToolStorm makes agent failures reproducible. Lose an acknowledgement, inspect the committed effect, and find out what a retry really does.",
    problem:
      "A shipment succeeds but its response disappears. An unchecked retry creates a second shipment. Success and acknowledgement are different events.",
    built:
      "A zero-dependency Python library for seeded tool failures, explicit side effects, call budgets, virtual clocks, and strict offline replay. The browser lab runs the same Python in Pyodide.",
    evidence:
      "Native/browser parity and property tests cover fault and replay behavior. The public lab lets you compare recovery policies.",
    boundary:
      "Scripted recovery experiments, not an LLM performance benchmark. Source-install beta; no PyPI release or production adoption claim.",
    tags: ["Python", "Fault injection", "Pyodide", "Replay"],
    demo: "https://toolstorm-shi1720.sg127977958.chatgpt.site",
    architecture:
      "https://github.com/shi1720/toolstorm/blob/main/docs/architecture.md",
    visual: "fault",
  },
  "Nebius-x-NVIDIA": {
    kicker: "DOCUMENT AI / EVIDENCE GRAPHS",
    title: "Every decision has a paper trail.",
    summary:
      "RecallRoom follows an ingredient lot through finished products and shipments, with source quotations behind every relationship.",
    problem:
      "A recalled ingredient can travel through multiple batches. Missing, uncertain, and corrected evidence must not be collapsed into false certainty.",
    built:
      "Nemotron extraction with schema and evidence validation, human-approved records, asynchronous processing, and deterministic graph traversal without double counting.",
    evidence:
      "A fictional food-recall scenario, documented provider run, fixture variants, and graph checks against an independent fixed-point oracle.",
    boundary:
      "Evaluated MVP, not a certified food-safety product. No independent extraction accuracy, ERP connector, or automated customer messaging is claimed.",
    tags: ["NVIDIA Nemotron", "Graph reasoning", "Human review"],
    demo: "https://recallroom.web.app",
    architecture:
      "https://github.com/shi1720/Nebius-x-NVIDIA/blob/main/docs/architecture.md",
    visual: "graph",
  },
  plottwist: {
    kicker: "CREATIVE TECHNOLOGY / CONSUMER",
    title: "A little less predictable.",
    summary:
      "A personality sitcom with original characters, private local answers, and a scoring system that shows its working.",
    problem:
      "A playful quiz can still respect privacy and explain why it reached its result.",
    built:
      "Thirty-six scenes, sixteen original characters, transparent TypeScript scoring, a Python reference implementation, and browser-generated sharing cards.",
    evidence:
      "Scoring parity and browser tests cover the journey. Answers stay local to the browser.",
    boundary: "Entertainment, not psychometrics or a personality diagnosis.",
    tags: ["TypeScript", "Creative coding", "Private by design"],
    demo: "https://plottwist.sg127977958.chatgpt.site",
    visual: "type",
  },
  casecrop: {
    kicker: "DEVELOPER TOOLS / DEBUGGING",
    title: "Keep the failure. Lose the noise.",
    summary:
      "Reduce a long event trace into a smaller reproducible regression case without losing its dependencies.",
    problem:
      "A long trace makes a bug difficult to explain. Removing events carelessly can remove the bug or change what failed.",
    built:
      "A Python reduction engine with dependency closure, pinned events, failure signatures, oracle budgets, a deletion audit, and a fresh final replay.",
    evidence:
      "The bundled cache fixture reduces 36 events to 6. Native/browser engine parity is tested.",
    boundary:
      "This fixture is not a universal reduction rate. A minimal trace is not proof of root cause or a global minimum.",
    tags: ["Python", "Delta debugging", "Agent traces"],
    demo: "https://casecrop-shi1720.sg127977958.chatgpt.site",
    visual: "fault",
  },
  "AI-Infra-Summit-Hackathon": {
    kicker: "ROBOTICS / SIMULATION",
    title: "A plan breaks. The evidence stays.",
    summary:
      "A robotic workbench for inspectable interventions, recovery, and dual-arm task execution.",
    problem:
      "An obstacle or lost grasp changes a robotic task. The system needs to explain why the next action is permitted.",
    built:
      "A MuJoCo execution service, dual SO101 arms, learned joint-target proposals, numerical correction, OpenVINO safety signals, and event exports.",
    evidence:
      "Backend simulation evidence is distinguished from the illustrative browser animation.",
    boundary:
      "Simulation MVP, not a physical robot deployment, end-to-end VLA policy, or safety certification.",
    tags: ["MuJoCo", "OpenVINO", "FastAPI"],
    demo: "https://granted-robotics.web.app",
    visual: "graph",
  },
  "repo-gauntlet": {
    kicker: "BENCHMARK QUALITY / OPEN SOURCE",
    title: "Test the test before you trust the score.",
    summary:
      "Broken, incomplete, and golden controls calibrate coding tasks across five languages.",
    problem:
      "A benchmark may accept a shortcut or reject its own reference solution.",
    built:
      "A Python control plane, manifest validation, fresh workspaces, overlay allowlists, distinct failure classes, and normalized report hashes.",
    evidence:
      "Five language packs and fifteen committed control reports. The browser replays those reports.",
    boundary:
      "An evidence viewer, not a browser runtime for arbitrary code. The local runner assumes trusted task authors.",
    tags: ["Python", "Polyglot", "CI", "Evaluation"],
    demo: "https://shi1720.github.io/repo-gauntlet/",
    visual: "terminal",
  },
  "Amazon-Developer-Hackathon": {
    kicker: "MCP / HUMAN COORDINATION",
    title: "An offer is not a promise.",
    summary:
      "KindHandoff repairs disrupted family support plans with explicit helper acceptance and versioned handoffs.",
    problem:
      "One cancellation can break several dependent arrangements. Suggesting a replacement does not mean they agreed.",
    built:
      "A Streamable HTTP MCP server, scoped tokens, separate helper sessions, dependency gates, and versioned acknowledgements.",
    evidence:
      "A reproducible multi-session flow and inspectable MCP trace with fictional households.",
    boundary:
      "Alexa+ browser simulation is labeled. Native Alexa+ deployment is a separate step.",
    tags: ["MCP", "Firebase", "State machines"],
    demo: "https://kindhandoff.web.app",
    visual: "graph",
  },
  OffHire: {
    kicker: "VOICE AGENTS / OPERATIONS",
    title: "A phone call is not a closed rental.",
    summary:
      "Separate billing cutoff, collection, and return evidence when closing equipment rentals.",
    problem:
      "“We’ll collect it tomorrow” does not establish when billing stops.",
    built:
      "CALL-E integration, persistent request identity, idempotency keys, account budgets, and transcript-grounded extraction.",
    evidence:
      "Offline workflow and Firebase emulator checks; public rehearsal uses labeled synthetic transcripts.",
    boundary:
      "A real owned-number CALL-E test has not been conducted. No verified supplier pilot or savings claim.",
    tags: ["CALL-E", "Evidence extraction", "B2B"],
    demo: "https://offhire.web.app",
    visual: "voice",
  },
  "mixed-signals": {
    kicker: "CREATIVE CODING / COLLECTIVE DATA",
    title: "A globe full of human contradictions.",
    summary:
      "Anonymous city-level experiences, a shared reveal, and a deliberate privacy boundary.",
    problem:
      "Small samples can expose participants or create misleading results.",
    built:
      "An interactive geographic globe, accessible list, retry-safe submissions, frozen reveals, deletion receipts, and metric suppression.",
    evidence:
      "Illustrative fixtures remain separate from real submissions. Database rules enforce reveal boundaries.",
    boundary:
      "Season 001 has ended. Preview data is fictional and not a representative research dataset.",
    tags: ["Geospatial UI", "Cloudflare D1", "Privacy"],
    demo: "https://mixed-signals-atlas.sg127977958.chatgpt.site",
    visual: "graph",
  },
};
