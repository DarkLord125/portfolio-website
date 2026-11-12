"use client";
import { useEffect } from "react";
import { PLANET_ORDER } from "../config/destinations";
import { useUniverse } from "../state/store";
import { isActivatable, isFormField } from "./labels";

/**
 * Global shortcuts:
 *   Esc    close the map sheet · skip a flight · leave orbit
 *   Space  skip a flight
 *   1–5    travel to the planets in order (galaxy / orbit)
 * Nothing fires while the user is typing in a form field.
 */
export function useHudKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (isFormField(e.target)) return;
      const s = useUniverse.getState();
      const flying = s.phase === "launching" || s.phase === "travelling";

      if (e.key === "Escape") {
        if (s.mapOpen) s.setMapOpen(false);
        else if (flying) s.skip();
        else if (s.phase === "orbit") s.leaveOrbit();
        else return;
        e.preventDefault();
        return;
      }

      if (e.key === " " || e.code === "Space") {
        // A focused button or link keeps its own Space behaviour.
        if (!flying || isActivatable(e.target)) return;
        e.preventDefault();
        if (!e.repeat) s.skip();
        return;
      }

      if (e.key >= "1" && e.key <= "5" && e.key.length === 1) {
        if (s.phase !== "galaxy" && s.phase !== "orbit") return;
        const id = PLANET_ORDER[Number(e.key) - 1];
        if (id) {
          e.preventDefault();
          s.travelTo(id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
