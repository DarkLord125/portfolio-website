import { Vector3 } from "three";
import { STAR } from "../config/destinations";

/**
 * Shared shader pieces and shared uniforms for the scene.
 *
 * All scene shaders work in linear colour and end with
 * `#include <colorspace_fragment>` so they look the same with and without the
 * post-processing composer (which renders into a linear buffer).
 */

/** Elapsed seconds; written once per frame by <SceneClock/> in SpaceScene. */
export const timeUniform = { value: 0 };

/** World position of the key light (the central star). */
export const starPosUniform = { value: new Vector3(...STAR.position) };

/** Value noise + fbm. Requires an `OCTAVES` define on the material. */
export const NOISE_GLSL = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < OCTAVES; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(17.1, 3.7, 9.2);
    a *= 0.5;
  }
  return s;
}
`;

/** Vertex shader shared by every lit sphere (planets, moons, earth, clouds). */
export const SPHERE_VERT = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
  vUv = uv;
  vObjPos = normalize(position);
  mat3 m = mat3(modelMatrix);
  vNormalW = normalize(m * normal);
  vTangentW = normalize(m * vec3(position.z, 0.0, -position.x + 1e-5));
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/** Deterministic PRNG so the scene looks identical on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
