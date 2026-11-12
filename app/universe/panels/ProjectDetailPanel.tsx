"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getProject, PROJECTS } from "../content/projects";
import { useUniverse } from "../state/store";
import type { MoonId } from "../state/types";
import { actionClass, HoloPanel } from "./HoloPanel";
import { ProjectBody } from "./ProjectBody";

export function ProjectDetailPanel({ id }: { id: MoonId }) {
  const travelTo = useUniverse((s) => s.travelTo);
  const project = getProject(id);
  const index = PROJECTS.findIndex((p) => p.id === id);
  const previous = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <HoloPanel
      id={id}
      title={project.title}
      subtitle={project.subtitle}
      footer={
        <nav aria-label="Project navigation" className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => travelTo("projects")}
            className={actionClass("ghost", "min-w-0 flex-1 px-3")}
          >
            <span className="truncate">Back to Project Galaxy</span>
          </button>
          <button
            type="button"
            onClick={() => travelTo(previous.id)}
            aria-label={`Previous project: ${previous.title}`}
            title={`Previous: ${previous.title}`}
            className={actionClass("ghost", "w-11 shrink-0 px-0")}
          >
            <ChevronLeftIcon aria-hidden className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => travelTo(next.id)}
            aria-label={`Next project: ${next.title}`}
            title={`Next: ${next.title}`}
            className={actionClass("ghost", "w-11 shrink-0 px-0")}
          >
            <ChevronRightIcon aria-hidden className="h-5 w-5" />
          </button>
        </nav>
      }
    >
      <ProjectBody project={project} level={3} />
    </HoloPanel>
  );
}
