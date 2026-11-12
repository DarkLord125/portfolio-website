"use client";
import * as THREE from "three";
import { SPHERE_VERT, starPosUniform } from "./glsl";
import { useDisposable } from "./useDisposable";

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uStarPos;
uniform float uIntensity;
uniform float uInner; // dot(-N, V) at the planet's silhouette
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 L = normalize(uStarPos - vWorldPos);
  // Back faces: 0 at the shell's outer edge, uInner where the planet's limb is.
  float d = clamp(dot(-N, V) / uInner, 0.0, 1.0);
  // Steep falloff: the sRGB encode lifts low values, so a gentle curve reads
  // as a flat disc with a hard edge instead of a thin scattering rim.
  float glow = pow(d, 5.5);
  // Only the sunlit side scatters; the night side keeps a trace.
  float lit = 0.06 + 0.94 * smoothstep(-0.35, 0.45, dot(N, L));
  gl_FragColor = vec4(uColor * glow * lit * uIntensity, 1.0);
  #include <colorspace_fragment>
}
`;

/**
 * Fresnel atmosphere halo: an additive back-side shell slightly larger than
 * the body, brightest at the limb and fading outwards, lit by the star.
 */
export function Atmosphere({
  radius,
  color,
  thickness = 1.16,
  intensity = 1,
  segments = 48,
}: {
  radius: number;
  color: string;
  /** Shell radius as a multiple of the body radius. */
  thickness?: number;
  intensity?: number;
  segments?: number;
}) {
  const material = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uStarPos: starPosUniform,
          uIntensity: { value: intensity },
          uInner: { value: Math.sqrt(1 - 1 / (thickness * thickness)) },
        },
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color, intensity, thickness]
  );
  return (
    <mesh material={material} scale={radius * thickness} renderOrder={3}>
      <sphereGeometry args={[1, segments, Math.round(segments / 2)]} />
    </mesh>
  );
}
