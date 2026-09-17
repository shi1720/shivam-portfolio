import catalog from "./catalog.json";
export type District = "all" | "agents" | "systems" | "human" | "learning";
export type Project = (typeof catalog)[number];
export const projects: Project[] = catalog;
export const categories: { id: District; label: string; short: string }[] = [
  { id: "all", label: "Everything", short: "All systems" },
  { id: "agents", label: "Agent infrastructure", short: "Agents" },
  { id: "systems", label: "Applied AI", short: "Applied AI" },
  { id: "human", label: "Human experiences", short: "Experiences" },
  { id: "learning", label: "Learning systems", short: "Learning" },
];
export const featured = [
  "AssemblyAI",
  "repogym",
  "RevenueCat-Shipaton",
  "toolstorm",
  "Nebius-x-NVIDIA",
  "plottwist",
];
export const email = "shivam1720406@gmail.com";
export const linkedin = "https://www.linkedin.com/in/shivamgupta-ai/";
export const career = [
  {
    company: "Siloed",
    role: "Founder & CEO",
    period: "2025 — now",
    summary:
      "An AI product consultancy. From a difficult business problem to a working product, with teams across finance, healthcare, SaaS, and beyond.",
    metric: "10+ clients",
    detail:
      "Product strategy, custom AI agents, full-stack delivery, and hands-on AI adoption. Based in Dubai; working globally.",
  },
  {
    company: "Khoros",
    role: "Senior AI Product Engineer · Contract",
    period: "2025 — now",
    summary:
      "Led AI and analytics engineering for IRIS AI, modernizing enterprise social software with a team of five engineers and a designer.",
    metric: "10 AI features",
    detail:
      "Earlier, led three engineers to deliver IRIS for X in one month. Work spans generation, sentiment analysis, routing, and enterprise discovery.",
  },
  {
    company: "IgniteTech",
    role: "Senior AI Product Engineer · Contract",
    period: "2025 — now",
    summary:
      "Product and engineering across Personas.ai and Eloquens.ai. Built MetricsHub to turn cross-product usage into executive briefings.",
    metric: "12+ features",
    detail:
      "Structured LLM outputs, usage analytics, prompt versioning, and graceful fallbacks. Working with technical and non-technical teams.",
  },
  {
    company: "2 Hour Learning / Trilogy",
    role: "AI Product Engineer → Senior",
    period: "2024 — 2025",
    summary:
      "Built AI learning products, adaptive content systems, and generation pipelines. Promoted to Senior in December 2024.",
    metric: "5,000+ learners",
    detail:
      "AlphaLearn and AlphaVocab; co-built PowerPath and co-developed Incept. The resume reports $1M+ annual authoring savings from Incept.",
  },
];
