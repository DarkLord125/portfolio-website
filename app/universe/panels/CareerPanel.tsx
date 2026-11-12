"use client";
import Image from "next/image";
import { Fragment, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/util";
import { getDestination } from "../config/destinations";
import { VISIBLE_MILESTONES } from "../content/career";
import {
  actionClass,
  ChipList,
  HoloPanel,
  HoloSection,
  MarkerList,
} from "./HoloPanel";

export function CareerPanel() {
  const destination = getDestination("career");
  const milestones = VISIBLE_MILESTONES;
  const last = milestones.length - 1;
  const [index, setIndex] = useState(last);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);

  if (milestones.length === 0) {
    return (
      <HoloPanel id="career" title={destination.name} subtitle={destination.tagline}>
        <p className="hud-label">No milestones to show</p>
      </HoloPanel>
    );
  }

  const current = milestones[Math.min(index, last)];
  const go = (to: number) => setIndex(Math.max(0, Math.min(last, to)));

  const onTrackKey = (e: KeyboardEvent<HTMLOListElement>) => {
    let to: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") to = index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = index - 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = last;
    if (to === null) return;
    e.preventDefault();
    const clamped = Math.max(0, Math.min(last, to));
    setIndex(clamped);
    nodes.current[clamped]?.focus();
  };

  return (
    <HoloPanel
      id="career"
      title={destination.name}
      subtitle={destination.tagline}
      footer={
        <nav aria-label="Journey steps" className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className={actionClass("ghost", "flex-1 px-3")}
          >
            <ChevronLeftIcon aria-hidden className="h-4 w-4" />
            Earlier
          </button>
          <span className="hud-value shrink-0 px-2" aria-hidden>
            {index + 1} / {milestones.length}
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === last}
            className={actionClass("ghost", "flex-1 px-3")}
          >
            Later
            <ChevronRightIcon aria-hidden className="h-4 w-4" />
          </button>
        </nav>
      }
    >
      <div className="flex gap-4 md:flex-col md:gap-5">
        {/* Star path: vertical below md, horizontal from md up. */}
        <ol
          aria-label="Career milestones, oldest first"
          onKeyDown={onTrackKey}
          className="flex shrink-0 flex-col md:flex-row md:items-start"
        >
          {milestones.map((milestone, i) => {
            const selected = i === index;
            const reached = i <= index;
            return (
              <Fragment key={milestone.id}>
                {i > 0 && (
                  <li
                    aria-hidden
                    className={cn(
                      "ml-[21.5px] h-4 w-px md:ml-0 md:mt-[21.5px] md:h-px md:w-auto md:flex-1",
                      reached ? "bg-ember" : "bg-ice/25"
                    )}
                  />
                )}
                <li className="flex">
                  <button
                    ref={(el) => {
                      nodes.current[i] = el;
                    }}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={selected ? "step" : undefined}
                    aria-label={`${milestone.marker}: ${milestone.role}, ${milestone.organization}`}
                    className="focus-ring group flex items-center gap-1.5 rounded-sm md:flex-col md:gap-0"
                  >
                    <span className="relative flex h-11 w-11 items-center justify-center">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute h-6 w-6 rounded-full border transition-opacity",
                          selected
                            ? "border-ember opacity-100"
                            : "border-ice/60 opacity-0 group-hover:opacity-100"
                        )}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "h-2.5 w-2.5 rotate-45",
                          reached ? "bg-ember" : "bg-ice/60"
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "font-mono text-xs tabular-nums md:-mt-1.5",
                        selected ? "text-ember" : "text-slate-300"
                      )}
                    >
                      {milestone.marker}
                    </span>
                  </button>
                </li>
              </Fragment>
            );
          })}
        </ol>

        <article aria-live="polite" className="min-w-0 flex-1 space-y-5">
          <header className="flex items-start gap-3">
            {current.logo && (
              <span className="shrink-0 rounded-sm border border-[var(--hud-line)] bg-white p-1">
                <Image
                  src={current.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </span>
            )}
            <div className="min-w-0">
              <p className="hud-label">
                {current.kind} · {current.period}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-slate-50">
                {current.role}
              </h3>
              <p className="text-sm text-slate-200">{current.organization}</p>
            </div>
          </header>

          {current.summary && (
            <p className="text-sm leading-relaxed text-slate-200">{current.summary}</p>
          )}

          {current.contributions.length > 0 && (
            <HoloSection label="Contributions" level={4}>
              <MarkerList items={current.contributions} />
            </HoloSection>
          )}

          {current.tech.length > 0 && (
            <HoloSection label="Technology" level={4}>
              <ChipList items={current.tech} />
            </HoloSection>
          )}
        </article>
      </div>
    </HoloPanel>
  );
}
