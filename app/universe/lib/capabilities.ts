import type { Quality } from "../state/types";

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function isTouchDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

const QUALITY_KEY = "universe-quality";

export function storedQuality(): Quality | null {
  try {
    const v = window.localStorage.getItem(QUALITY_KEY);
    return v === "high" || v === "low" ? v : null;
  } catch {
    return null;
  }
}

export function storeQuality(q: Quality) {
  try {
    window.localStorage.setItem(QUALITY_KEY, q);
  } catch {
    /* private mode: ignore */
  }
}

/** First-visit guess; the user's own choice (storedQuality) always wins. */
export function detectQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 600;
  if (prefersReducedMotion()) return "low";
  if (isTouchDevice() && (smallScreen || lowMemory)) return "low";
  if (lowMemory && fewCores) return "low";
  return "high";
}
