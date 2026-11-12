"use client";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getDestination } from "../config/destinations";
import { useUniverse } from "../state/store";
import type { DestinationId } from "../state/types";
import { HoloPanel } from "./HoloPanel";

/** Shell shown while a destination's panel code is being fetched. */
function PanelLoading() {
  const location = useUniverse((s) => s.location);
  if (!location) return null;
  const destination = getDestination(location);
  return (
    <HoloPanel id={location} title={destination.name} subtitle={destination.tagline}>
      <p role="status" className="hud-label">
        Receiving data…
      </p>
    </HoloPanel>
  );
}

const loading = () => <PanelLoading />;

// One chunk per destination: only what the visitor actually orbits is loaded.
const AboutPanel = dynamic(() => import("./AboutPanel").then((m) => m.AboutPanel), { loading });
const ProjectsPanel = dynamic(() => import("./ProjectsPanel").then((m) => m.ProjectsPanel), { loading });
const ProjectDetailPanel = dynamic(
  () => import("./ProjectDetailPanel").then((m) => m.ProjectDetailPanel),
  { loading }
);
const SkillsPanel = dynamic(() => import("./SkillsPanel").then((m) => m.SkillsPanel), { loading });
const CareerPanel = dynamic(() => import("./CareerPanel").then((m) => m.CareerPanel), { loading });
const ContactPanel = dynamic(() => import("./ContactPanel").then((m) => m.ContactPanel), { loading });

function panelFor(id: DestinationId) {
  switch (id) {
    case "about":
      return <AboutPanel />;
    case "projects":
      return <ProjectsPanel />;
    case "dread":
    case "mythos":
    case "royal-flush":
      return <ProjectDetailPanel id={id} />;
    case "skills":
      return <SkillsPanel />;
    case "career":
      return <CareerPanel />;
    case "contact":
      return <ContactPanel />;
  }
}

const RESOLVE = { duration: 0.36, ease: [0.2, 0.7, 0.2, 1] as const };

/** Shows the content panel of the body the ship is orbiting. */
export function PanelHost() {
  const phase = useUniverse((s) => s.phase);
  const location = useUniverse((s) => s.location);
  const reduceMotion = useReducedMotion();
  const active = phase === "orbit" ? location : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            className="pointer-events-auto absolute inset-x-0 bottom-[var(--hud-bottom)] md:inset-x-auto md:bottom-4 md:right-4 md:top-[calc(var(--hud-top)_+_16px)] md:w-[min(560px,46vw)]"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 16, clipPath: "inset(0% 0% 100% 0%)" }
            }
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, y: 8, transition: { duration: 0.2, ease: "easeIn" } }
            }
            transition={reduceMotion ? { duration: 0 } : RESOLVE}
          >
            {panelFor(active)}
            {!reduceMotion && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 h-px bg-ice/70"
                initial={{ top: "0%", opacity: 0.9 }}
                animate={{ top: "100%", opacity: 0 }}
                transition={{ duration: 0.38, ease: "linear" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
