"use client";
import { useEffect, useRef } from "react";
import { DESTINATIONS } from "../config/destinations";
import { prefersReducedMotion } from "../lib/capabilities";
import { rig } from "../state/rig";
import { useUniverse } from "../state/store";
import { MISSION_STATUS } from "./labels";

/** Bottom-centre readout while the ship is flying: where to, how far, Skip. */
export function TravelStatus() {
  const phase = useUniverse((s) => s.phase);
  const target = useUniverse((s) => s.target);
  const skip = useUniverse((s) => s.skip);
  const barRef = useRef<HTMLSpanElement>(null);

  const active = phase === "launching" || phase === "travelling";

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let best = 0;
    const started = performance.now();
    const launchSeconds = prefersReducedMotion() ? 0.6 : 3.5;
    const dest = phase === "travelling" && target ? DESTINATIONS[target] : null;

    const remaining = () => {
      if (!dest) return 0;
      const dx = rig.shipPosition.x - dest.position[0];
      const dy = rig.shipPosition.y - dest.position[1];
      const dz = rig.shipPosition.z - dest.position[2];
      return Math.max(0, Math.sqrt(dx * dx + dy * dy + dz * dz) - dest.orbitDistance);
    };
    const total = Math.max(remaining(), 1e-3);

    const tick = () => {
      const p = dest
        ? 1 - remaining() / total
        : (performance.now() - started) / 1000 / launchSeconds;
      // The route curves, so distance is not strictly monotonic: never go back.
      best = Math.max(best, Math.min(1, Math.max(0, p)));
      if (barRef.current) barRef.current.style.transform = `scaleX(${best.toFixed(3)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, phase, target]);

  if (!active) return null;

  const name =
    phase === "travelling" && target ? DESTINATIONS[target].name : "SYSTEM OVERVIEW";

  return (
    <div
      className="hud-surface pointer-events-auto absolute left-1/2 flex w-[min(360px,calc(100vw-32px))] -translate-x-1/2 items-center gap-4 py-2 pl-4 pr-2"
      style={{
        bottom:
          "calc(var(--hud-bottom) + env(safe-area-inset-bottom, 0px) + 20px)",
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="hud-label truncate">{MISSION_STATUS[phase]}</p>
        <p className="hud-value truncate uppercase tracking-[0.1em]">{name}</p>
        <span
          className="mt-2 block h-px w-full bg-[var(--hud-line)]"
          role="presentation"
        >
          <span
            ref={barRef}
            className="block h-px w-full origin-left bg-ember"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
      </div>
      <button
        type="button"
        onClick={skip}
        aria-label="Skip flight"
        aria-keyshortcuts="Escape Space"
        className="focus-ring inline-flex min-h-[44px] items-center gap-2 border border-[var(--hud-line-strong)] px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ice-bright transition-colors hover:bg-ice/10"
      >
        Skip
        <kbd className="hidden font-mono text-[10px] text-ice/50 md:inline">Esc</kbd>
      </button>
    </div>
  );
}
