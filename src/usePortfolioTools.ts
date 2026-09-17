import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { projects, type Project } from "./data";

type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type ToolDocument = Document & {
  modelContext?: {
    registerTool: (
      tool: Tool,
      options: { signal: AbortSignal },
    ) => void | Promise<void>;
  };
};
function field(input: unknown, key: string) {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input).some((k) => k !== key)
  )
    throw new Error(`Expected an object containing only ${key}.`);
  const value = (input as Record<string, unknown>)[key];
  if (typeof value !== "string" || value.length > 160)
    throw new Error(`${key} must be a string of at most 160 characters.`);
  return value;
}
export function usePortfolioTools(openProject: (project: Project) => void) {
  const action = useRef(openProject);
  action.current = openProject;
  useEffect(() => {
    const context = (document as ToolDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const definitions: Tool[] = [
      {
        name: "search_public_projects",
        title: "Search Shivam’s public projects",
        description:
          "Read public project names, descriptions and identifiers from the portfolio. Does not navigate or contact any service.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string", maxLength: 160 } },
          required: ["query"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute(input) {
          const q = field(input, "query").toLowerCase();
          return {
            projects: projects
              .filter((p) =>
                `${p.name} ${p.description} ${p.language}`
                  .toLowerCase()
                  .includes(q),
              )
              .map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
              })),
          };
        },
      },
      {
        name: "open_project_case_study",
        title: "Open a project case study",
        description:
          "Navigate the visible portfolio to a public project’s case-study dialog. Use an exact identifier returned by search_public_projects. Does not contact external services.",
        inputSchema: {
          type: "object",
          properties: { projectId: { type: "string", maxLength: 160 } },
          required: ["projectId"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const id = field(input, "projectId");
          const project = projects.find((p) => p.id === id);
          if (!project) throw new Error("Unknown public project identifier.");
          flushSync(() => action.current(project));
          return {
            projectId: project.id,
            name: project.name,
            status: "case_study_open",
          };
        },
      },
    ];
    for (const tool of definitions) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() =>
          console.warn("Portfolio browser tool registration unavailable."),
        );
      } catch {
        console.warn("Portfolio browser tool registration unavailable.");
      }
    }
    return () => lifecycle.abort();
  }, []);
}
