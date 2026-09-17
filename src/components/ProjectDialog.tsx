import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X, Code2, Layers } from "lucide-react";
import type { Project } from "../data";
import { stories } from "../stories";
import ProjectVisual from "./ProjectVisual";
export default function ProjectDialog({
  project,
  onClose,
  onAsk,
}: {
  project: Project | null;
  onClose: () => void;
  onAsk: (question: string) => void;
}) {
  const story = project ? stories[project.id] : null;
  return (
    <Dialog.Root
      open={!!project}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="project-dialog"
          aria-describedby="project-description"
        >
          <Dialog.Close className="close-dialog" aria-label="Close project">
            <X size={21} />
          </Dialog.Close>
          {project && (
            <>
              <div className="project-dialog-head">
                <p className="eyebrow">
                  {story?.kicker || `${project.language} / PUBLIC PROJECT`}
                </p>
                <Dialog.Title>{project.name}</Dialog.Title>
                <Dialog.Description id="project-description">
                  {story?.summary || project.description}
                </Dialog.Description>
              </div>
              {story && (
                <>
                  <ProjectVisual
                    type={story.visual}
                    name={project.name}
                    projectId={project.id}
                  />
                  <div className="case-sections">
                    <section>
                      <h3>The problem</h3>
                      <p>{story.problem}</p>
                    </section>
                    <section>
                      <h3>What I built</h3>
                      <p>{story.built}</p>
                    </section>
                    <section>
                      <h3>Evidence</h3>
                      <p>{story.evidence}</p>
                    </section>
                    <section className="case-boundary">
                      <h3>Current scope</h3>
                      <p>{story.boundary}</p>
                    </section>
                  </div>
                  <div className="tags">
                    {story.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </>
              )}
              <div className="project-dialog-actions">
                {story?.demo && (
                  <a
                    className="button primary"
                    href={story.demo}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Try the project <ArrowUpRight size={16} />
                  </a>
                )}
                <a
                  className="button ghost"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 size={16} /> Source code
                </a>
                {story?.architecture && (
                  <a
                    className="button ghost"
                    href={story.architecture}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Layers size={16} /> Architecture
                  </a>
                )}
              </div>
              <button
                className="ask-project"
                onClick={() => {
                  onClose();
                  onAsk(
                    `Explain the engineering behind ${project.name}. What are its limits?`,
                  );
                }}
              >
                Ask the AI guide about {project.name} <ArrowUpRight size={16} />
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
