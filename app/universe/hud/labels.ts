import { DESTINATIONS } from "../config/destinations";
import type { DestinationId, Phase, PlanetId } from "../state/types";

/** Mission status line shown in the HUD for each phase. */
export const MISSION_STATUS: Record<Phase, string> = {
  intro: "Awaiting launch",
  launching: "Launching",
  galaxy: "Select a destination",
  travelling: "En route",
  orbit: "In orbit",
};

/** Short labels for tight spaces (mobile nav, map). */
export const SHORT_LABEL: Record<PlanetId, string> = {
  about: "About",
  projects: "Projects",
  skills: "Skills",
  career: "Career",
  contact: "Contact",
};

export const shortLabel = (id: DestinationId): string =>
  id in SHORT_LABEL ? SHORT_LABEL[id as PlanetId] : DESTINATIONS[id].name;

/** True for the Project Galaxy and its moons. */
export const inProjectsFamily = (id: DestinationId | null): boolean =>
  id !== null && (id === "projects" || DESTINATIONS[id].parent === "projects");

/** Keyboard events from these elements are never treated as HUD shortcuts. */
export function isFormField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/** Elements that already do something on Space / Enter. */
export function isActivatable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest("button, a[href], summary, [role='button']") !== null;
}
