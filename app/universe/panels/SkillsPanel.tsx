"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/util";
import { getDestination } from "../config/destinations";
import {
  FAMILIARITY_LABEL,
  SKILL_CATEGORIES,
  SKILLS,
  type Skill,
  type SkillCategory,
  type SkillCategoryId,
} from "../content/skills";
import { ChipList, DataList, DataRow, HoloPanel } from "./HoloPanel";

const skillsOf = (id: SkillCategoryId) => SKILLS.filter((s) => s.category === id);

// Skill x / y (0..1) → percentage inside the chart, leaving room for labels.
const px = (x: number) => 10 + x * 80;
const py = (y: number) => 9 + y * 68;

const labelShift = (x: number) =>
  x < 0.18 ? "-translate-x-1/4" : x > 0.82 ? "-translate-x-3/4" : "-translate-x-1/2";

function Constellation({
  category,
  selectedId,
  onSelect,
}: {
  category: SkillCategory;
  selectedId: string;
  onSelect: (skill: Skill) => void;
}) {
  const skills = skillsOf(category.id);
  const byId = new Map(skills.map((s) => [s.id, s]));
  const stars = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (delta === 0) return;
    e.preventDefault();
    stars.current[(index + delta + skills.length) % skills.length]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={`${category.name} constellation`}
      className="relative aspect-[4/3] w-full border border-[var(--hud-line)] bg-space-950/40"
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {category.links.map(([from, to]) => {
          const a = byId.get(from);
          const b = byId.get(to);
          if (!a || !b) return null;
          const lit = selectedId === from || selectedId === to;
          return (
            <line
              key={`${from}-${to}`}
              x1={px(a.x)}
              y1={py(a.y)}
              x2={px(b.x)}
              y2={py(b.y)}
              stroke={category.color}
              strokeOpacity={lit ? 0.85 : 0.35}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {skills.map((skill, i) => {
        const selected = skill.id === selectedId;
        return (
          <button
            key={skill.id}
            ref={(el) => {
              stars.current[i] = el;
            }}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(skill)}
            onMouseEnter={() => onSelect(skill)}
            onFocus={() => onSelect(skill)}
            onKeyDown={(e) => onKeyDown(e, i)}
            style={{ left: `${px(skill.x)}%`, top: `${py(skill.y)}%` }}
            className="focus-ring group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          >
            <span
              aria-hidden
              className={cn(
                "absolute h-5 w-5 rounded-full border transition-opacity",
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
              )}
              style={{ borderColor: category.color }}
            />
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span
              className={cn(
                "pointer-events-none absolute left-1/2 top-[31px] whitespace-nowrap font-mono text-[10.5px] leading-none",
                labelShift(skill.x),
                selected ? "text-white" : "text-slate-300"
              )}
            >
              {skill.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SkillsPanel() {
  const destination = getDestination("skills");
  const [selectedId, setSelectedId] = useState(SKILLS[0].id);
  const [activeCategory, setActiveCategory] = useState<SkillCategoryId>(SKILLS[0].category);

  const selected = SKILLS.find((s) => s.id === selectedId) ?? SKILLS[0];
  const selectedCategory =
    SKILL_CATEGORIES.find((c) => c.id === selected.category) ?? SKILL_CATEGORIES[0];

  const select = (skill: Skill) => {
    setSelectedId(skill.id);
    setActiveCategory(skill.category);
  };

  const showCategory = (id: SkillCategoryId) => {
    setActiveCategory(id);
    const first = skillsOf(id)[0];
    if (first && selected.category !== id) setSelectedId(first.id);
  };

  return (
    <HoloPanel id="skills" title={destination.name} subtitle={destination.tagline}>
      <p className="text-sm leading-relaxed text-slate-300">
        Each star is a technology. Select one to see where it has been used.
      </p>

      {/* Below lg: one constellation at a time, chosen here. */}
      <div role="group" aria-label="Constellation" className="grid grid-cols-2 gap-1.5 lg:hidden">
        {SKILL_CATEGORIES.map((category) => {
          const active = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => showCategory(category.id)}
              className={cn(
                "focus-ring flex min-h-[44px] items-center gap-2 rounded-sm border px-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
                active
                  ? "border-ice/60 bg-ice/10 text-white"
                  : "border-ice/20 text-slate-300 hover:border-ice/40"
              )}
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {SKILL_CATEGORIES.map((category) => (
          <section
            key={category.id}
            aria-labelledby={`constellation-${category.id}`}
            className={cn(category.id !== activeCategory && "hidden lg:block")}
          >
            <h3
              id={`constellation-${category.id}`}
              className="hud-label mb-1.5 flex items-center gap-2"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </h3>
            <Constellation category={category} selectedId={selectedId} onSelect={select} />
          </section>
        ))}
      </div>

      <section
        aria-label="Selected skill"
        aria-live="polite"
        className="border border-[var(--hud-line-strong)] bg-space-900 p-3 lg:sticky lg:bottom-0"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-slate-50">{selected.name}</h3>
          <span className="hud-label flex shrink-0 items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
            {selectedCategory.name}
          </span>
        </div>
        <DataList className="mt-2">
          <DataRow label="Familiarity" value={FAMILIARITY_LABEL[selected.familiarity]} />
        </DataList>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">{selected.note}</p>
        {selected.usedIn.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="hud-label">Used in</span>
            <ChipList items={selected.usedIn} label="Used in" />
          </div>
        )}
      </section>

      <details className="group/list border border-[var(--hud-line)]">
        <summary className="focus-ring flex min-h-[44px] cursor-pointer list-none items-center px-3 [&::-webkit-details-marker]:hidden">
          <span className="hud-label">All skills as a list</span>
        </summary>
        <div className="space-y-4 border-t border-[var(--hud-line)] p-3">
          {SKILL_CATEGORIES.map((category) => (
            <div key={category.id}>
              <h3 className="hud-label mb-1.5">{category.name}</h3>
              <ul className="space-y-1">
                {skillsOf(category.id).map((skill) => (
                  <li key={skill.id} className="text-sm text-slate-300">
                    <span className="text-slate-50">{skill.name}</span>
                    {" — "}
                    {FAMILIARITY_LABEL[skill.familiarity]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </HoloPanel>
  );
}
