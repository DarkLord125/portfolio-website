"use client";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDisposable } from "./useDisposable";

/* ------------------------------------------------------------------ */
/* Camera-facing soft glow quad                                        */
/* ------------------------------------------------------------------ */

const BILLBOARD_VERT = /* glsl */ `
uniform float uSize;
varying vec2 vP;
void main() {
  vP = position.xy * 2.0;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += position.xy * uSize;
  gl_Position = projectionMatrix * mv;
}
`;

const BILLBOARD_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uFalloff;
varying vec2 vP;
void main() {
  float r = length(vP);
  float edge = max(0.0, 1.0 - r);
  float g = exp(-r * uFalloff) * edge + 0.18 * edge * edge * edge;
  gl_FragColor = vec4(uColor * g * uIntensity, 1.0);
  #include <colorspace_fragment>
}
`;

/** Material for a unit plane that always faces the camera; `size` is its world diameter. */
export function createGlowMaterial(
  color: THREE.ColorRepresentation,
  size: number,
  intensity = 1,
  falloff = 5
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: BILLBOARD_VERT,
    fragmentShader: BILLBOARD_FRAG,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uIntensity: { value: intensity },
      uFalloff: { value: falloff },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

export function GlowBillboard({
  color,
  size,
  intensity = 1,
  falloff = 5,
  position,
  depthTest = true,
}: {
  color: THREE.ColorRepresentation;
  size: number;
  intensity?: number;
  falloff?: number;
  position?: [number, number, number];
  depthTest?: boolean;
}) {
  const material = useDisposable(() => {
    const m = createGlowMaterial(color, size, intensity, falloff);
    m.depthTest = depthTest;
    return m;
  }, [color, size, intensity, falloff, depthTest]);
  return (
    <mesh material={material} position={position} frustumCulled={false} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* World-sized glowing points (one draw for a whole cluster)           */
/* ------------------------------------------------------------------ */

const POINTS_VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
uniform float uHalfHeight;
varying vec3 vColor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  // World diameter -> pixels.
  gl_PointSize = max(2.0, aSize * projectionMatrix[1][1] * uHalfHeight / max(0.001, -mv.z));
  vColor = aColor;
}
`;

const POINTS_FRAG = /* glsl */ `
uniform float uCore;
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float edge = max(0.0, 1.0 - d);
  float halo = exp(-d * 6.0) * edge;
  float core = smoothstep(0.16, 0.04, d) * uCore;
  gl_FragColor = vec4(vColor * (halo + core), 1.0);
  #include <colorspace_fragment>
}
`;

export interface GlowPoint {
  position: [number, number, number];
  /** World diameter of the halo. */
  size: number;
  /** Linear RGB, may exceed 1 for bloom. */
  color: [number, number, number];
}

/** A cluster of soft, perspective-sized glowing points. `core` adds a hard bright centre. */
export function GlowPoints({ points, core = 1 }: { points: GlowPoint[]; core?: number }) {
  const geometry = useDisposable(() => {
    const n = points.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set(points[i].position, i * 3);
      col.set(points[i].color, i * 3);
      size[i] = points[i].size;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.computeBoundingSphere();
    return g;
  }, [points]);

  const material = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POINTS_VERT,
        fragmentShader: POINTS_FRAG,
        uniforms: { uHalfHeight: { value: 400 }, uCore: { value: core } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [core]
  );

  useFrame((state) => {
    material.uniforms.uHalfHeight.value = state.size.height * state.gl.getPixelRatio() * 0.5;
  });

  return <points geometry={geometry} material={material} renderOrder={2} />;
}
