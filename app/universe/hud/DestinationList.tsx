"use client";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/util";
import { DESTINATIONS, MOON_ORDER, PLANET_ORDER } from "../config/destinations";
import { useUniverse } from "../state/store";
import type { DestinationId } from "../state/types";

/**
 * Keyboard-reachable list of every destination. Each row travels there; the
 * icon button beside it jumps there without the flight.
 */
export function DestinationList({
  className,
  showMoons = true,
}: {
  className?: string;
  showMoons?: boolean;
}) {
  const location = useUniverse((s) => s.location);

  return (
    <nav aria-label="Destinations" className={className}>
      <ul className="flex flex-col">
        {PLANET_ORDER.map((id, i) => (
          <li key={id} className="border-b border-[var(--hud-line)] last:border-b-0">
            <Row id={id} index={i + 1} here={location === id} />
            {showMoons && id === "projects" && (
              <ul className="mb-2 ml-9 flex flex-col border-l border-[var(--hud-line)]">
                {MOON_ORDER.map((moon) => (
                  <li key={moon}>
                    <Row id={moon} here={location === moon} compact />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Row({
  id,
  index,
  here,
  compact = false,
}: {
  id: DestinationId;
  index?: number;
  here: boolean;
  compact?: boolean;
}) {
  const travelTo = useUniverse((s) => s.travelTo);
  const jumpTo = useUniverse((s) => s.jumpTo);
  const d = DESTINATIONS[id];

  return (
    <div className="flex items-stretch">
      <button
        type="button"
        onClick={() => travelTo(id)}
        aria-current={here ? "location" : undefined}
        className={cn(
          "focus-ring group pointer-events-auto flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:bg-ice/5",
          compact ? "min-h-[36px] px-3 py-1.5" : "min-h-[52px] px-3 py-2.5"
        )}
      >
        {index !== undefined && (
          <span
            aria-hidden="true"
            className={cn(
              "w-3 shrink-0 font-mono text-[11px] tabular-nums",
              here ? "text-ember" : "text-ice/50"
            )}
          >
            {index}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate font-mono uppercase tracking-[0.12em]",
              compact ? "text-[11px]" : "text-[13px]",
              here ? "text-ember" : "text-ice-bright"
            )}
          >
            {d.name}
          </span>
          <span
            className={cn(
              "block truncate font-body text-ice/60",
              compact ? "text-[11px]" : "text-xs"
            )}
          >
            {here ? "You are here" : d.tagline}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => jumpTo(id)}
        aria-label={`Jump to ${d.name} without flight`}
        title={`Jump to ${d.name} without flight`}
        className="focus-ring pointer-events-auto flex w-11 shrink-0 items-center justify-center text-ice/50 transition-colors hover:bg-ice/5 hover:text-ice-bright"
      >
        <ChevronDoubleRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
