import type { Destination, DestinationId, MoonId, PlanetId } from "../state/types";

/**
 * Single source of truth for where everything is. Scene, flight and HUD all
 * read from here; nobody hardcodes positions elsewhere.
 * World units: the star sits at the origin, planets are static on their
 * orbital rings (they spin, they do not revolve) so flight paths stay stable.
 */

const onRing = (
  ringRadius: number,
  angleDeg: number,
  y = 0
): [number, number, number] => {
  const a = (angleDeg * Math.PI) / 180;
  return [
    Math.round(Math.cos(a) * ringRadius * 100) / 100,
    y,
    Math.round(Math.sin(a) * ringRadius * 100) / 100,
  ];
};

const offset = (
  base: [number, number, number],
  d: [number, number, number]
): [number, number, number] => [base[0] + d[0], base[1] + d[1], base[2] + d[2]];

export const STAR = { position: [0, 0, 0] as [number, number, number], radius: 14 };

/** Ring radius per planet; OrbitPaths draws one ring for each. */
export const RINGS: Record<PlanetId, number> = {
  about: 70,
  projects: 125,
  skills: 175,
  career: 220,
  contact: 270,
};

const PROJECTS_POS = onRing(RINGS.projects, 322, -4);

export const PLANET_ORDER: PlanetId[] = [
  "about",
  "projects",
  "skills",
  "career",
  "contact",
];
export const MOON_ORDER: MoonId[] = ["dread", "mythos", "royal-flush"];

export const DESTINATIONS: Record<DestinationId, Destination> = {
  about: {
    id: "about",
    name: "ABOUT ME",
    tagline: "Identity and approach",
    kind: "planet",
    position: onRing(RINGS.about, 205, 3),
    radius: 7,
    orbitDistance: 21,
    palette: { primary: "#c98a5a", secondary: "#5a3b2e", atmosphere: "#ffb98a" },
    coords: "AX-01 · 205.0° · 0.47 AU",
  },
  projects: {
    id: "projects",
    name: "PROJECT GALAXY",
    tagline: "DREAD · MYTHOS · ROYAL FLUSH",
    kind: "gas-giant",
    position: PROJECTS_POS,
    radius: 13,
    orbitDistance: 60,
    palette: { primary: "#6d7fd6", secondary: "#2a2f66", atmosphere: "#9fb2ff" },
    coords: "PG-02 · 322.0° · 0.83 AU",
  },
  skills: {
    id: "skills",
    name: "TECH CONSTELLATION",
    tagline: "Skills, mapped as stars",
    kind: "constellation",
    position: onRing(RINGS.skills, 112, 10),
    radius: 9,
    orbitDistance: 30,
    palette: { primary: "#9fd0ff", secondary: "#3b6ea8", atmosphere: "#cfe6ff" },
    coords: "TC-03 · 112.0° · 1.17 AU",
  },
  career: {
    id: "career",
    name: "CAREER JOURNEY",
    tagline: "2020 → present",
    kind: "star-system",
    position: onRing(RINGS.career, 252, -6),
    radius: 9,
    orbitDistance: 30,
    palette: { primary: "#ffc37a", secondary: "#b3622a", atmosphere: "#ffe1b3" },
    coords: "CJ-04 · 252.0° · 1.47 AU",
  },
  contact: {
    id: "contact",
    name: "CONTACT",
    tagline: "A habitable world",
    kind: "habitable",
    position: onRing(RINGS.contact, 24, 2),
    radius: 10,
    orbitDistance: 28,
    palette: { primary: "#2f6fd0", secondary: "#3f8f4f", atmosphere: "#8fc8ff" },
    coords: "HB-05 · 24.0° · 1.80 AU",
  },
  dread: {
    id: "dread",
    name: "DREAD",
    tagline: "Survival horror",
    kind: "moon",
    parent: "projects",
    position: offset(PROJECTS_POS, [-24, 5, 12]),
    radius: 3,
    orbitDistance: 10,
    palette: { primary: "#7a1f1f", secondary: "#1a0d0f", atmosphere: "#c23b3b" },
    coords: "PG-02a · moon I",
  },
  mythos: {
    id: "mythos",
    name: "MYTHOS",
    tagline: "Ancient Wars",
    kind: "moon",
    parent: "projects",
    position: offset(PROJECTS_POS, [6, -3, 31]),
    radius: 3.2,
    orbitDistance: 10.5,
    palette: { primary: "#c9a24a", secondary: "#6b4a1f", atmosphere: "#f0d58a" },
    coords: "PG-02b · moon II",
  },
  "royal-flush": {
    id: "royal-flush",
    name: "ROYAL FLUSH",
    tagline: "Poker platform",
    kind: "moon",
    parent: "projects",
    position: offset(PROJECTS_POS, [30, 7, 6]),
    radius: 2.8,
    orbitDistance: 9.5,
    palette: { primary: "#1f7a52", secondary: "#0d2a1f", atmosphere: "#5fd09a" },
    coords: "PG-02c · moon III",
  },
};

/** Where the ship sits during the intro and when no destination is selected. */
export const HUB = {
  shipPosition: [0, 16, 330] as [number, number, number],
  /** Overview camera used in the `galaxy` phase. */
  overviewCamera: [0, 170, 400] as [number, number, number],
  overviewTarget: [0, 0, 0] as [number, number, number],
  coords: "HUB · 0.0° · 2.20 AU",
};

export const getDestination = (id: DestinationId) => DESTINATIONS[id];
export const isMoon = (id: DestinationId): id is MoonId =>
  DESTINATIONS[id].kind === "moon";
