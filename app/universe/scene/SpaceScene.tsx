"use client";
import { Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useUniverse } from "../state/store";
import { Bodies } from "./Bodies";
import { CentralStar } from "./CentralStar";
import { Effects } from "./Effects";
import { timeUniform } from "./glsl";
import { Nebula } from "./Nebula";
import { OrbitRings } from "./OrbitRings";
import { Ship } from "./Ship";
import { Starfield } from "./Starfield";

/** Advances the one time uniform every scene shader shares. */
function SceneClock() {
  useFrame((state) => {
    timeUniform.value = state.clock.elapsedTime;
  });
  return null;
}

/**
 * Everything rendered inside the canvas. Reads navigation state only to gate
 * clicks, never moves the camera, never writes to `rig`.
 */
export function SpaceScene() {
  const quality = useUniverse((s) => s.quality);

  return (
    <>
      <SceneClock />
      <ambientLight intensity={0.3} color="#8fa6d6" />

      <Nebula quality={quality} />
      <Starfield quality={quality} />
      <CentralStar quality={quality} />
      <OrbitRings quality={quality} />
      <Bodies quality={quality} />

      <Suspense fallback={null}>
        <Ship />
      </Suspense>

      {quality === "high" && <Effects />}
    </>
  );
}
