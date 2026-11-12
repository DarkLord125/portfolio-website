export type PlanetId = "about" | "projects" | "skills" | "career" | "contact";
export type MoonId = "dread" | "mythos" | "royal-flush";
export type DestinationId = PlanetId | MoonId;

/**
 * intro      – opening shot, ship idling, "Begin Exploration" visible
 * launching  – ship accelerates away from the intro shot (FlightDirector owns it)
 * galaxy     – system overview; ship parked at `location` (or the hub when null)
 * travelling – ship flying to `target` (FlightDirector owns it)
 * orbit      – ship in orbit of `location`, content panel shown
 */
export type Phase = "intro" | "launching" | "galaxy" | "travelling" | "orbit";

export type Quality = "high" | "low";

export type DestinationKind =
  | "planet"
  | "gas-giant"
  | "constellation"
  | "star-system"
  | "habitable"
  | "moon";

export interface Destination {
  id: DestinationId;
  /** HUD / map label, e.g. "ABOUT ME" */
  name: string;
  /** One short line for the destination list */
  tagline: string;
  kind: DestinationKind;
  parent?: PlanetId;
  /** World position of the body's centre */
  position: [number, number, number];
  /** Visual radius of the body in world units */
  radius: number;
  /** Distance from the body's centre at which the ship parks in orbit */
  orbitDistance: number;
  palette: { primary: string; secondary: string; atmosphere: string };
  /** Decorative coordinates shown in the HUD */
  coords: string;
}
