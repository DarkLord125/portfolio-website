import Image from "next/image";
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-react";
import { ARCHIVE_PROJECTS, type Project } from "../content/projects";
import { MediaGallery } from "./MediaGallery";
import {
  ActionLink,
  ChipList,
  HoloCard,
  HoloSection,
  MarkerList,
  type HeadingLevel,
} from "./primitives";

/**
 * Everything about one project below its title. Shared by the in-orbit
 * detail panel and the /lite page; `level` is the heading level of its
 * sub-sections so both documents keep a sensible outline.
 */
export function ProjectBody({
  project,
  level = 3,
}: {
  project: Project;
  level?: 3 | 4;
}) {
  const cardLevel: HeadingLevel = level === 3 ? 4 : 5;
  return (
    <div className="space-y-6">
      {project.status && (
        <p className="border border-[var(--hud-line)] bg-space-900/40 px-3 py-2">
          <span className="hud-label mr-2">Status</span>
          <span className="hud-value">{project.status}</span>
        </p>
      )}

      <p className="text-sm leading-relaxed text-slate-200">{project.summary}</p>

      <HoloSection label="Highlights" level={level}>
        <MarkerList items={project.highlights} />
      </HoloSection>

      <HoloSection label="Technology" level={level}>
        <ChipList items={project.tech} />
      </HoloSection>

      <HoloSection label="Engineering challenges" level={level}>
        <ul className="space-y-2">
          {project.challenges.map((challenge) => (
            <li key={challenge.title}>
              <HoloCard title={challenge.title} level={cardLevel}>
                {challenge.detail}
              </HoloCard>
            </li>
          ))}
        </ul>
      </HoloSection>

      <HoloSection label="Media" level={level}>
        <MediaGallery media={project.media} />
      </HoloSection>

      <div className="flex flex-wrap gap-2">
        <ActionLink
          href={project.githubUrl}
          external
          variant={project.liveUrl ? "ghost" : "primary"}
        >
          <IconBrandGithub aria-hidden size={18} />
          <span>
            GitHub<span className="sr-only">: {project.title}</span>
          </span>
        </ActionLink>
        {project.liveUrl && (
          <ActionLink href={project.liveUrl} external variant="primary">
            <IconExternalLink aria-hidden size={18} />
            <span>
              Live<span className="sr-only">: {project.title}</span>
            </span>
          </ActionLink>
        )}
      </div>
    </div>
  );
}

/** Earlier work carried over from the previous portfolio. */
export function ArchiveList({ level = 4 }: { level?: 3 | 4 }) {
  const Heading = level === 3 ? "h3" : "h4";
  return (
    <ul className="space-y-3">
      {ARCHIVE_PROJECTS.map((item) => (
        <li
          key={item.title}
          className="flex gap-3 border border-[var(--hud-line)] bg-space-900/40 p-3"
        >
          <Image
            src={item.image}
            alt=""
            width={192}
            height={128}
            sizes="96px"
            className="h-16 w-24 shrink-0 border border-[var(--hud-line)] object-cover"
          />
          <div className="min-w-0 flex-1">
            <Heading className="font-display text-[15px] font-medium text-slate-50">
              {item.title}
            </Heading>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              {item.description}
            </p>
            <a
              href={item.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring -ml-1 mt-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-sm px-1 font-mono text-xs uppercase tracking-[0.12em] text-ice hover:text-ice-bright"
            >
              <IconBrandGithub aria-hidden size={16} />
              GitHub
              <span className="sr-only">: {item.title} (opens in a new tab)</span>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
