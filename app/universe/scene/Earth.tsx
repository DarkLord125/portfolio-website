"use client";
import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Destination, Quality } from "../state/types";
import { SPHERE_VERT, starPosUniform } from "./glsl";
import { Atmosphere } from "./Atmosphere";
import { useDisposable } from "./useDisposable";

const TEX = {
  day: "/textures/earth/earth_atmos_2048.jpg",
  night: "/textures/earth/earth_lights_2048.png",
  spec: "/textures/earth/earth_specular_2048.jpg",
  normal: "/textures/earth/earth_normal_2048.jpg",
  clouds: "/textures/earth/earth_clouds_1024.png",
};

const SURFACE_FRAG = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uSpec;
uniform sampler2D uNormal;
uniform sampler2D uClouds;
uniform vec3 uStarPos;
uniform vec3 uAtmo;
uniform float uCloudShift;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
  vec3 Ng = normalize(vNormalW);
  vec3 N = Ng;
  #ifdef DETAIL
    vec3 T = normalize(vTangentW - Ng * dot(vTangentW, Ng));
    vec3 B = cross(Ng, T);
    vec3 nt = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
    N = normalize(T * nt.x * 0.9 + B * nt.y * 0.9 + Ng * nt.z);
  #endif
  vec3 L = normalize(uStarPos - vWorldPos);
  vec3 V = normalize(cameraPosition - vWorldPos);

  float ndlG = dot(Ng, L);
  float day = smoothstep(-0.1, 0.35, ndlG);
  float diff = max(dot(N, L), 0.0) * day;

  vec3 dayCol = texture2D(uDay, vUv).rgb;
  float ocean = texture2D(uSpec, vUv).r;

  #ifdef DETAIL
    // Soft shadow of the drifting cloud layer.
    float cs = texture2D(uClouds, vec2(vUv.x + uCloudShift - 0.003, vUv.y)).a;
    diff *= 1.0 - 0.4 * cs;
  #endif

  vec3 col = dayCol * (0.012 + 1.3 * diff);

  // Sun glint on the oceans: a tight highlight plus a wide soft sheen.
  vec3 H = normalize(L + V);
  float ndh = max(dot(N, H), 0.0);
  col += vec3(1.0, 0.94, 0.84) * ocean * day * (1.3 * pow(ndh, 110.0) + 0.14 * pow(ndh, 14.0));

  // City lights on the night side.
  float nightMask = 1.0 - smoothstep(-0.22, 0.08, ndlG);
  col += texture2D(uNight, vUv).rgb * vec3(1.0, 0.8, 0.52) * 1.15 * nightMask;

  // Atmospheric scattering: blue towards the limb, warm at the terminator.
  float fres = pow(1.0 - max(dot(Ng, V), 0.0), 3.2);
  float litRim = smoothstep(-0.15, 0.4, ndlG);
  col = mix(col, uAtmo * 0.9, fres * 0.7 * litRim);
  col += vec3(1.0, 0.42, 0.18) * 0.07 * smoothstep(0.28, 0.0, abs(ndlG)) * (0.3 + fres);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

const CLOUD_FRAG = /* glsl */ `
uniform sampler2D uClouds;
uniform vec3 uStarPos;
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(uStarPos - vWorldPos);
  float ndl = dot(N, L);
  float day = smoothstep(-0.15, 0.45, ndl);
  float a = texture2D(uClouds, vUv).a;
  vec3 col = vec3(0.012) + mix(vec3(1.0, 0.62, 0.42), vec3(1.0), smoothstep(0.0, 0.35, ndl)) * day * 1.05;
  gl_FragColor = vec4(col, a * 0.92);
  #include <colorspace_fragment>
}
`;

/**
 * The habitable world: textured day side with ocean glint and relief, city
 * lights at night, a separately drifting cloud layer and a blue limb.
 */
export function Earth({ dest, quality }: { dest: Destination; quality: Quality }) {
  const high = quality === "high";
  const seg = high ? 96 : 40;
  const spinRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const maps = useTexture(TEX);

  useLayoutEffect(() => {
    maps.day.colorSpace = THREE.SRGBColorSpace;
    maps.night.colorSpace = THREE.SRGBColorSpace;
    maps.spec.colorSpace = THREE.NoColorSpace;
    maps.normal.colorSpace = THREE.NoColorSpace;
    maps.clouds.colorSpace = THREE.NoColorSpace;
    maps.clouds.wrapS = THREE.RepeatWrapping;
    maps.day.anisotropy = 4;
    maps.clouds.anisotropy = 4;
    const all = [maps.day, maps.night, maps.spec, maps.normal, maps.clouds];
    for (let i = 0; i < all.length; i++) all[i].needsUpdate = true;
  }, [maps]);

  const surface = useDisposable(() => {
    const defines: Record<string, string> = {};
    if (high) defines.DETAIL = "";
    return new THREE.ShaderMaterial({
      vertexShader: SPHERE_VERT,
      fragmentShader: SURFACE_FRAG,
      uniforms: {
        uDay: { value: maps.day },
        uNight: { value: maps.night },
        uSpec: { value: maps.spec },
        uNormal: { value: maps.normal },
        uClouds: { value: maps.clouds },
        uStarPos: starPosUniform,
        uAtmo: { value: new THREE.Color(dest.palette.atmosphere) },
        uCloudShift: { value: 0 },
      },
      defines,
    });
  }, [maps, dest, high]);

  const clouds = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: CLOUD_FRAG,
        uniforms: { uClouds: { value: maps.clouds }, uStarPos: starPosUniform },
        transparent: true,
        depthWrite: false,
      }),
    [maps]
  );

  useFrame((_, dt) => {
    if (spinRef.current) spinRef.current.rotation.y += dt * 0.012;
    const c = cloudRef.current;
    if (c) {
      // Clouds drift a little faster than the ground turns.
      c.rotation.y = (c.rotation.y + dt * 0.006) % (Math.PI * 2);
      if (high) surface.uniforms.uCloudShift.value = -c.rotation.y / (Math.PI * 2);
    }
  });

  return (
    <group position={dest.position}>
      <group rotation={[0, 0, 0.41]}>
        <group ref={spinRef} rotation={[0, 2.2, 0]}>
          <mesh material={surface} scale={dest.radius}>
            <sphereGeometry args={[1, seg, seg / 2]} />
          </mesh>
          <mesh ref={cloudRef} material={clouds} scale={dest.radius * 1.012} renderOrder={1}>
            <sphereGeometry args={[1, seg, seg / 2]} />
          </mesh>
        </group>
      </group>
      <Atmosphere
        radius={dest.radius}
        color={dest.palette.atmosphere}
        thickness={1.17}
        intensity={1.25}
        segments={high ? 64 : 24}
      />
    </group>
  );
}

/** Shown while the Earth textures load. */
export function EarthFallback({ dest }: { dest: Destination }) {
  return (
    <mesh position={dest.position} scale={dest.radius}>
      <sphereGeometry args={[1, 24, 12]} />
      <meshBasicMaterial color="#0b1a33" />
    </mesh>
  );
}

useTexture.preload(Object.values(TEX));
