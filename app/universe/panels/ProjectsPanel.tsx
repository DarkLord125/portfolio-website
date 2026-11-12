"use client";
import { ChevronDownIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { getDestination } from "../config/destinations";
import { PROJECTS } from "../content/projects";
import { useUniverse } from "../state/store";
import { HoloPanel, HoloSection } from "./HoloPanel";
import { ArchiveList } from "./ProjectBody";

export function ProjectsPanel() {
  const destination = getDestination("projects");
  const travelTo = useUniverse((s) => s.travelTo);

  return (
    <HoloPanel id="projects" title={destination.name} subtitle={destination.tagline}>
      <HoloSection label="Moons in orbit">
        <ul className="space-y-2">
          {PROJECTS.map((project) => {
            const moon = getDestination(project.id);
            return (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => travelTo(project.id)}
                  className="focus-ring group flex w-full items-start gap-3 border border-[var(--hud-line)] bg-space-900/40 p-3 text-left transition-colors hover:border-ice/50 hover:bg-ice/5"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-white/10"
                    style={{
                      background: `radial-gradient(circle at 32% 30%, ${moon.palette.atmosphere}, ${moon.palette.primary} 45%, ${moon.palette.secondary} 100%)`,
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="hud-label block truncate">{moon.coords}</span>
                    <span className="mt-0.5 block font-display text-lg font-semibold tracking-wide text-slate-50">
                      {project.title}
                    </span>
                    <span className="block text-sm text-slate-200">{project.subtitle}</span>
                    <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-slate-300">
                      {project.summary}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ember">
                      Fly to moon
                      <ArrowRightIcon
                        aria-hidden
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </HoloSection>

      <details className="group/archive border border-[var(--hud-line)]">
        <summary className="focus-ring flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 px-3 [&::-webkit-details-marker]:hidden">
          <h3 className="hud-label">Earlier work</h3>
          <ChevronDownIcon
            aria-hidden
            className="h-4 w-4 text-ice transition-transform group-open/archive:rotate-180"
          />
        </summary>
        <div className="border-t border-[var(--hud-line)] p-3">
          <ArchiveList level={4} />
        </div>
      </details>
    </HoloPanel>
  );
}
