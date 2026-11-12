"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/util";
import {
  DESTINATIONS,
  HUB,
  MOON_ORDER,
  PLANET_ORDER,
  RINGS,
  STAR,
} from "../config/destinations";
import { rig } from "../state/rig";
import { useUniverse } from "../state/store";
import type { DestinationId } from "../state/types";
import { inProjectsFamily, shortLabel } from "./labels";

/**
 * Top-down chart of the system (world X → right, world Z → down), derived
 * from config/destinations. Dots are real buttons laid over an SVG; the ship
 * marker follows rig.shipPosition through requestAnimationFrame and never
 * touches React state.
 */

const OUTER = Math.max(...Object.values(RINGS));
/** Half-size of the charted square in world units: fits the outer ring and the hub. */
const EXTENT =
  Math.max(OUTER, Math.abs(HUB.shipPosition[0]), Math.abs(HUB.shipPosition[2])) + 28;
const SIZE = EXTENT * 2;
const pct = (world: number) => ((world + EXTENT) / SIZE) * 100;

/**
 * The moons sit too close to their planet to be separate targets at chart
 * scale, so their offsets (and the ship's, while it is among them) are drawn
 * magnified. The chart is schematic there.
 */
const MOON_SCALE = 2.6;
const MOON_ZONE = 48;
const PARENT = DESTINATIONS.projects.position;

function chartXZ(id: DestinationId): [number, number] {
  const d = DESTINATIONS[id];
  if (d.kind !== "moon") return [d.position[0], d.position[2]];
  return [
    PARENT[0] + (d.position[0] - PARENT[0]) * MOON_SCALE,
    PARENT[2] + (d.position[2] - PARENT[2]) * MOON_SCALE,
  ];
}

type Variant = "dock" | "sheet" | "mini";

const HIT: Record<Variant, string> = {
  dock: "h-6 w-6",
  sheet: "h-11 w-11",
  mini: "h-5 w-5",
};

export function GalaxyMap({
  variant = "dock",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const phase = useUniverse((s) => s.phase);
  const location = useUniverse((s) => s.location);
  const target = useUniverse((s) => s.target);
  const travelTo = useUniverse((s) => s.travelTo);

  const blipRef = useRef<HTMLSpanElement>(null);
  const courseRef = useRef<SVGLineElement>(null);

  const travelling = phase === "travelling" && target !== null;
  const showMoons = inProjectsFamily(location) || inProjectsFamily(target);
  const ids: DestinationId[] = showMoons
    ? [...PLANET_ORDER, ...MOON_ORDER]
    : PLANET_ORDER;

  useEffect(() => {
    let raf = 0;
    let x = Number.NaN;
    let y = Number.NaN;
    const tick = () => {
      const s = useUniverse.getState();
      let wx = rig.shipPosition.x;
      let wz = rig.shipPosition.z;
      if (inProjectsFamily(s.location) || inProjectsFamily(s.target)) {
        const dx = wx - PARENT[0];
        const dz = wz - PARENT[2];
        if (dx * dx + dz * dz < MOON_ZONE * MOON_ZONE) {
          wx = PARENT[0] + dx * MOON_SCALE;
          wz = PARENT[2] + dz * MOON_SCALE;
        }
      }
      // Light smoothing hides the step when the magnified zone is entered.
      const first = Number.isNaN(x);
      const nx = first ? wx : x + (wx - x) * 0.25;
      const ny = first ? wz : y + (wz - y) * 0.25;
      if (first || Math.abs(wx - x) > 0.02 || Math.abs(wz - y) > 0.02) {
        x = nx;
        y = ny;
        const blip = blipRef.current;
        if (blip) {
          blip.style.left = `${pct(x).toFixed(2)}%`;
          blip.style.top = `${pct(y).toFixed(2)}%`;
        }
        const course = courseRef.current;
        if (course) {
          course.setAttribute("x1", x.toFixed(1));
          course.setAttribute("y1", y.toFixed(1));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const targetXZ = travelling && target ? chartXZ(target) : null;

  return (
    <div
      className={cn("relative aspect-square w-full select-none", className)}
      role="group"
      aria-label="Galaxy map"
    >
      <svg
        viewBox={`${-EXTENT} ${-EXTENT} ${SIZE} ${SIZE}`}
        className="absolute inset-0 h-full w-full text-ice"
        aria-hidden="true"
        focusable="false"
      >
        {PLANET_ORDER.map((id) => (
          <circle
            key={id}
            cx={STAR.position[0]}
            cy={STAR.position[2]}
            r={RINGS[id]}
            fill="none"
            stroke="currentColor"
            strokeOpacity={id === location || id === target ? 0.42 : 0.16}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* star */}
        <circle
          cx={STAR.position[0]}
          cy={STAR.position[2]}
          r={STAR.radius}
          fill="currentColor"
          fillOpacity={0.85}
        />
        {targetXZ && (
          <line
            ref={courseRef}
            x1={rig.shipPosition.x}
            y1={rig.shipPosition.z}
            x2={targetXZ[0]}
            y2={targetXZ[1]}
            stroke="currentColor"
            strokeOpacity={0.7}
            strokeWidth={1}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {ids.map((id) => {
        const d = DESTINATIONS[id];
        const [wx, wz] = chartXZ(id);
        const here = id === location;
        const isTarget = travelling && id === target;
        const moon = d.kind === "moon";
        return (
          <button
            key={id}
            type="button"
            onClick={() => travelTo(id)}
            aria-label={here ? `${d.name}, you are here` : `Travel to ${d.name}`}
            aria-current={here ? "location" : undefined}
            title={d.name}
            style={{ left: `${pct(wx)}%`, top: `${pct(wz)}%` }}
            className={cn(
              "focus-ring group pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
              moon && variant !== "sheet" ? "h-4 w-4" : HIT[variant]
            )}
          >
            <span
              className={cn(
                "block rounded-full transition-transform duration-200 group-hover:scale-150",
                moon ? "h-1 w-1" : "h-1.5 w-1.5",
                variant === "sheet" && (moon ? "h-1.5 w-1.5" : "h-2 w-2"),
                here ? "bg-ember" : isTarget ? "bg-ice-bright" : "bg-ice/80"
              )}
            />
            {(here || isTarget) && (
              <span
                className={cn(
                  "absolute rounded-full border",
                  variant === "sheet" ? "h-5 w-5" : "h-3.5 w-3.5",
                  here ? "border-ember/80" : "border-dashed border-ice-bright/80"
                )}
              />
            )}
            {variant !== "mini" && !(moon && variant === "dock") && (
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap font-mono uppercase tracking-[0.12em]",
                  variant === "sheet" ? "-mt-2 text-[10px]" : "-mt-0.5 text-[8px]",
                  here ? "text-ember" : isTarget ? "text-ice-bright" : "text-ice/60"
                )}
              >
                {shortLabel(id)}
              </span>
            )}
          </button>
        );
      })}

      {/* ship */}
      <span
        ref={blipRef}
        aria-hidden="true"
        style={{
          left: `${pct(HUB.shipPosition[0])}%`,
          top: `${pct(HUB.shipPosition[2])}%`,
        }}
        className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-space-950 bg-ember"
      />
    </div>
  );
}
