import ts from "typescript";
import fs from "node:fs";
const source = fs.readFileSync("src/stories.ts", "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { stories } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);
const projects = JSON.parse(fs.readFileSync("src/catalog.json", "utf8"));
const knowledge = projects.map((p) => ({
  id: p.id,
  title: p.name,
  url: p.url,
  content: stories[p.id] || p.description,
}));
knowledge.push({
  id: "experience",
  title: "Professional experience",
  url: "https://shivam-web-app.web.app/#about",
  content: {
    source:
      "Shivam Gupta supplied resume, September 2026. Professional outcomes are resume-reported, not independently validated.",
    roles: [
      "Siloed: Founder and CEO since March 2025, Dubai. AI consultancy serving 10+ global clients across finance, healthcare, SaaS and other sectors. Custom AI apps, agents, product strategy, evaluation, and adoption workshops. Reports 25+ hours saved per team per week.",
      "Khoros: Senior AI Product Engineer, contract, September 2025–present. Led AI/analytics engineering on IRIS AI with five engineers and one designer; led three engineers to deliver earlier IRIS for X in one month. Delivered 10 production AI features.",
      "IgniteTech: Senior AI Product Engineer, contract, September 2025–present. Product and engineering for Personas.ai and Eloquens.ai; 12+ features and reported 25% activation improvement. Built MetricsHub, an AI usage analytics and automated executive-briefing platform.",
      "Trilogy and portfolio assignment 2 Hour Learning: April 2024–September 2025. Promoted to Senior December 2024. Helped ship AlphaLearn/AlphaVocab to 5,000+ learners; co-built PowerPath and co-developed Incept. Resume reports 18% higher assessment scores, 32% engagement improvement, $1M+ annual Incept savings. These are overlapping portfolio roles, not additive years.",
      "Earlier: Spilll product management intern 2024; IIIT Delhi undergraduate researcher on LLM journalism extension 2023; Sensight Labs chatbot intern 2023; Giggles founder 2022–2023 (six-person team and resume-reported 2,000+ downloads); Bharat Electronics Limited summer researcher 2022.",
      "Education: B.Tech Computer Science & Design, IIIT Delhi. Graduation date not supplied.",
    ],
  },
});
knowledge.push({
  id: "contact",
  title: "Work with Shivam / Siloed",
  url: "https://shivam-web-app.web.app/#contact",
  content:
    "Shivam Gupta is an applied AI engineer, product builder and founder of Siloed, based in Dubai / Delhi. Open to applied AI and product engineering roles, remote work and relocation, and selected Siloed engagements. Email shivam1720406@gmail.com. LinkedIn https://www.linkedin.com/in/shivamgupta-ai/. Services: AI workflow design, agents and internal tools, full-stack prototypes and products, evaluation and reliability, product modernization, AI adoption workshops. Do not invent rates, available calendar slots, client names, salaries or commitments. Visitors can email; this guide cannot send email or book meetings.",
});
knowledge.push({
  id: "lab",
  title: "Agent reliability lab",
  url: "https://shivam-web-app.web.app/#lab",
  content:
    "A deterministic local JavaScript simulation, not a live LLM test. Visitors select lost acknowledgement, service unavailable, or malformed response; choose stop, blind retry, or idempotent retry plus validation. A lost acknowledgement after a committed shipment causes blind retry to create two shipments. A stable operation key and response validation recovers one verified shipment. Runnable Python export reproduces each configuration. Inspired by ToolStorm and Agent Rehearsal; not the complete library.",
});
fs.writeFileSync(
  "server/knowledge.json",
  JSON.stringify(knowledge, null, 2) + "\n",
);
