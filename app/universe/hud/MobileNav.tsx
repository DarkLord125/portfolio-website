"use client";
import { useEffect, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  ClockIcon,
  CpuChipIcon,
  EnvelopeIcon,
  RocketLaunchIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/util";
import { DESTINATIONS, PLANET_ORDER } from "../config/destinations";
import { useUniverse } from "../state/store";
import type { PlanetId } from "../state/types";
import { DestinationList } from "./DestinationList";
import { GalaxyMap } from "./GalaxyMap";
import { MISSION_STATUS, SHORT_LABEL } from "./labels";

const ICON: Record<PlanetId, ComponentType<SVGProps<SVGSVGElement>>> = {
  about: UserIcon,
  projects: RocketLaunchIcon,
  skills: CpuChipIcon,
  career: ClockIcon,
  contact: EnvelopeIcon,
};

/** Bottom navigation for touch screens: one large target per planet. */
export function MobileNav() {
  const phase = useUniverse((s) => s.phase);
  const location = useUniverse((s) => s.location);
  const target = useUniverse((s) => s.target);
  const travelTo = useUniverse((s) => s.travelTo);
  const flying = phase === "launching" || phase === "travelling";

  return (
    <nav
      aria-label="Destinations"
      className="pointer-events-auto absolute inset-x-0 bottom-0 border-t border-[var(--hud-line)] bg-space-950/80 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <ul className="grid grid-cols-5" style={{ height: "var(--hud-bottom)" }}>
        {PLANET_ORDER.map((id) => {
          const Icon = ICON[id];
          // A moon counts as being at its parent planet.
          const here = location === id || (location !== null && DESTINATIONS[location].parent === id);
          const heading = flying && target !== null && (target === id || DESTINATIONS[target].parent === id);
          return (
            <li key={id} className="h-full">
              <button
                type="button"
                onClick={() => travelTo(id)}
                aria-disabled={flying}
                aria-current={here ? "location" : undefined}
                aria-label={`${here ? "Current location: " : "Travel to "}${DESTINATIONS[id].name}`}
                className={cn(
                  "focus-ring relative flex h-full min-h-[44px] w-full flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                  here ? "text-ember" : heading ? "text-ice-bright" : "text-ice/60",
                  flying && !heading && !here && "opacity-50"
                )}
              >
                {(here || heading) && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-4 top-0 h-px",
                      here ? "bg-ember" : "bg-ice-bright"
                    )}
                  />
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
                {SHORT_LABEL[id]}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Galaxy map as a modal sheet, opened from the top bar on touch screens.
 * Rendered outside the HUD root so it can sit above the content panels.
 */
export function MapSheet() {
  const open = useUniverse((s) => s.mapOpen);
  const phase = useUniverse((s) => s.phase);
  const setMapOpen = useUniverse((s) => s.setMapOpen);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    // Keep Tab inside the sheet while it is open.
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !sheetRef.current) return;
      const items = sheetRef.current.querySelectorAll<HTMLElement>("button, a[href]");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [open]);

  if (!open || phase === "intro") return null;

  return (
    <div className="fixed inset-0 z-[45] md:hidden">
      <button
        type="button"
        aria-label="Close galaxy map"
        tabIndex={-1}
        onClick={() => setMapOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-space-950/70"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Galaxy map"
        className="hud-surface scrollbar-thin absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto border-x-0 border-b-0 bg-space-900/90"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between pl-4 pr-1 pt-1">
          <div>
            <p className="hud-label">Galaxy map</p>
            <p className="hud-value">{MISSION_STATUS[phase]}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setMapOpen(false)}
            aria-label="Close galaxy map"
            className="focus-ring flex h-11 w-11 items-center justify-center text-ice/80 hover:text-ice-bright"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <GalaxyMap variant="sheet" className="mx-auto max-w-[min(92vw,380px)]" />
        <DestinationList className="mt-2 border-t border-[var(--hud-line)] px-1" />
      </div>
    </div>
  );
}
