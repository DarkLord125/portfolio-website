"use client";
import * as THREE from "three";
import {
  DESTINATIONS,
  MOON_ORDER,
  PLANET_ORDER,
  RINGS,
  STAR,
} from "../config/destinations";
import type { Quality } from "../state/types";
import { useDisposable } from "./useDisposable";

function circle(
  center: THREE.Vector3,
  u: THREE.Vector3,
  v: THREE.Vector3,
  radius: number,
  segments: number,
  out: number[]
) {
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * Math.PI * 2;
    const t1 = ((i + 1) / segments) * Math.PI * 2;
    a.copy(center)
      .addScaledVector(u, Math.cos(t0) * radius)
      .addScaledVector(v, Math.sin(t0) * radius);
    b.copy(center)
      .addScaledVector(u, Math.cos(t1) * radius)
      .addScaledVector(v, Math.sin(t1) * radius);
    out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
}

/**
 * Thin orbital guide rings: one per planet around the star (drawn at the
 * planet's own height so the line passes through it) and one per moon around
 * the projects planet. Two draw calls in total.
 */
export function OrbitRings({ quality }: { quality: Quality }) {
  const segments = quality === "high" ? 256 : 128;

  const planetGeo = useDisposable(() => {
    const out: number[] = [];
    const X = new THREE.Vector3(1, 0, 0);
    const Z = new THREE.Vector3(0, 0, 1);
    const c = new THREE.Vector3();
    PLANET_ORDER.forEach((id) => {
      c.set(STAR.position[0], STAR.position[1] + DESTINATIONS[id].position[1], STAR.position[2]);
      circle(c, X, Z, RINGS[id], segments, out);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
    return g;
  }, [segments]);

  const moonGeo = useDisposable(() => {
    const out: number[] = [];
    const center = new THREE.Vector3(...DESTINATIONS.projects.position);
    const u = new THREE.Vector3();
    const v = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    MOON_ORDER.forEach((id) => {
      // Circle through the moon, in the plane holding the moon and the horizontal tangent.
      u.set(...DESTINATIONS[id].position).sub(center);
      const r = u.length();
      u.normalize();
      v.crossVectors(up, u).normalize();
      circle(center, u, v, r, Math.round(segments / 2), out);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
    return g;
  }, [segments]);

  return (
    <group>
      <lineSegments geometry={planetGeo}>
        <lineBasicMaterial
          color="#8fb8e6"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={moonGeo}>
        <lineBasicMaterial
          color="#b9c6ff"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}
