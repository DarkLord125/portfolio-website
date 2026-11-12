"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/util";
import { useUniverse } from "../state/store";
import { DestinationList } from "./DestinationList";
import { GalaxyMap } from "./GalaxyMap";
import { IntroOverlay } from "./IntroOverlay";
import { MISSION_STATUS } from "./labels";
import { MapSheet, MobileNav } from "./MobileNav";
import { OrbitActions, TopBar } from "./TopBar";
import { TravelStatus } from "./TravelStatus";
import { useHudKeys } from "./useHudKeys";

/**
 * DOM overlay above the canvas. The root ignores the pointer so the scene
 * stays clickable; only the controls opt back in. The intro overlay (z-40)
 * and the mobile map sheet are siblings of the root so they can stack above
 * the content panels (z-30).
 */
export function Hud() {
  const phase = useUniverse((s) => s.phase);
  const started = phase !== "intro";
  useHudKeys();

  // Fade the instruments in once the launch begins.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!started) {
      setShown(false);
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [started]);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-20 transition-opacity duration-700",
          shown ? "opacity-100" : "opacity-0"
        )}
      >
        {started && (
          <>
            <TopBar />
            <OrbitActions />

            {/* docked galaxy map: desktop only */}
            <section
              aria-label="Galaxy map"
              className="hud-surface absolute hidden w-[220px] p-2 md:block"
              style={{
                left: "max(16px, env(safe-area-inset-left))",
                bottom: "max(16px, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex items-baseline justify-between px-1 pb-1">
                <p className="hud-label">System map</p>
                <p className="hud-label text-ice/50">{MISSION_STATUS[phase]}</p>
              </div>
              <GalaxyMap variant="dock" />
            </section>

            {/* destination list: desktop, system overview only */}
            {phase === "galaxy" && (
              <aside className="hud-surface absolute right-6 top-1/2 hidden max-h-[calc(100vh-var(--hud-top)-48px)] w-[300px] -translate-y-1/2 overflow-y-auto scrollbar-thin md:block">
                <p className="hud-label border-b border-[var(--hud-line)] px-3 py-2.5">
                  {MISSION_STATUS.galaxy}
                </p>
                <DestinationList />
              </aside>
            )}

            <TravelStatus />
            <MobileNav />
          </>
        )}
      </div>

      <IntroOverlay />
      <MapSheet />
    </>
  );
}
