import { create } from "zustand";
import type { DestinationId, Phase, Quality } from "./types";

/**
 * Navigation state machine. This is the ONLY place phase/location change.
 *
 *   intro --beginExploration--> launching --launchComplete--> galaxy
 *   galaxy|orbit --travelTo(id)--> travelling --arrive--> orbit
 *   orbit --leaveOrbit--> galaxy            (ship stays parked at `location`)
 *   any --jumpTo(id)--> orbit               (no animation; FlightDirector snaps)
 *   launching|travelling --skip--> FlightDirector fast-forwards its timeline
 *
 * FlightDirector is the only caller of launchComplete() and arrive().
 */
export interface UniverseState {
  phase: Phase;
  /** Body the ship is currently parked at; null = the hub (deep space). */
  location: DestinationId | null;
  /** Body the ship is flying to while `travelling`. */
  target: DestinationId | null;
  /** Incremented by skip(); FlightDirector fast-forwards when it changes. */
  skipNonce: number;
  /** Incremented by jumpTo(); FlightDirector snaps the rig when it changes. */
  jumpNonce: number;
  quality: Quality;
  mapOpen: boolean;

  beginExploration: () => void;
  launchComplete: () => void;
  travelTo: (id: DestinationId) => void;
  arrive: () => void;
  leaveOrbit: () => void;
  jumpTo: (id: DestinationId) => void;
  skip: () => void;
  setQuality: (q: Quality) => void;
  setMapOpen: (open: boolean) => void;
}

export const useUniverse = create<UniverseState>((set, get) => ({
  phase: "intro",
  location: null,
  target: null,
  skipNonce: 0,
  jumpNonce: 0,
  quality: "high",
  mapOpen: false,

  beginExploration: () => {
    if (get().phase === "intro") set({ phase: "launching" });
  },
  launchComplete: () => {
    if (get().phase === "launching") set({ phase: "galaxy" });
  },
  travelTo: (id) => {
    const { phase, location } = get();
    if (phase === "launching" || phase === "travelling") return;
    if (phase === "intro") return get().jumpTo(id);
    if (location === id) {
      set({ phase: "orbit", mapOpen: false });
      return;
    }
    set({ phase: "travelling", target: id, mapOpen: false });
  },
  arrive: () => {
    const { phase, target } = get();
    if (phase !== "travelling" || !target) return;
    set({ phase: "orbit", location: target, target: null });
  },
  leaveOrbit: () => {
    if (get().phase === "orbit") set({ phase: "galaxy" });
  },
  jumpTo: (id) =>
    set((s) => ({
      phase: "orbit",
      location: id,
      target: null,
      mapOpen: false,
      jumpNonce: s.jumpNonce + 1,
    })),
  skip: () => set((s) => ({ skipNonce: s.skipNonce + 1 })),
  setQuality: (quality) => set({ quality }),
  setMapOpen: (mapOpen) => set({ mapOpen }),
}));
