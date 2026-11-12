"use client";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  MapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/util";
import { DESTINATIONS, HUB } from "../config/destinations";
import { PROFILE } from "../content/profile";
import { storeQuality } from "../lib/capabilities";
import { useUniverse } from "../state/store";
import { MISSION_STATUS } from "./labels";

const barButton =
  "focus-ring pointer-events-auto inline-flex h-10 min-w-[40px] items-center justify-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ice/80 transition-colors hover:text-ice-bright";

export function TopBar() {
  const phase = useUniverse((s) => s.phase);
  const location = useUniverse((s) => s.location);
  const target = useUniverse((s) => s.target);
  const quality = useUniverse((s) => s.quality);
  const setQuality = useUniverse((s) => s.setQuality);
  const mapOpen = useUniverse((s) => s.mapOpen);
  const setMapOpen = useUniverse((s) => s.setMapOpen);

  let headline: string;
  let detail: string;
  if (phase === "travelling" && target) {
    headline = `EN ROUTE → ${DESTINATIONS[target].name}`;
    detail = DESTINATIONS[target].coords;
  } else if (phase === "orbit" && location) {
    headline = DESTINATIONS[location].name;
    detail = DESTINATIONS[location].coords;
  } else if (phase === "launching") {
    headline = "LAUNCHING";
    detail = HUB.coords;
  } else {
    headline = "SYSTEM OVERVIEW";
    detail = location ? `Parked at ${DESTINATIONS[location].name}` : HUB.coords;
  }

  const reduced = quality === "low";
  const effectsLabel = `Effects: ${reduced ? "Reduced" : "Full"}`;
  const toggleEffects = () => {
    const next = reduced ? "high" : "low";
    setQuality(next);
    storeQuality(next);
  };

  return (
    <header
      className="absolute inset-x-0 top-0 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--hud-line)] bg-space-950/55 backdrop-blur-md md:grid-cols-[1fr_auto_1fr]"
      style={{
        height: "var(--hud-top)",
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(8px, env(safe-area-inset-right))",
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ice-bright">
        {PROFILE.shortName}
        <span className="hidden text-ice/50 sm:inline"> · Universe</span>
      </p>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="min-w-0 md:text-center"
      >
        <p className="hud-label hidden truncate md:block">{MISSION_STATUS[phase]}</p>
        <p className="hud-value truncate uppercase tracking-[0.1em]">
          {headline}
          <span className="sr-only md:hidden">. {MISSION_STATUS[phase]}</span>
          <span className="hidden normal-case tracking-normal text-ice/50 lg:inline">
            {"  "}
            {detail}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-end md:gap-1">
        <button
          type="button"
          onClick={toggleEffects}
          aria-pressed={reduced}
          aria-label={effectsLabel}
          title="Toggle reduced effects"
          className={barButton}
        >
          <SparklesIcon
            className={cn("h-4 w-4", reduced && "opacity-50")}
            aria-hidden="true"
          />
          <span className="hidden md:inline">{effectsLabel}</span>
        </button>
        <Link href="/lite" aria-label="Text version" className={barButton}>
          <DocumentTextIcon className="h-4 w-4 md:hidden" aria-hidden="true" />
          <span className="hidden md:inline">Text version</span>
        </Link>
        <button
          type="button"
          onClick={() => setMapOpen(!mapOpen)}
          aria-label="Galaxy map"
          aria-haspopup="dialog"
          aria-expanded={mapOpen}
          className={cn(barButton, "md:hidden")}
        >
          <MapIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

/**
 * Ways out of an orbit. Sits under the top bar on the left: clear of the
 * docked panel (right) on desktop and of the bottom sheet on mobile.
 */
export function OrbitActions() {
  const phase = useUniverse((s) => s.phase);
  const location = useUniverse((s) => s.location);
  const leaveOrbit = useUniverse((s) => s.leaveOrbit);
  const travelTo = useUniverse((s) => s.travelTo);

  if (phase !== "orbit" || !location) return null;
  const moon = DESTINATIONS[location].kind === "moon";
  const action =
    "hud-surface focus-ring pointer-events-auto inline-flex min-h-[40px] items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ice-bright transition-colors hover:border-[var(--hud-line-strong)]";

  return (
    <div
      className="absolute flex flex-col items-start gap-2"
      style={{
        top: "calc(var(--hud-top) + 12px)",
        left: "max(16px, env(safe-area-inset-left))",
      }}
    >
      <button type="button" onClick={leaveOrbit} className={action}>
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Return to galaxy map
      </button>
      {moon && (
        <button type="button" onClick={() => travelTo("projects")} className={action}>
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Project Galaxy
        </button>
      )}
    </div>
  );
}
