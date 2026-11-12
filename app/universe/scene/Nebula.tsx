"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Quality } from "../state/types";
import { NOISE_GLSL } from "./glsl";

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
varying vec3 vDir;
${NOISE_GLSL}
void main() {
  vec3 d = normalize(vDir);
  #ifdef HQ
    float q = fbm(d * 2.3 + 5.0);
    vec3 w = d * 1.7 + vec3(q, q * 0.7, -q) * 0.9;
  #else
    vec3 w = d * 1.7;
  #endif
  float n1 = fbm(w);
  float n2 = fbm(d * 3.1 + 20.0);

  // Denser along a tilted band, thin elsewhere.
  float bd = dot(d, normalize(vec3(0.25, 0.9, 0.35))) * 2.0;
  float band = exp(-bd * bd);
  float cloud = smoothstep(0.4, 0.85, n1) * (0.25 + 0.75 * band);

  vec3 blue = vec3(0.045, 0.085, 0.22);
  vec3 violet = vec3(0.12, 0.06, 0.21);
  vec3 dust = vec3(0.22, 0.115, 0.055);
  vec3 col = mix(blue, violet, smoothstep(0.3, 0.7, n2));
  col = mix(col, dust, smoothstep(0.3, 0.52, n1 * n2 * 1.9) * 0.45);
  col *= cloud * 0.6;

  // Deep navy base (matches the canvas clear colour).
  col += vec3(0.0010, 0.0016, 0.0036);
  gl_FragColor = vec4(max(col, 0.0), 1.0); // linear; encoded when displayed
}
`;

const SHOW_FRAG = /* glsl */ `
uniform samplerCube uMap;
varying vec3 vDir;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void main() {
  vec3 col = textureCube(uMap, normalize(vDir)).rgb;
  // A little dither against banding in the dark gradients.
  col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0 * 0.6;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <colorspace_fragment>
}
`;

/**
 * Soft fbm nebula on a camera-following back-side sphere, drawn before
 * everything else. The noise is static, so it is baked once into a half-float
 * cube map and then costs one texture lookup per pixel instead of several fbm
 * evaluations every frame.
 */
export function Nebula({ quality }: { quality: Quality }) {
  const mesh = useRef<THREE.Mesh>(null);
  const gl = useThree((s) => s.gl);
  const high = quality === "high";

  const baked = useMemo(() => {
    const target = new THREE.WebGLCubeRenderTarget(high ? 1024 : 512, {
      type: THREE.HalfFloatType,
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    const defines: Record<string, number | string> = { OCTAVES: high ? 4 : 3 };
    if (high) defines.HQ = "";
    const bakeMaterial = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      defines,
      side: THREE.BackSide,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.IcosahedronGeometry(1, 3);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, bakeMaterial));
    const camera = new THREE.CubeCamera(0.1, 10, target);
    camera.update(gl, scene);
    geometry.dispose();
    bakeMaterial.dispose();

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: SHOW_FRAG,
      uniforms: { uMap: { value: target.texture } },
      side: THREE.BackSide,
      depthTest: false,
      depthWrite: false,
    });
    return { target, material };
  }, [gl, high]);

  useEffect(
    () => () => {
      baked.target.dispose();
      baked.material.dispose();
    },
    [baked]
  );

  useFrame((state) => {
    if (mesh.current) mesh.current.position.copy(state.camera.position);
  });

  return (
    <mesh ref={mesh} material={baked.material} scale={1000} frustumCulled={false} renderOrder={-10}>
      <icosahedronGeometry args={[1, 3]} />
    </mesh>
  );
}
