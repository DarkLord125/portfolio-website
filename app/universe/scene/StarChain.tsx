"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Destination, Quality } from "../state/types";
import { GlowPoints, type GlowPoint } from "./Glow";
import { useDisposable } from "./useDisposable";

const COUNT = 5;

/**
 * The career destination: five stars of growing size and brightness along a
 * rising arc, joined by a path that brightens as it goes: a progression.
 */
export function StarChain({ dest, quality }: { dest: Destination; quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const R = dest.radius;
  const seg = quality === "high" ? 32 : 16;

  const { stars, halos, curvePoints } = useMemo(() => {
    const early = new THREE.Color(dest.palette.secondary);
    const mid = new THREE.Color(dest.palette.primary);
    const late = new THREE.Color(dest.palette.atmosphere);
    const list: { position: THREE.Vector3; radius: number; color: THREE.Color }[] = [];
    const glow: GlowPoint[] = [];
    for (let i = 0; i < COUNT; i++) {
      const t = i / (COUNT - 1);
      const position = new THREE.Vector3(
        THREE.MathUtils.lerp(-0.82, 0.82, t) * R,
        (-0.4 + 0.62 * Math.pow(t, 1.3) + 0.2 * Math.sin(Math.PI * t)) * R,
        Math.sin(t * Math.PI * 1.15) * 0.34 * R
      );
      const radius = R * (0.045 + 0.085 * t * t + 0.03 * t);
      const color = early.clone().lerp(mid, Math.min(1, t * 2));
      if (t > 0.5) color.lerp(late, (t - 0.5) * 2);
      const b = 0.5 + 0.7 * t;
      glow.push({
        position: [position.x, position.y, position.z],
        size: radius * 9,
        color: [color.r * b, color.g * b, color.b * b],
      });
      // Surface itself is over-bright so it blooms in high quality.
      list.push({ position, radius, color: color.clone().multiplyScalar(1.4 + 1.6 * t) });
    }
    const curve = new THREE.CatmullRomCurve3(
      list.map((s) => s.position),
      false,
      "catmullrom",
      0.5
    );
    return { stars: list, halos: glow, curvePoints: curve.getPoints(72) };
  }, [dest, R]);

  const path = useDisposable(() => {
    const n = curvePoints.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const c = new THREE.Color(dest.palette.primary);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const b = 0.12 + 0.75 * t * t;
      pos.set([curvePoints[i].x, curvePoints[i].y, curvePoints[i].z], i * 3);
      col.set([c.r * b, c.g * b, c.b * b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [curvePoints, dest]);

  const pathMaterial = useDisposable(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    []
  );

  const pathLine = useMemo(() => new THREE.Line(path, pathMaterial), [path, pathMaterial]);

  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.18;
  });

  return (
    <group position={dest.position}>
      <group ref={group}>
        <primitive object={pathLine} />
        {stars.map((s, i) => (
          <mesh key={i} position={s.position} scale={s.radius}>
            <sphereGeometry args={[1, seg, seg / 2]} />
            <meshBasicMaterial color={s.color} toneMapped={false} />
          </mesh>
        ))}
        <GlowPoints points={halos} core={0} />
      </group>
    </group>
  );
}
