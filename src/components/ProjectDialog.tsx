import { useRef } from "react";
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
  const player = useRef<HTMLIFrameElement>(null);
  const story = project ? stories[project.id] : null;
  const demo = story?.demo || (project && (media as Record<string, { demo?: string }>)[project.id]?.demo);
  const video = story?.video || (project && (videos as Record<string, string>)[project.id]);
  const videoId = video?.match(/(?:[?&]v=|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&#?]|$)/)?.[1];
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
      {videoId && (
        <button className="button ghost" onClick={() => {
          player.current?.scrollIntoView({ block: "center" });
          player.current?.focus({ preventScroll: true });
        }}>
          <Play size={16} /> Watch the demo
        </button>
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
          <Code2 size={16} /> Source code
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
              {videoId && <section className="project-video" aria-label={`${project.name} demo video`}>
                <div className="project-video-heading"><span className="eyebrow">THE PRODUCT IN ACTION</span><a href={video!} target="_blank" rel="noreferrer">Open on YouTube <ArrowUpRight size={14} /></a></div>
                <iframe
                  key={videoId}
                  ref={player}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0`}
                  title={`${project.name} demo video`}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </section>}
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
