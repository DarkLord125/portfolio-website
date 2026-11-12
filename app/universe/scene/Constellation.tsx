"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Destination, Quality } from "../state/types";
import { mulberry32 } from "./glsl";
import { GlowBillboard, GlowPoints, type GlowPoint } from "./Glow";
import { useDisposable } from "./useDisposable";

const STAR_COUNT = 12;

/**
 * The skills destination: a handful of bright stars joined by faint lines
 * (a minimum spanning tree, so it reads as a drawn constellation) inside a
 * soft dust cloud. Three draw calls plus one glow quad.
 */
export function Constellation({ dest, quality }: { dest: Destination; quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const dustCount = quality === "high" ? 240 : 100;
  const R = dest.radius;

  const { stars, dust, edges } = useMemo(() => {
    const rand = mulberry32(77);
    const primary = new THREE.Color(dest.palette.primary);
    const pale = new THREE.Color(dest.palette.atmosphere);
    const deep = new THREE.Color(dest.palette.secondary);
    const c = new THREE.Color();

    // Star positions: rejection-sampled so no two sit on top of each other.
    const pts: THREE.Vector3[] = [];
    let guard = 0;
    while (pts.length < STAR_COUNT && guard++ < 2000) {
      const v = new THREE.Vector3(rand() * 2 - 1, (rand() * 2 - 1) * 0.6, rand() * 2 - 1);
      if (v.length() > 1) continue;
      v.multiplyScalar(R * 0.82);
      let ok = true;
      for (let i = 0; i < pts.length; i++) if (pts[i].distanceTo(v) < R * 0.38) ok = false;
      if (ok) pts.push(v);
    }

    const starPoints: GlowPoint[] = pts.map((p, i) => {
      const major = i % 4 === 0;
      const b = major ? 2.6 : 1.3 + rand() * 0.7;
      c.copy(primary).lerp(pale, rand());
      return {
        position: [p.x, p.y, p.z],
        size: major ? R * 0.42 : R * (0.2 + rand() * 0.1),
        color: [c.r * b, c.g * b, c.b * b],
      };
    });

    // Prim's minimum spanning tree over the stars.
    const edgeList: number[] = [];
    const inTree = [0];
    while (inTree.length < pts.length) {
      let best = Infinity;
      let from = 0;
      let to = -1;
      for (let a = 0; a < inTree.length; a++) {
        for (let b = 0; b < pts.length; b++) {
          if (inTree.indexOf(b) !== -1) continue;
          const d = pts[inTree[a]].distanceToSquared(pts[b]);
          if (d < best) {
            best = d;
            from = inTree[a];
            to = b;
          }
        }
      }
      if (to < 0) break;
      inTree.push(to);
      edgeList.push(pts[from].x, pts[from].y, pts[from].z, pts[to].x, pts[to].y, pts[to].z);
    }

    const dustPoints: GlowPoint[] = [];
    for (let i = 0; i < dustCount; i++) {
      const v = new THREE.Vector3(rand() * 2 - 1, (rand() * 2 - 1) * 0.55, rand() * 2 - 1);
      v.multiplyScalar(R * (0.4 + 0.75 * rand()));
      const b = 0.05 + rand() * 0.06;
      c.copy(deep).lerp(primary, rand() * 0.6);
      dustPoints.push({
        position: [v.x, v.y, v.z],
        size: R * (0.45 + rand() * 0.6),
        color: [c.r * b, c.g * b, c.b * b],
      });
    }

    return { stars: starPoints, dust: dustPoints, edges: edgeList };
  }, [dest, R, dustCount]);

  const lineGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(edges, 3));
    return g;
  }, [edges]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.015;
  });

  return (
    <group position={dest.position}>
      <GlowBillboard color={dest.palette.secondary} size={R * 3.4} intensity={0.3} falloff={3.2} />
      <group ref={group} rotation={[0.25, 0, 0.12]}>
        <GlowPoints points={dust} core={0} />
        <lineSegments geometry={lineGeo} renderOrder={2}>
          <lineBasicMaterial
            color={dest.palette.atmosphere}
            transparent
            opacity={0.32}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
        <GlowPoints points={stars} core={1.4} />
      </group>
    </group>
  );
}
