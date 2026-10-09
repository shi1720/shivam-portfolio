import media from "../project-media.json";
import videos from "../videos.json";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  X,
  Code2,
  Layers,
  Play,
  LockKeyhole,
} from "lucide-react";
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
  const demo = story?.demo || (project && (media as Record<string, { demo?: string }>)[project.id]?.demo);
  const video = story?.video || (project && (videos as Record<string, string>)[project.id]);
  const actions = project && (
    <div className="project-dialog-actions">
      {demo && (
        <a
          className="button primary"
          href={demo}
          target="_blank"
          rel="noreferrer"
        >
          Try the project <ArrowUpRight size={16} />
        </a>
      )}
      {video && (
        <a
          className="button ghost"
          href={video}
          target="_blank"
          rel="noreferrer"
        >
          <Play size={16} /> Watch the demo
        </a>
      )}
      {story?.privateSource ? (
        <span className="private-source">
          <LockKeyhole size={16} /> Private source
        </span>
      ) : (
        <a
          className="button ghost"
          href={project.url}
          target="_blank"
          rel="noreferrer"
        >
          <Code2 size={16} /> {story?.sourceLabel || "Source code"}
        </a>
      )}
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
  );
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
              {actions}
              <ProjectVisual type={story?.visual || "project-cover"} name={project.name} projectId={project.id} />
              {story && (
                <>

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
                  {story.gallery && (
                    <div
                      className="case-gallery"
                      aria-label={`${project.name} product gallery`}
                    >
                      {story.gallery.map((shot) => (
                        <figure key={shot.src}>
                          <a
                            href={shot.src}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open image: ${shot.alt}`}
                          >
                            <img
                              src={shot.src}
                              alt={shot.alt}
                              width="1270"
                              height="760"
                              loading="lazy"
                            />
                          </a>
                          <figcaption>{shot.caption}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                  <div className="tags">
                    {story.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </>
              )}

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
