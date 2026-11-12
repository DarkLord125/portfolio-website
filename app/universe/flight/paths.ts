import { Vector3 } from "three";
import { DESTINATIONS, HUB, RINGS, STAR } from "../config/destinations";
import type { Destination, DestinationId } from "../state/types";

/**
 * Pure flight geometry: orbit poses, travel paths, camera shots.
 * No React, no store, no rig. Functions that run every frame write into an
 * `out` argument and allocate nothing; path building (once per trip) may
 * allocate.
 *
 * Conventions
 *  - World is Y-up. Angles are measured in the XZ plane: (cos a, 0, sin a).
 *  - The ship orbits with a DECREASING angle (clockwise seen from +Y), so the
 *    body is always on the ship's right-hand side.
 *  - The ship's nose is local -Z, its up is local +Y.
 */

export const BASE_FOV = 50;
/** Below this viewport width the content panel is a bottom sheet (Tailwind md). */
export const COMPACT_WIDTH = 768;
/** How far the ship runs forward from the hub during the launch. */
export const LAUNCH_DISTANCE = 40;
/** One lap of a parking orbit takes this many seconds. */
export const ORBIT_PERIOD = 210;
export const ORBIT_SPEED = (Math.PI * 2) / ORBIT_PERIOD;

export interface View {
  /** Viewport width / height */
  aspect: number;
  /** Viewport width in CSS pixels */
  width: number;
  /** Vertical field of view in degrees */
  fov: number;
}

/** A camera pose: where it is, what it looks at, and where on screen (NDC) that point lands. */
export interface Shot {
  pos: Vector3;
  look: Vector3;
  nx: number;
  ny: number;
}

export const createShot = (): Shot => ({
  pos: new Vector3(),
  look: new Vector3(),
  nx: 0,
  ny: 0,
});

export function copyShot(out: Shot, from: Shot): Shot {
  out.pos.copy(from.pos);
  out.look.copy(from.look);
  out.nx = from.nx;
  out.ny = from.ny;
  return out;
}

/** out ← lerp(out, to, k) */
export function lerpShot(out: Shot, to: Shot, k: number): Shot {
  out.pos.lerp(to.pos, k);
  out.look.lerp(to.look, k);
  out.nx += (to.nx - out.nx) * k;
  out.ny += (to.ny - out.ny) * k;
  return out;
}

export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const DEG = Math.PI / 180;

export const isCompact = (view: View) => view.width < COMPACT_WIDTH;

/* ------------------------------------------------------------------ */
/* Hub                                                                 */
/* ------------------------------------------------------------------ */

/** Unit vector from the hub toward the star: the ship's intro heading. */
export function hubForward(out: Vector3): Vector3 {
  return out
    .set(
      STAR.position[0] - HUB.shipPosition[0],
      STAR.position[1] - HUB.shipPosition[1],
      STAR.position[2] - HUB.shipPosition[2]
    )
    .normalize();
}

/** Ship position `distance` units along the launch run. */
export function hubPosition(distance: number, out: Vector3): Vector3 {
  hubForward(out).multiplyScalar(distance);
  out.x += HUB.shipPosition[0];
  out.y += HUB.shipPosition[1];
  out.z += HUB.shipPosition[2];
  return out;
}

/* ------------------------------------------------------------------ */
/* Orbit                                                               */
/* ------------------------------------------------------------------ */

/** Ship position on the parking orbit of `dest` at `angle`. */
export function orbitPosition(dest: Destination, angle: number, out: Vector3): Vector3 {
  return out.set(
    dest.position[0] + Math.cos(angle) * dest.orbitDistance,
    dest.position[1],
    dest.position[2] + Math.sin(angle) * dest.orbitDistance
  );
}

/** Unit direction of travel on the parking orbit at `angle` (angle decreasing). */
export function orbitTangent(angle: number, out: Vector3): Vector3 {
  return out.set(Math.sin(angle), 0, -Math.cos(angle));
}

/**
 * Orbit angle used when the ship is placed without a flight (jump): chosen so
 * the orbit camera, which trails the ship, sits on the star-facing (lit) side.
 */
export function defaultOrbitAngle(dest: Destination): number {
  const dx = STAR.position[0] - dest.position[0];
  const dz = STAR.position[2] - dest.position[2];
  return Math.atan2(dz, dx) - 0.35;
}

/**
 * Orbit angle at which a ship arriving from `from` joins the orbit: it passes
 * the body on its right and is already heading along the orbit.
 */
export function entryOrbitAngle(dest: Destination, from: Vector3): number {
  const dx = from.x - dest.position[0];
  const dz = from.z - dest.position[2];
  if (dx * dx + dz * dz < 1e-6) return defaultOrbitAngle(dest);
  // Prefer arriving on the star-facing side so the body is lit in the orbit
  // shot; fall back to the approach-relative angle when that would mean
  // swinging around the far side of the body (more than ~120° away).
  const approach = Math.atan2(dz, dx) - 75 * DEG;
  const lit = defaultOrbitAngle(dest);
  const diff = Math.atan2(Math.sin(lit - approach), Math.cos(lit - approach));
  return Math.abs(diff) <= 120 * DEG ? lit : approach + Math.sign(diff) * 60 * DEG;
}

/* ------------------------------------------------------------------ */
/* Travel path                                                         */
/* ------------------------------------------------------------------ */

export interface TravelPath {
  p0: Vector3;
  p1: Vector3;
  p2: Vector3;
  p3: Vector3;
  /** Orbit angle of p3 around the target */
  entryAngle: number;
  /** Approximate arc length in world units */
  length: number;
}

/** Point on the cubic bezier at t ∈ [0,1]. */
export function pathPoint(path: TravelPath, t: number, out: Vector3): Vector3 {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return out.set(
    a * path.p0.x + b * path.p1.x + c * path.p2.x + d * path.p3.x,
    a * path.p0.y + b * path.p1.y + c * path.p2.y + d * path.p3.y,
    a * path.p0.z + b * path.p1.z + c * path.p2.z + d * path.p3.z
  );
}

/** Derivative of the bezier at t (not normalised; direction of travel). */
export function pathTangent(path: TravelPath, t: number, out: Vector3): Vector3 {
  const u = 1 - t;
  const a = 3 * u * u;
  const b = 6 * u * t;
  const c = 3 * t * t;
  return out.set(
    a * (path.p1.x - path.p0.x) + b * (path.p2.x - path.p1.x) + c * (path.p3.x - path.p2.x),
    a * (path.p1.y - path.p0.y) + b * (path.p2.y - path.p1.y) + c * (path.p3.y - path.p2.y),
    a * (path.p1.z - path.p0.z) + b * (path.p2.z - path.p1.z) + c * (path.p3.z - path.p2.z)
  );
}

interface Obstacle {
  center: Vector3;
  clearance: number;
  hard: number;
}

const PATH_SAMPLES = 40;

/**
 * Smallest (distance − body radius) over the whole path, checked against the
 * star and every body except `ignore`. Positive means the path touches nothing.
 */
export function pathClearance(path: TravelPath, ignore?: DestinationId): number {
  const p = new Vector3();
  const c = new Vector3();
  let min = Infinity;
  for (let i = 0; i <= PATH_SAMPLES; i++) {
    pathPoint(path, i / PATH_SAMPLES, p);
    min = Math.min(min, p.distanceTo(c.fromArray(STAR.position)) - STAR.radius);
    for (const d of Object.values(DESTINATIONS)) {
      if (d.id === ignore) continue;
      min = Math.min(min, p.distanceTo(c.fromArray(d.position)) - d.radius);
    }
  }
  return min;
}

/**
 * Curved route from `from` (heading `forward`) into the parking orbit of
 * `targetId`. The curve leaves along the current heading, is lifted above the
 * ecliptic, is pushed away from the star and from every other body, and
 * arrives along the orbit tangent.
 */
export function buildTravelPath(
  from: Vector3,
  forward: Vector3,
  targetId: DestinationId
): TravelPath {
  const dest = DESTINATIONS[targetId];
  const entryAngle = entryOrbitAngle(dest, from);
  const p0 = from.clone();
  const p3 = orbitPosition(dest, entryAngle, new Vector3());
  const tangent = orbitTangent(entryAngle, new Vector3());

  const chord = p3.clone().sub(p0);
  const dist = Math.max(chord.length(), 1e-3);
  const dir = chord.multiplyScalar(1 / dist);

  const lift = clamp(dist * 0.16, 1.5, 46);
  const k1 = Math.min(dist * 0.3, 60);
  const k2 = Math.min(dist * 0.35, dest.orbitDistance * 2.2 + 6);

  const p1 = p0
    .clone()
    .addScaledVector(forward, k1 * 0.6)
    .addScaledVector(dir, k1 * 0.6);
  // Target behind the ship: swing out sideways instead of looping straight up.
  const behind = Math.max(0, -forward.dot(dir));
  if (behind > 0) {
    const side = new Vector3(dir.z, 0, -dir.x);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    p1.addScaledVector(side.normalize(), k1 * 0.7 * behind);
  }
  p1.y += lift;
  const p2 = p3.clone().addScaledVector(tangent, -k2);
  p2.y += lift * 0.35;

  const path: TravelPath = { p0, p1, p2, p3, entryAngle, length: dist };

  // Keep clear of the star and of every body that is not the target.
  const obstacles: Obstacle[] = [];
  const addObstacle = (pos: [number, number, number], radius: number, margin: number) => {
    const center = new Vector3(pos[0], pos[1], pos[2]);
    const hard = radius * 1.15;
    // Never demand more room than the endpoints themselves have.
    const endRoom = Math.min(center.distanceTo(p0), center.distanceTo(p3)) * 0.9;
    const clearance = Math.max(hard, Math.min(radius * margin + 2, endRoom));
    obstacles.push({ center, clearance, hard });
  };
  addObstacle(STAR.position, STAR.radius, 2.4);
  for (const d of Object.values(DESTINATIONS)) {
    if (d.id !== targetId) addObstacle(d.position, d.radius, 1.7);
  }

  const sample = new Vector3();
  const push = new Vector3();
  for (let iter = 0; iter < 10; iter++) {
    let worst = 0;
    let worstT = 0;
    let worstObstacle: Obstacle | null = null;
    for (let i = 1; i < PATH_SAMPLES; i++) {
      const t = i / PATH_SAMPLES;
      pathPoint(path, t, sample);
      for (const o of obstacles) {
        const deficit = o.clearance - sample.distanceTo(o.center);
        if (deficit > worst) {
          worst = deficit;
          worstT = t;
          worstObstacle = o;
        }
      }
    }
    if (!worstObstacle) break;
    pathPoint(path, worstT, sample);
    push.copy(sample).sub(worstObstacle.center);
    push.y = Math.abs(push.y) + 0.5 * Math.max(push.length(), 1);
    push.normalize();
    const amount = worst * 1.8 + 3;
    p1.addScaledVector(push, amount * 2 * (1 - worstT));
    p2.addScaledVector(push, amount * 2 * worstT);
  }

  let length = 0;
  const prev = p0.clone();
  for (let i = 1; i <= PATH_SAMPLES; i++) {
    pathPoint(path, i / PATH_SAMPLES, sample);
    length += sample.distanceTo(prev);
    prev.copy(sample);
  }
  path.length = length;
  return path;
}

const inProjectsFamily = (id: DestinationId | null) =>
  id !== null && (id === "projects" || DESTINATIONS[id].parent === "projects");

/** Seconds a trip takes. Local hops around the Project Galaxy are short. */
export function travelDuration(
  from: DestinationId | null,
  to: DestinationId,
  distance: number,
  reducedMotion = false
): number {
  if (reducedMotion) return 0.6;
  if (inProjectsFamily(from) && inProjectsFamily(to)) {
    return clamp(1.4 + distance / 50, 1.8, 2.6);
  }
  return clamp(2.6 + distance / 70, 3.5, 7);
}

/* ------------------------------------------------------------------ */
/* Camera shots                                                        */
/* ------------------------------------------------------------------ */

const _right = new Vector3();
const UP = new Vector3(0, 1, 0);

/** Extra camera distance on narrow viewports so the ship still fits the width. */
export const narrowScale = (aspect: number) => clamp(1.25 / aspect, 1, 2);

/**
 * Intro: third-person, behind / above / right of the ship. The ship sits
 * right of centre on wide screens (text is on the left) and above centre on
 * compact ones (text is at the bottom).
 */
export function introShot(
  ship: Vector3,
  forward: Vector3,
  view: View,
  swayX: number,
  swayY: number,
  out: Shot
): Shot {
  const m = narrowScale(view.aspect);
  _right.crossVectors(forward, UP).normalize();
  out.pos
    .copy(ship)
    .addScaledVector(forward, -11 * m)
    .addScaledVector(_right, 4 + swayX)
    .addScaledVector(UP, 3 * m + swayY);
  out.look.copy(ship);
  if (isCompact(view) || view.aspect < 1) {
    out.nx = 0;
    out.ny = 0.3;
  } else {
    out.nx = 0.34;
    out.ny = -0.04;
  }
  return out;
}

/** Chase camera used while flying: behind and above the ship, looking ahead of it. */
export function chaseShot(ship: Vector3, forward: Vector3, view: View, out: Shot): Shot {
  const m = narrowScale(view.aspect);
  _right.crossVectors(forward, UP);
  if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0);
  _right.normalize();
  out.pos
    .copy(ship)
    .addScaledVector(forward, -13 * m)
    .addScaledVector(_right, 1.6)
    .addScaledVector(UP, 3.6 * m);
  out.look.copy(ship).addScaledVector(forward, 22);
  out.nx = 0;
  out.ny = 0;
  return out;
}

const OUTER_RING = Math.max(...Object.values(RINGS));

/**
 * How much further than HUB.overviewCamera the camera must sit so the widest
 * ring fits the viewport width. 1 on ordinary landscape screens.
 */
export function overviewScale(aspect: number, fov = BASE_FOV): number {
  const dx = HUB.overviewCamera[0] - HUB.overviewTarget[0];
  const dy = HUB.overviewCamera[1] - HUB.overviewTarget[1];
  const dz = HUB.overviewCamera[2] - HUB.overviewTarget[2];
  const base = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const tanH = Math.tan((fov * DEG) / 2) * aspect;
  // 1.16: margin for labels plus the near half of the ring being closer to the lens.
  const needed = (OUTER_RING * 1.16) / tanH;
  return Math.max(1, needed / base);
}

/** System overview. `drift` (radians) slowly swings the camera around the star. */
export function overviewShot(view: View, drift: number, out: Shot): Shot {
  // Wide screens: the destination list is docked right (~260px + margin), so
  // fit the system into the remaining width and centre it there.
  const listFraction = isCompact(view) ? 0 : Math.min(0.36, 280 / view.width);
  const s = overviewScale(view.aspect * (1 - listFraction), BASE_FOV);
  const dx = (HUB.overviewCamera[0] - HUB.overviewTarget[0]) * s;
  const dy = (HUB.overviewCamera[1] - HUB.overviewTarget[1]) * s;
  const dz = (HUB.overviewCamera[2] - HUB.overviewTarget[2]) * s;
  const c = Math.cos(drift);
  const sn = Math.sin(drift);
  out.pos.set(
    HUB.overviewTarget[0] + dx * c + dz * sn,
    HUB.overviewTarget[1] + dy,
    HUB.overviewTarget[2] - dx * sn + dz * c
  );
  out.look.set(HUB.overviewTarget[0], HUB.overviewTarget[1], HUB.overviewTarget[2]);
  out.nx = -listFraction;
  // Compact screens: lift the system a little above the bottom navigation.
  out.ny = isCompact(view) ? 0.06 : 0;
  return out;
}

export interface FrameZone {
  /** NDC centre of the part of the screen not covered by the content panel */
  nx: number;
  ny: number;
  /** NDC half extents of that free area */
  halfX: number;
  halfY: number;
}

/**
 * Where the orbited body should sit. Wide screens: the panel is docked right
 * (width min(560px, 46vw) plus its margin), so the free area is the left part.
 * Compact screens: a bottom sheet covers roughly the lower 60%, so the free
 * area is the band under the top bar.
 */
export function frameZone(view: View, out: FrameZone): FrameZone {
  if (isCompact(view)) {
    out.nx = 0;
    out.ny = 0.52;
    out.halfX = 0.9;
    out.halfY = 0.34;
  } else {
    const panel = (Math.min(560, view.width * 0.46) + 16) / view.width;
    out.nx = -panel;
    out.ny = 0.02;
    out.halfX = 1 - panel;
    out.halfY = 0.84;
  }
  return out;
}

const _zone: FrameZone = { nx: 0, ny: 0, halfX: 1, halfY: 1 };

/**
 * Orbit: the camera trails the ship on a wider circle and looks at the body,
 * which is placed in the free zone; the ship appears beside the body, toward
 * the screen centre, seen from behind. The distance grows until the whole
 * body (or cluster, for constellation / star-system) fits the free zone.
 */
export function orbitShot(dest: Destination, angle: number, view: View, out: Shot): Shot {
  const zone = frameZone(view, _zone);
  const tanV = Math.tan((BASE_FOV * DEG) / 2);
  const tanH = tanV * view.aspect;
  const freeH = Math.atan(zone.halfX * tanH);
  const freeV = Math.atan(zone.halfY * tanV);
  const fit = Math.min(freeH, freeV) * 0.56;
  const od = dest.orbitDistance;
  const camRadius = Math.max(od + 9, dest.radius / Math.sin(fit));

  // Angular gap between body centre and ship as seen from the camera.
  const shipGap = Math.min(freeH * 0.7, 0.3);
  const lateral = Math.tan(shipGap) * (camRadius - od);
  const delta = Math.asin(clamp(lateral / od, 0, 0.6));
  const camAngle = angle + delta;
  const height = camRadius * (isCompact(view) ? 0.05 : 0.12) + 1.5;

  out.pos.set(
    dest.position[0] + Math.cos(camAngle) * camRadius,
    dest.position[1] + height,
    dest.position[2] + Math.sin(camAngle) * camRadius
  );
  out.look.set(dest.position[0], dest.position[1], dest.position[2]);
  out.nx = zone.nx;
  out.ny = zone.ny;
  return out;
}
