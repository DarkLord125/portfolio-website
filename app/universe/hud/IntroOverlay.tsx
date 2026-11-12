"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/util";
import { DESTINATIONS, HUB, PLANET_ORDER } from "../config/destinations";
import { PROFILE } from "../content/profile";
import { useUniverse } from "../state/store";
import { GalaxyMap } from "./GalaxyMap";
import { MISSION_STATUS } from "./labels";

const WORDS = PROFILE.welcome.split(" ");
const FADE_MS = 700;

/**
 * Opening shot. The ship fills the right of the frame (top on phones); this
 * layer adds one line of text, one action and a sparse instrument readout
 * around the edges. It fades out as soon as the phase leaves `intro`.
 */
export function IntroOverlay() {
  const phase = useUniverse((s) => s.phase);
  const beginExploration = useUniverse((s) => s.beginExploration);
  const skip = useUniverse((s) => s.skip);
  const travelTo = useUniverse((s) => s.travelTo);

  const visible = phase === "intro";
  const [mounted, setMounted] = useState(visible);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const id = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(id);
    }
    const id = window.setTimeout(() => setMounted(false), FADE_MS + 50);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (!mounted) return null;

  const skipIntro = () => {
    beginExploration();
    skip();
  };

  /** Staggered fade-up: class + delay for one block. */
  const fade = (extra: string) =>
    cn(
      extra,
      "transition-[opacity,transform] duration-700 ease-out",
      revealed ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
    );
  const delay = (ms: number) => ({ transitionDelay: `${ms}ms` });
  const afterWords = 250 + WORDS.length * 70;
  const interactive = visible ? "pointer-events-auto" : "pointer-events-none";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-40 transition-opacity ease-out",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={!visible}
    >
      {/* legibility scrim: left on wide screens, bottom on phones */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-950/90 via-space-950/25 to-transparent md:bg-gradient-to-r md:from-space-950/80 md:via-space-950/20" />

      {/* instrument readouts */}
      <div
        className={fade("absolute left-0 top-0 p-4 md:p-8")}
        style={{ ...delay(900), paddingLeft: "max(16px, env(safe-area-inset-left))" }}
      >
        <p className="hud-label">Position</p>
        <p className="hud-value">{HUB.coords}</p>
      </div>
      <div
        className={fade("absolute right-0 top-0 p-4 text-right md:p-8")}
        style={{ ...delay(1000), paddingRight: "max(16px, env(safe-area-inset-right))" }}
      >
        <p className="hud-label">Mission status</p>
        <p className="hud-value">{MISSION_STATUS.intro}</p>
      </div>

      <div
        className={fade("absolute bottom-8 right-8 hidden w-[210px] flex-col gap-6 md:flex")}
        style={delay(1100)}
      >
        <div>
          <p className="hud-label mb-2">Destinations</p>
          <ul>
            {PLANET_ORDER.map((id, i) => (
              <li key={id}>
                <button
                  type="button"
                  disabled={!visible}
                  onClick={() => travelTo(id)}
                  aria-label={`Jump to ${DESTINATIONS[id].name}`}
                  className={cn(
                    "focus-ring flex w-full items-baseline gap-3 py-1 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ice/70 transition-colors hover:text-ice-bright",
                    interactive
                  )}
                >
                  <span aria-hidden="true" className="text-ice/40">
                    0{i + 1}
                  </span>
                  {DESTINATIONS[id].name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="hud-label mb-1">System map</p>
          <div className={cn("w-[150px]", !visible && "[&_button]:pointer-events-none")}>
            <GalaxyMap variant="mini" />
          </div>
        </div>
      </div>

      {/* the line and the one action */}
      <div
        className="absolute inset-x-0 bottom-0 px-6 md:inset-x-auto md:bottom-auto md:left-[7vw] md:top-1/2 md:max-w-[34rem] md:-translate-y-1/2 md:px-0"
        style={{ paddingBottom: "max(28px, env(safe-area-inset-bottom))" }}
      >
        <p className={fade("hud-label mb-4")} style={delay(100)}>
          {PROFILE.name} · {PROFILE.title}
        </p>
        <h1
          aria-label={PROFILE.welcome}
          className="text-balance font-display text-[2rem] font-medium leading-[1.12] tracking-tight text-ice-bright sm:text-4xl md:text-5xl md:leading-[1.08]"
        >
          {WORDS.map((word, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={fade("inline-block whitespace-pre")}
              style={delay(250 + i * 70)}
            >
              {word}
              {i < WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        <div
          className={fade("mt-8 flex flex-wrap items-center gap-x-6 gap-y-3")}
          style={delay(afterWords + 150)}
        >
          <button
            type="button"
            disabled={!visible}
            onClick={beginExploration}
            className={cn(
              "focus-ring inline-flex min-h-[48px] items-center gap-3 bg-ember px-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-space-950 transition-colors hover:bg-ice-bright",
              interactive
            )}
          >
            Begin Exploration
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            disabled={!visible}
            onClick={skipIntro}
            className={cn(
              "focus-ring min-h-[44px] font-mono text-[11px] uppercase tracking-[0.16em] text-ice/70 underline decoration-ice/30 underline-offset-4 transition-colors hover:text-ice-bright",
              interactive
            )}
          >
            Skip intro
          </button>
          <Link
            href="/lite"
            tabIndex={visible ? undefined : -1}
            className={cn(
              "focus-ring inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.16em] text-ice/70 underline decoration-ice/30 underline-offset-4 transition-colors hover:text-ice-bright",
              interactive
            )}
          >
            Text version
          </Link>
        </div>
      </div>
    </div>
  );
}
