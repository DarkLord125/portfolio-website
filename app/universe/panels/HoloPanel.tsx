"use client";
import { useId, useState, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/util";
import { getDestination } from "../config/destinations";
import { useUniverse } from "../state/store";
import type { DestinationId } from "../state/types";
import { accentStyle } from "./primitives";

export {
  ActionLink,
  actionClass,
  Chip,
  ChipList,
  DataList,
  DataRow,
  HoloCard,
  HoloSection,
  MarkerList,
} from "./primitives";

const TICK = "pointer-events-none absolute h-2.5 w-2.5 border-ice/70";

/**
 * Shell of every in-orbit content panel: a glass instrument panel with a
 * coordinate eyebrow, title, close control and an inner scroll area.
 * Below md it is a bottom sheet whose handle collapses it to the title row.
 */
export function HoloPanel({
  id,
  title,
  subtitle,
  footer,
  children,
}: {
  id: DestinationId;
  title: string;
  subtitle?: string;
  /** Fixed controls under the scroll area (e.g. previous / next). */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const destination = getDestination(id);
  const leaveOrbit = useUniverse((s) => s.leaveOrbit);
  const [collapsed, setCollapsed] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  return (
    <section
      aria-labelledby={titleId}
      style={accentStyle(destination.palette.atmosphere)}
      className="hud-surface relative flex max-h-[68vh] flex-col rounded-t-2xl border-b-0 text-slate-200 md:h-full md:max-h-none md:rounded-sm md:border-b"
    >
      <span aria-hidden className={cn(TICK, "left-[-1px] top-[-1px] hidden border-l border-t md:block")} />
      <span aria-hidden className={cn(TICK, "right-[-1px] top-[-1px] hidden border-r border-t md:block")} />
      <span aria-hidden className={cn(TICK, "bottom-[-1px] left-[-1px] hidden border-b border-l md:block")} />
      <span aria-hidden className={cn(TICK, "bottom-[-1px] right-[-1px] hidden border-b border-r md:block")} />

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        aria-label={collapsed ? "Expand panel" : "Collapse panel to see the planet"}
        className="focus-ring flex h-11 w-full shrink-0 items-center justify-center rounded-t-2xl md:hidden"
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-ice/40" />
      </button>

      <header className="flex shrink-0 items-start gap-3 px-4 pb-3 md:px-5 md:pt-4">
        <div className="min-w-0 flex-1">
          <p className="hud-label truncate">{destination.coords}</p>
          <h2
            id={titleId}
            className="mt-1 font-display text-xl font-semibold tracking-wide text-slate-50 md:text-2xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className={cn("mt-0.5 text-sm text-slate-300", collapsed && "max-md:hidden")}>
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={leaveOrbit}
          aria-label="Return to galaxy map"
          className="focus-ring -mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-ice/25 text-ice-bright transition-colors hover:border-ice/60 hover:bg-ice/10"
        >
          <XMarkIcon aria-hidden className="h-5 w-5" />
        </button>
      </header>

      <div
        aria-hidden
        className="h-px shrink-0 bg-gradient-to-r from-[var(--accent)] via-[var(--hud-line-strong)] to-transparent opacity-70"
      />

      <div
        id={bodyId}
        className={cn(
          "scrollbar-thin min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 md:px-5 md:py-5",
          collapsed && "max-md:hidden"
        )}
      >
        {children}
      </div>

      {footer && (
        <footer
          className={cn(
            "shrink-0 border-t border-[var(--hud-line)] px-4 py-3 md:px-5",
            collapsed && "max-md:hidden"
          )}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}
