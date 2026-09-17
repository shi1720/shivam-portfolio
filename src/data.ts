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
      "Led AI and analytics engineering for IRIS AI, transforming an enterprise social care and marketing suite that had taken years to build into a new product in three months, with a team of five engineers and a designer.",
    metric: "10 AI features",
    detail:
      "Earlier, worked as lead engineer to deliver IRIS for X in one month. Work spans generation, sentiment analysis, routing, and enterprise discovery.",
  },
  {
    company: "IgniteTech",
    role: "Senior AI Product Engineer · Contract",
    period: "2025 — now",
    summary:
      "Product and engineering across multiple products. Built MetricsHub to turn cross-product usage into executive briefings.",
    metric: "12+ features",
    detail:
      "Structured LLM outputs, usage analytics, prompt versioning, and graceful fallbacks. Full-stack development, AI engineering, and product management across technical and non-technical teams. Wore many hats, including forward-deployed engineer and technical product manager: meeting customers to understand requirements and helping them deploy the product.",
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
