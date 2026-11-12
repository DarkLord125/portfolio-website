"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { HUB } from "./config/destinations";
import { storedQuality } from "./lib/capabilities";
import { useUniverse } from "./state/store";
import { SpaceScene } from "./scene/SpaceScene";
import { FlightDirector } from "./flight/FlightDirector";

/**
 * The one and only <Canvas>. Scene content comes from scene/, all motion of
 * the ship and camera comes from flight/. Loaded with ssr:false by Universe.
 */
export default function SpaceCanvas() {
  const quality = useUniverse((s) => s.quality);
  const setQuality = useUniverse((s) => s.setQuality);

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={quality === "high" ? [1, 1.75] : [0.75, 1]}
      gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
      camera={{
        fov: 50,
        near: 0.1,
        far: 4000,
        position: [
          HUB.shipPosition[0] + 4,
          HUB.shipPosition[1] + 2.5,
          HUB.shipPosition[2] + 11,
        ],
      }}
    >
      <color attach="background" args={["#03050b"]} />
      {/* Sustained low frame rate on the full scene: drop to reduced effects once. */}
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => {
          // Never override a choice the visitor made with the Effects toggle.
          if (quality === "high" && storedQuality() === null) setQuality("low");
        }}
      />
      <Suspense fallback={null}>
        <SpaceScene />
      </Suspense>
      <FlightDirector />
    </Canvas>
  );
}
