"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rig } from "../state/rig";
import type { Quality } from "../state/types";
import { mulberry32, timeUniform } from "./glsl";
import { useDisposable } from "./useDisposable";

const SHELL = 1500;
const _forward = new THREE.Vector3();

const POINT_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPx;
uniform float uWarp;
varying vec3 vColor;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  float tw = 0.82 + 0.18 * sin(uTime * (0.5 + aPhase * 1.6) + aPhase * 40.0);
  gl_PointSize = max(1.2, aSize * tw) * uPx;
  vColor = aColor * tw * (1.0 - 0.45 * uWarp);
}
`;

const POINT_FRAG = /* glsl */ `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  a = a * a * (1.0 + 1.5 * smoothstep(0.35, 0.0, d));
  gl_FragColor = vec4(vColor * a, 1.0);
  #include <colorspace_fragment>
}
`;

const STREAK_VERT = /* glsl */ `
attribute float aEnd;
attribute float aLen;
attribute vec3 aColor;
uniform vec3 uDir;
uniform float uWarp;
varying vec3 vColor;
void main() {
  // Tail vertex sits where the star was a moment ago (ahead along the heading).
  vec3 p = position + uDir * (aEnd * uWarp * aLen);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vColor = aColor * (1.0 - aEnd) * smoothstep(0.02, 0.5, uWarp);
}
`;

const STREAK_FRAG = /* glsl */ `
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1.0);
  #include <colorspace_fragment>
}
`;

function starColor(rand: () => number, out: THREE.Color) {
  const t = rand();
  if (t < 0.22) out.setRGB(0.72, 0.82, 1.0);
  else if (t < 0.8) out.setRGB(1.0, 0.98, 0.95);
  else if (t < 0.94) out.setRGB(1.0, 0.86, 0.68);
  else out.setRGB(1.0, 0.7, 0.55);
}

function randomDirection(rand: () => number, out: THREE.Vector3) {
  const u = rand() * 2 - 1;
  const phi = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  out.set(s * Math.cos(phi), u, s * Math.sin(phi));
  // A third of the stars gather into a tilted band (a hint of a galactic plane).
  if (rand() < 0.34) {
    out.y *= 0.22;
    out.applyAxisAngle(BAND_AXIS, 0.6).normalize();
  }
}
const BAND_AXIS = new THREE.Vector3(1, 0, 0.35).normalize();

/**
 * Layered starfield: one Points draw for the stars and one LineSegments draw
 * for the warp streaks (invisible until rig.warp rises). Both follow the
 * camera so the stars sit at infinity.
 */
export function Starfield({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const streaks = useRef<THREE.LineSegments>(null);

  const count = quality === "high" ? 9000 : 4000;
  const streakCount = quality === "high" ? 2400 : 1000;

  const pointsGeo = useDisposable(() => {
    const rand = mulberry32(1337);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const v = new THREE.Vector3();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      randomDirection(rand, v);
      v.multiplyScalar(SHELL);
      pos.set([v.x, v.y, v.z], i * 3);
      // Mostly faint dust-like stars, a few large bright ones.
      const big = Math.pow(rand(), 9);
      size[i] = 1.1 + rand() * 1.1 + big * 4.5;
      const brightness = 0.28 + Math.pow(rand(), 2.5) * 0.6 + big * 1.4;
      starColor(rand, c);
      col.set([c.r * brightness, c.g * brightness, c.b * brightness], i * 3);
      phase[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count]);

  const streakGeo = useDisposable(() => {
    const rand = mulberry32(4242);
    const pos = new Float32Array(streakCount * 6);
    const col = new Float32Array(streakCount * 6);
    const end = new Float32Array(streakCount * 2);
    const len = new Float32Array(streakCount * 2);
    const v = new THREE.Vector3();
    const c = new THREE.Color();
    for (let i = 0; i < streakCount; i++) {
      randomDirection(rand, v);
      v.multiplyScalar(SHELL * (0.35 + rand() * 0.65));
      const l = SHELL * (0.08 + rand() * 0.3);
      const b = 0.25 + rand() * 0.75;
      starColor(rand, c);
      for (let k = 0; k < 2; k++) {
        const j = i * 2 + k;
        pos.set([v.x, v.y, v.z], j * 3);
        col.set([c.r * b, c.g * b, c.b * b], j * 3);
        end[j] = k;
        len[j] = l;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    g.setAttribute("aLen", new THREE.BufferAttribute(len, 1));
    return g;
  }, [streakCount]);

  const pointsMat = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms: {
          uTime: timeUniform,
          uPx: { value: 1 },
          uWarp: { value: 0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const streakMat = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STREAK_VERT,
        fragmentShader: STREAK_FRAG,
        uniforms: {
          uDir: { value: new THREE.Vector3(0, 0, 1) },
          uWarp: { value: 0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.position.copy(state.camera.position);
    const warp = THREE.MathUtils.clamp(rig.warp, 0, 1);
    pointsMat.uniforms.uPx.value = state.gl.getPixelRatio();
    pointsMat.uniforms.uWarp.value = warp;
    streakMat.uniforms.uWarp.value = warp;
    // Stars rush past backwards, so each tail marks where the star was: further along the heading (-Z local).
    _forward.set(0, 0, -1).applyQuaternion(rig.shipQuaternion);
    (streakMat.uniforms.uDir.value as THREE.Vector3).copy(_forward);
    if (streaks.current) streaks.current.visible = warp > 0.01;
  });

  return (
    <group ref={group}>
      <points geometry={pointsGeo} material={pointsMat} frustumCulled={false} renderOrder={-1} />
      <lineSegments
        ref={streaks}
        geometry={streakGeo}
        material={streakMat}
        frustumCulled={false}
        renderOrder={-1}
        visible={false}
      />
    </group>
  );
}
