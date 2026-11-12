"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { rig } from "../state/rig";
import { timeUniform } from "./glsl";
import { createGlowMaterial } from "./Glow";
import { useDisposable } from "./useDisposable";

const SHIP_URL = "/models/ship.glb";
/** Nose-to-tail length in world units. */
const SHIP_LENGTH = 2.4;

/**
 * Engine nozzle centres in the model's own coordinates (the GLB's nose points
 * along +Z, so the nozzles are at -Z and the exhaust extends towards -Z).
 */
const NOZZLES: [number, number, number][] = [
  [1.22, 0.45, -3.95],
  [-1.22, 0.45, -3.95],
];
const EXHAUST_LENGTH = 5.2;
const EXHAUST_RADIUS = 0.42;

const EXHAUST_VERT = /* glsl */ `
varying vec2 vUv;
varying float vFacing;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}
`;

const EXHAUST_FRAG = /* glsl */ `
uniform float uPower;
uniform float uTime;
varying vec2 vUv;
varying float vFacing;
void main() {
  float t = vUv.y; // 0 at the nozzle, 1 at the tip
  float a = pow(1.0 - t, 1.7);
  float flicker = 0.92 + 0.08 * sin(uTime * 38.0 + t * 26.0);
  vec3 col = mix(vec3(0.18, 0.45, 1.0), vec3(0.8, 0.93, 1.0), a * a);
  float soft = 0.35 + 0.65 * vFacing;
  gl_FragColor = vec4(col * a * soft * flicker * (0.35 + 2.4 * uPower), 1.0);
  #include <colorspace_fragment>
}
`;

/** Re-skin the palette-atlas material: pearl hull, gunmetal trim, glossy dark glass. */
function tuneMaterial(m: THREE.MeshStandardMaterial) {
  if (m.userData.universeTuned) return;
  m.userData.universeTuned = true;
  m.metalness = 0.35;
  m.roughness = 0.48;
  m.toneMapped = false;
  if (m.map) {
    // Flat colour swatches: no filtering, so neighbouring swatches never bleed.
    m.map.magFilter = THREE.NearestFilter;
    m.map.minFilter = THREE.NearestFilter;
    m.map.generateMipmaps = false;
    m.map.needsUpdate = true;
  }
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <map_fragment>",
        /* glsl */ `#include <map_fragment>
        float shipLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
        float shipSat = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b))
                      - min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
        float shipHull = smoothstep(0.08, 0.25, shipSat);
        vec3 shipTrim = vec3(0.03, 0.035, 0.045) + shipLum * vec3(0.3, 0.33, 0.4);
        vec3 shipPaint = vec3(0.6, 0.64, 0.7) * (0.55 + 0.9 * shipLum);
        diffuseColor.rgb = mix(shipTrim, shipPaint, shipHull);`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        /* glsl */ `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.26, roughnessFactor, shipHull);`
      );
  };
  m.customProgramCacheKey = () => "universe-ship-hull";
  m.needsUpdate = true;
}

/**
 * The player's ship. Pose comes from `rig` every frame (nose along local -Z);
 * engine glow and exhaust follow `rig.thrust`. Model: see public/CREDITS.md.
 */
export function Ship() {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const exhaustA = useRef<THREE.Mesh>(null);
  const exhaustB = useRef<THREE.Mesh>(null);
  const engineLight = useRef<THREE.PointLight>(null);
  const thrust = useRef(0);

  const { scene } = useGLTF(SHIP_URL);

  const fit = useMemo(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (let i = 0; i < mats.length; i++) {
        const m = mats[i] as THREE.MeshStandardMaterial;
        if (m.isMeshStandardMaterial) tuneMaterial(m);
      }
    });
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return { scale: SHIP_LENGTH / size.z, center };
  }, [scene]);

  const exhaustGeo = useDisposable(() => {
    const g = new THREE.ConeGeometry(EXHAUST_RADIUS, EXHAUST_LENGTH, 20, 1, true);
    // Base at the origin, tip pointing along model -Z (backwards).
    g.translate(0, EXHAUST_LENGTH / 2, 0);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  const exhaustMat = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: EXHAUST_VERT,
        fragmentShader: EXHAUST_FRAG,
        uniforms: { uPower: { value: 0 }, uTime: timeUniform },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const nozzleGlow = useDisposable(() => createGlowMaterial("#8cc4ff", 2.6, 0.5, 4.5), []);
  const nozzleCore = useDisposable(
    () => new THREE.MeshBasicMaterial({ color: "#9fd0ff", toneMapped: false }),
    []
  );

  useFrame((state, dt) => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    o.position.copy(rig.shipPosition);
    o.quaternion.copy(rig.shipQuaternion);

    // Smooth the engine response so glow never pops.
    const target = THREE.MathUtils.clamp(rig.thrust, 0, 1);
    thrust.current += (target - thrust.current) * Math.min(1, dt * 7);
    const th = thrust.current;

    // Idle drift, calmer under power.
    const t = state.clock.elapsedTime;
    const calm = 1 - 0.75 * th;
    i.position.y = Math.sin(t * 0.9) * 0.035 * calm;
    i.rotation.z = Math.sin(t * 0.55) * 0.028 * calm;
    i.rotation.x = Math.sin(t * 0.7 + 1.3) * 0.012 * calm;

    const len = 0.16 + 1.15 * th;
    const wide = 0.8 + 0.35 * th;
    if (exhaustA.current) exhaustA.current.scale.set(wide, wide, len);
    if (exhaustB.current) exhaustB.current.scale.set(wide, wide, len);
    exhaustMat.uniforms.uPower.value = th;
    nozzleGlow.uniforms.uIntensity.value = 0.35 + 2.2 * th;
    nozzleGlow.uniforms.uSize.value = (2.2 + 2.6 * th) * fit.scale;
    const core = 1.1 + 3.4 * th;
    nozzleCore.color.setRGB(0.5 * core, 0.78 * core, 1.0 * core);
    if (engineLight.current) engineLight.current.intensity = 2 + 30 * th;
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {/* Model space: scaled to SHIP_LENGTH and turned so the nose points along -Z. */}
        <group scale={fit.scale} rotation={[0, Math.PI, 0]}>
          <group position={[-fit.center.x, -fit.center.y, -fit.center.z]}>
            <primitive object={scene} />
            {NOZZLES.map((p, k) => (
              <group key={k} position={p}>
                <mesh ref={k === 0 ? exhaustA : exhaustB} geometry={exhaustGeo} material={exhaustMat} />
                <mesh material={nozzleCore} scale={[0.34, 0.34, 0.12]}>
                  <sphereGeometry args={[1, 12, 8]} />
                </mesh>
                <mesh material={nozzleGlow} frustumCulled={false} renderOrder={3}>
                  <planeGeometry args={[1, 1]} />
                </mesh>
              </group>
            ))}
          </group>
        </group>

        {/* Lights that travel with the ship: cool rim from above-behind, faint warm fill, engine wash. */}
        <pointLight position={[-2.2, 2.4, 3.2]} color="#a9c8ff" intensity={42} distance={14} decay={2} />
        <pointLight position={[2.6, -1.2, -1.5]} color="#ffd9b0" intensity={12} distance={12} decay={2} />
        <pointLight ref={engineLight} position={[0, 0.1, 1.9]} color="#6fb0ff" intensity={2} distance={7} decay={2} />
      </group>
    </group>
  );
}

if (typeof window !== "undefined") useGLTF.preload(SHIP_URL);
