"use client";
import * as THREE from "three";
import { STAR } from "../config/destinations";
import type { Quality } from "../state/types";
import { NOISE_GLSL, SPHERE_VERT, timeUniform } from "./glsl";
import { GlowBillboard } from "./Glow";
import { useDisposable } from "./useDisposable";

const FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vObjPos;
varying vec3 vNormalW;
varying vec3 vWorldPos;
${NOISE_GLSL}
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float n = fbm(vObjPos * 3.0 + vec3(0.0, uTime * 0.04, 0.0));
  float n2 = fbm(vObjPos * 8.0 - vec3(uTime * 0.03));
  float g = n * 0.6 + n2 * 0.4;
  vec3 col = mix(vec3(1.0, 0.5, 0.16), vec3(1.0, 0.93, 0.78), smoothstep(0.25, 0.7, g));
  float limb = pow(max(dot(N, V), 0.0), 0.5);
  col *= (1.3 + 1.7 * g) * mix(0.5, 1.0, limb);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/** The system's star: emissive granulated surface, corona, and the scene's key light. */
export function CentralStar({ quality }: { quality: Quality }) {
  const high = quality === "high";
  const material = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: FRAG,
        uniforms: { uTime: timeUniform },
        defines: { OCTAVES: high ? 4 : 3 },
      }),
    [high]
  );
  const seg = high ? 64 : 32;

  return (
    <group position={STAR.position}>
      <mesh material={material} scale={STAR.radius}>
        <sphereGeometry args={[1, seg, seg / 2]} />
      </mesh>
      {/* Tight corona hugging the limb, then a wide faint halo. */}
      <GlowBillboard color="#ffc98a" size={STAR.radius * 5.2} intensity={1.5} falloff={4.2} />
      <GlowBillboard color="#ff9a55" size={STAR.radius * 13} intensity={0.32} falloff={3.2} />
      {/* Key light for standard-material objects (the ship). Procedural bodies light themselves from the same point. */}
      <pointLight color="#fff0dc" intensity={4.2} decay={0} />
    </group>
  );
}
