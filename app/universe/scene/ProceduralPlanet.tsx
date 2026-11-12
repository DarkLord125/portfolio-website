"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Destination, Quality } from "../state/types";
import { NOISE_GLSL, SPHERE_VERT, starPosUniform, timeUniform } from "./glsl";
import { Atmosphere } from "./Atmosphere";
import { useDisposable } from "./useDisposable";

/** Surface recipes; the number is the `KIND` define in the fragment shader. */
export const SURFACE = {
  rocky: 0,
  gas: 1,
  dread: 2,
  mythos: 3,
  felt: 4,
} as const;
export type SurfaceKind = keyof typeof SURFACE;

const FRAG = /* glsl */ `
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uAtmo;
uniform vec3 uStarPos;
uniform float uTime;
uniform float uSeed;
varying vec3 vObjPos;
varying vec3 vNormalW;
varying vec3 vWorldPos;
${NOISE_GLSL}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(uStarPos - vWorldPos);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 p = vObjPos;

  vec3 albedo = uPrimary;
  vec3 emissive = vec3(0.0);
  vec3 specColor = vec3(0.0);
  float shininess = 30.0;
  float haze = 0.6;

#if KIND == 0
  // Warm rocky / desert world: warped continents, pale highlands, dusty poles.
  vec3 q = p * 2.2 + uSeed;
  float h = fbm(q + 0.7 * fbm(q * 1.7 + 4.0));
  float detail = vnoise(p * 16.0 + uSeed);
  albedo = mix(uSecondary, uPrimary, smoothstep(0.3, 0.62, h));
  albedo = mix(albedo, uPrimary * 1.3 + vec3(0.1, 0.07, 0.03), smoothstep(0.6, 0.85, h));
  albedo *= 0.78 + 0.44 * detail;
  float cap = smoothstep(0.8, 0.96, abs(p.y) + (h - 0.5) * 0.25);
  albedo = mix(albedo, vec3(0.9, 0.8, 0.72), cap * 0.55);
  haze = 1.0;

#elif KIND == 1
  // Gas giant: latitude bands sheared by slow turbulence, plus one oval storm.
  float w = fbm(vec3(p.x * 1.4, p.y * 5.0, p.z * 1.4) + vec3(uTime * 0.008, 0.0, 0.0) + uSeed);
  float b1 = sin(p.y * 17.0 + w * 4.0);
  float b2 = sin(p.y * 41.0 + w * 7.0 + 1.3);
  vec3 pale = mix(uPrimary, vec3(0.86, 0.88, 1.0), 0.5);
  albedo = mix(uSecondary * 1.25, uPrimary, smoothstep(-0.6, 0.6, b1));
  albedo = mix(albedo, pale, smoothstep(0.3, 0.95, b2) * 0.5);
  vec3 sp = normalize(vec3(0.7, -0.3, 0.64));
  float storm = smoothstep(0.24, 0.06, length((p - sp) * vec3(1.0, 2.3, 1.0)));
  albedo = mix(albedo, pale * 1.05, storm * 0.75);
  albedo *= 0.82 + 0.36 * w;
  haze = 0.8;

#elif KIND == 2
  // DREAD: near-black crust split by cracks that glow deep red.
  vec3 q = p * 3.2 + uSeed;
  float n = fbm(q);
  float r1 = abs(vnoise(q * 1.3 + n * 1.5) * 2.0 - 1.0);
  float r2 = abs(vnoise(q * 2.9 + 7.0 + n) * 2.0 - 1.0);
  float crack = 1.0 - smoothstep(0.0, 0.075, min(r1, r2 + 0.03));
  albedo = mix(uSecondary, uPrimary * 0.4, smoothstep(0.35, 0.75, n));
  albedo *= (0.65 + 0.6 * vnoise(p * 20.0)) * (1.0 - 0.7 * crack);
  float ember = 0.85 + 0.15 * sin(uTime * 0.5 + n * 9.0);
  emissive = vec3(1.3, 0.09, 0.04) * crack * ember * (0.5 + 0.7 * smoothstep(0.35, 0.8, n));
  haze = 0.55;

#elif KIND == 3
  // MYTHOS: layered sandstone with veins of gold.
  float w = fbm(p * 2.4 + uSeed);
  float strata = sin((p.y + w * 0.35) * 26.0);
  float fine = sin((p.y + w * 0.2) * 90.0);
  albedo = mix(uSecondary, uPrimary, smoothstep(-0.7, 0.7, strata) * 0.75 + 0.15);
  albedo *= 0.9 + 0.1 * fine;
  float gold = smoothstep(0.5, 0.68, fbm(p * 5.0 + 3.0 + uSeed));
  albedo = mix(albedo, vec3(1.0, 0.8, 0.4), gold * 0.55);
  albedo *= 0.78 + 0.4 * w;
  specColor = vec3(1.0, 0.85, 0.5) * gold * 0.6;
  shininess = 36.0;
  haze = 0.65;

#else
  // ROYAL FLUSH: deep green felt with a fine gold diamond lattice.
  float felt = vnoise(p * 60.0) * 0.5 + vnoise(p * 140.0) * 0.5;
  albedo = mix(uSecondary, uPrimary, 0.5 + 0.3 * fbm(p * 1.8 + uSeed)) * (0.8 + 0.34 * felt);
  float lon = atan(p.z, p.x);
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float la = abs(fract(lon * 1.27324 + lat * 2.2) - 0.5);
  float lb = abs(fract(lon * 1.27324 - lat * 2.2) - 0.5);
  float lines = max(1.0 - smoothstep(0.0, 0.02, la), 1.0 - smoothstep(0.0, 0.02, lb));
  lines *= smoothstep(1.3, 1.0, abs(lat));
  lines = max(lines, 1.0 - smoothstep(0.0, 0.012, abs(abs(p.y) - 0.045)));
  vec3 goldc = vec3(0.95, 0.74, 0.34);
  albedo = mix(albedo, goldc, lines * 0.85);
  specColor = goldc * lines * 0.7;
  emissive = goldc * lines * 0.05;
  shininess = 48.0;
  haze = 0.55;
#endif

  float ndl = dot(N, L);
  float day = smoothstep(-0.12, 0.55, ndl);
  vec3 col = albedo * (0.02 + 1.05 * day);

  vec3 H = normalize(L + V);
  col += specColor * pow(max(dot(N, H), 0.0), shininess) * day;

  // Thin haze hugging the sunlit limb.
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += uAtmo * fres * haze * 0.55 * smoothstep(-0.2, 0.45, ndl);

  col += emissive;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

const RING_VERT = /* glsl */ `
varying vec3 vWorldPos;
varying float vR;
void main() {
  vR = length(position.xy);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const RING_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uStarPos;
uniform vec3 uCenter;
uniform float uPlanetR;
uniform float uInnerR;
uniform float uOuterR;
varying vec3 vWorldPos;
varying float vR;
float h1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
void main() {
  float t = (vR - uInnerR) / (uOuterR - uInnerR);
  float bands = 0.55 * n1(t * 9.0) + 0.3 * n1(t * 31.0 + 5.0) + 0.15 * n1(t * 90.0);
  float gap = smoothstep(0.02, 0.05, abs(t - 0.58));
  float alpha = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.9, t) * (0.12 + 0.75 * bands) * gap;

  // Planet's shadow across the ring.
  vec3 toStar = normalize(uStarPos - vWorldPos);
  vec3 oc = uCenter - vWorldPos;
  float tca = dot(oc, toStar);
  float d = sqrt(max(dot(oc, oc) - tca * tca, 0.0));
  float shadow = tca > 0.0 ? smoothstep(uPlanetR * 0.94, uPlanetR * 1.06, d) : 1.0;

  vec3 col = mix(uColorB, uColorA, bands) * (0.04 + 0.9 * shadow);
  gl_FragColor = vec4(col, alpha * 0.8);
  #include <colorspace_fragment>
}
`;

function GasRing({ dest }: { dest: Destination }) {
  const inner = dest.radius * 1.38;
  const outer = dest.radius * 1.85;
  const material = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        uniforms: {
          uColorA: { value: new THREE.Color(dest.palette.atmosphere) },
          uColorB: { value: new THREE.Color(dest.palette.primary).multiplyScalar(0.6) },
          uStarPos: starPosUniform,
          uCenter: { value: new THREE.Vector3(...dest.position) },
          uPlanetR: { value: dest.radius },
          uInnerR: { value: inner },
          uOuterR: { value: outer },
        },
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
      }),
    [dest, inner, outer]
  );
  return (
    <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <ringGeometry args={[inner, outer, 128, 1]} />
    </mesh>
  );
}

/**
 * A procedural, self-lit (from the star) spinning sphere with an atmosphere
 * shell. Rendered at the destination's position and radius.
 */
export function ProceduralPlanet({
  dest,
  surface,
  quality,
  tilt = 0.2,
  spin = 0.02,
  seed = 0,
  ring = false,
}: {
  dest: Destination;
  surface: SurfaceKind;
  quality: Quality;
  /** Axial tilt in radians. */
  tilt?: number;
  /** Rotation speed in radians per second. */
  spin?: number;
  seed?: number;
  ring?: boolean;
}) {
  const body = useRef<THREE.Mesh>(null);
  const high = quality === "high";
  const seg = high ? 64 : 32;

  const material = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: FRAG,
        uniforms: {
          uPrimary: { value: new THREE.Color(dest.palette.primary) },
          uSecondary: { value: new THREE.Color(dest.palette.secondary) },
          uAtmo: { value: new THREE.Color(dest.palette.atmosphere) },
          uStarPos: starPosUniform,
          uTime: timeUniform,
          uSeed: { value: seed },
        },
        defines: { KIND: SURFACE[surface], OCTAVES: high ? 4 : 3 },
      }),
    [dest, surface, seed, high]
  );

  useFrame((_, dt) => {
    if (body.current) body.current.rotation.y += dt * spin;
  });

  const isMoon = dest.kind === "moon";
  return (
    <group position={dest.position}>
      <group rotation={[0, 0, tilt]}>
        <mesh ref={body} material={material} scale={dest.radius}>
          <sphereGeometry args={[1, seg, seg / 2]} />
        </mesh>
        {ring && <GasRing dest={dest} />}
      </group>
      <Atmosphere
        radius={dest.radius}
        color={dest.palette.atmosphere}
        thickness={isMoon ? 1.2 : 1.15}
        intensity={isMoon ? 0.7 : 0.9}
        segments={high ? 48 : 24}
      />
    </group>
  );
}
