import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { DESTINATIONS } from "../config/destinations";
import { VISIBLE_MILESTONES } from "../content/career";
import { ABOUT, CONTACT, PROFILE } from "../content/profile";
import { PROJECTS } from "../content/projects";
import { FAMILIARITY_LABEL, SKILL_CATEGORIES, SKILLS } from "../content/skills";
import { ContactForm } from "../panels/ContactForm";
import { ContactLinks } from "../panels/ContactLinks";
import { ArchiveList, ProjectBody } from "../panels/ProjectBody";
import {
  accentStyle,
  actionClass,
  ChipList,
  DataList,
  DataRow,
  HoloCard,
  HoloSection,
  MarkerList,
} from "../panels/primitives";

const NAV = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "career", label: "Career" },
  { id: "contact", label: "Contact" },
] as const;

type SectionId = (typeof NAV)[number]["id"];

const CARD = "border border-[var(--hud-line)] bg-space-900/60 p-4 md:p-6";

// A quiet, static stand-in for the star field: two soft nebula washes.
const BACKDROP = {
  backgroundImage: [
    "radial-gradient(ellipse 70% 45% at 85% -5%, rgba(109, 127, 214, 0.16), transparent 70%)",
    "radial-gradient(ellipse 60% 40% at 0% 30%, rgba(159, 208, 255, 0.07), transparent 70%)",
    "radial-gradient(ellipse 55% 35% at 100% 85%, rgba(255, 195, 122, 0.05), transparent 70%)",
  ].join(", "),
};

function PageSection({
  id,
  title,
  children,
}: {
  id: SectionId;
  title: string;
  children: ReactNode;
}) {
  const destination = DESTINATIONS[id];
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      style={accentStyle(destination.palette.atmosphere)}
      className="scroll-mt-28 border-t border-[var(--hud-line)] py-10 md:py-14"
    >
      <p className="hud-label">{destination.coords}</p>
      <h2
        id={`${id}-title`}
        className="mb-6 mt-1 font-display text-2xl font-semibold text-slate-50 md:text-3xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The whole portfolio as one plain, scrollable page. No WebGL and no three.js.
 * Used at /lite and whenever the 3D experience cannot run.
 */
export function FallbackPortfolio({ reason }: { reason: "no-webgl" | "chosen" }) {
  return (
    <div className="min-h-screen bg-space-950 font-body text-slate-200" style={BACKDROP}>
      <a
        href="#content"
        className="focus-ring sr-only rounded-sm bg-space-800 px-4 py-3 text-sm text-slate-50 focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-[var(--hud-line)] bg-space-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 px-4 md:px-6">
          <p className="py-2 font-display text-base font-semibold text-slate-50">{PROFILE.name}</p>
          <nav aria-label="Sections">
            <ul className="-mx-2 flex flex-wrap">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="focus-ring flex min-h-[44px] items-center rounded-sm px-2 font-mono text-xs uppercase tracking-[0.1em] text-ice hover:text-ice-bright sm:px-3"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="content" className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="py-10 md:py-16">
          {reason === "no-webgl" ? (
            <p role="status" className="hud-label mb-6 border border-[var(--hud-line)] px-3 py-2.5">
              The 3D experience needs WebGL, which is not available here. This is the text version.
            </p>
          ) : (
            <p className="mb-6">
              <Link href="/" className={actionClass("ghost")}>
                Launch the 3D experience
              </Link>
            </p>
          )}
          <h1 className="text-balance font-display text-4xl font-semibold text-slate-50 md:text-5xl">
            {PROFILE.name}
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.14em] text-ember">
            {PROFILE.title}
          </p>
        </div>

        <PageSection id="about" title="About">
          <div className="grid gap-6 md:grid-cols-[auto,1fr]">
            <Image
              src={PROFILE.photo}
              alt={`Portrait of ${PROFILE.name}`}
              width={144}
              height={144}
              priority
              className="h-36 w-36 border border-ice/30 object-cover object-top p-1"
            />
            <div className="space-y-4">
              <p className="max-w-prose leading-relaxed">{ABOUT.intro}</p>
              <DataList>
                {ABOUT.facts.map((fact) => (
                  <DataRow key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </DataList>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <HoloSection label="Interests">
              <ul className="space-y-2">
                {ABOUT.interests.map((interest) => (
                  <li key={interest.title}>
                    <HoloCard title={interest.title}>{interest.detail}</HoloCard>
                  </li>
                ))}
              </ul>
            </HoloSection>
            <HoloSection label="Engineering philosophy">
              <ol className="space-y-2">
                {ABOUT.philosophy.map((item, i) => (
                  <li key={item.title}>
                    <HoloCard title={item.title} index={i + 1}>
                      {item.detail}
                    </HoloCard>
                  </li>
                ))}
              </ol>
            </HoloSection>
            <HoloSection label="Certifications">
              <ChipList items={ABOUT.certifications} />
            </HoloSection>
            <HoloSection label="Hobbies">
              <ChipList items={ABOUT.hobbies} />
            </HoloSection>
          </div>
        </PageSection>

        <PageSection id="projects" title="Projects">
          <div className="space-y-6">
            {PROJECTS.map((project) => {
              const moon = DESTINATIONS[project.id];
              return (
                <article
                  key={project.id}
                  id={project.id}
                  aria-labelledby={`${project.id}-title`}
                  style={accentStyle(moon.palette.atmosphere)}
                  className={`${CARD} scroll-mt-28`}
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-9 w-9 shrink-0 rounded-full border border-white/10"
                      style={{
                        background: `radial-gradient(circle at 32% 30%, ${moon.palette.atmosphere}, ${moon.palette.primary} 45%, ${moon.palette.secondary} 100%)`,
                      }}
                    />
                    <div className="min-w-0">
                      <h3
                        id={`${project.id}-title`}
                        className="font-display text-xl font-semibold tracking-wide text-slate-50"
                      >
                        {project.title}
                      </h3>
                      <p className="text-sm text-slate-300">{project.subtitle}</p>
                    </div>
                  </div>
                  <ProjectBody project={project} level={4} />
                </article>
              );
            })}
          </div>

          <div className="mt-10">
            <HoloSection label="Earlier work" level={3}>
              <ArchiveList level={4} />
            </HoloSection>
          </div>
        </PageSection>

        <PageSection id="skills" title="Skills">
          <div className="grid gap-4 md:grid-cols-2">
            {SKILL_CATEGORIES.map((category) => (
              <section key={category.id} aria-labelledby={`skills-${category.id}`} className={CARD}>
                <h3
                  id={`skills-${category.id}`}
                  className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-slate-50"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </h3>
                <ul className="divide-y divide-[var(--hud-line)]">
                  {SKILLS.filter((skill) => skill.category === category.id).map((skill) => (
                    <li key={skill.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h4 className="font-medium text-slate-50">{skill.name}</h4>
                        <p className="hud-label normal-case tracking-normal">
                          {FAMILIARITY_LABEL[skill.familiarity]}
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{skill.note}</p>
                      {skill.usedIn.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <span className="hud-label">Used in</span>
                          <ChipList items={skill.usedIn} label={`${skill.name} used in`} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </PageSection>

        <PageSection id="career" title="Career">
          <ol className="relative space-y-8 border-l border-[var(--hud-line-strong)] pl-6">
            {VISIBLE_MILESTONES.map((milestone) => (
              <li key={milestone.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rotate-45 bg-ember"
                />
                <div className="flex items-start gap-3">
                  {milestone.logo && (
                    <span className="shrink-0 rounded-sm border border-[var(--hud-line)] bg-white p-1">
                      <Image
                        src={milestone.logo}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                      />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="hud-label">
                      {milestone.kind} · {milestone.period}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-slate-50">
                      {milestone.role}
                    </h3>
                    <p className="text-sm text-slate-200">{milestone.organization}</p>
                  </div>
                </div>
                {milestone.summary && (
                  <p className="mt-3 max-w-prose text-sm leading-relaxed">{milestone.summary}</p>
                )}
                <MarkerList items={milestone.contributions} className="mt-3 max-w-prose" />
                <ChipList
                  items={milestone.tech}
                  label={`Technology used: ${milestone.role}`}
                  className="mt-3"
                />
              </li>
            ))}
          </ol>
        </PageSection>

        <PageSection id="contact" title="Contact">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <blockquote className="text-balance font-display text-2xl font-medium leading-snug text-slate-50">
                {CONTACT.quote}
              </blockquote>
              <p className="leading-relaxed">{CONTACT.blurb}</p>
              <ContactLinks />
            </div>
            <div className={CARD}>
              <h3 className="hud-label mb-4">Send a message</h3>
              <ContactForm />
            </div>
          </div>
        </PageSection>
      </main>

      <footer className="border-t border-[var(--hud-line)] py-6">
        <p className="hud-label mx-auto max-w-4xl px-4 md:px-6">
          {PROFILE.name} · {PROFILE.title}
        </p>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}
