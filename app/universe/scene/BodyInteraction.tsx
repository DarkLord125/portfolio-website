"use client";
import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { isMoon } from "../config/destinations";
import { useUniverse } from "../state/store";
import type { Destination, DestinationId, Phase } from "../state/types";

function canInteract(id: DestinationId, phase: Phase, location: DestinationId | null) {
  if (phase === "intro" || phase === "launching" || phase === "travelling") return false;
  // Moons can only be picked from within the projects system.
  if (isMoon(id)) return location === "projects" || (location !== null && isMoon(location));
  return true;
}

/**
 * Invisible, slightly oversized hit sphere for one destination, plus the
 * hover ring. Click -> travelTo(id). Nothing else leaves the canvas.
 */
export function BodyInteraction({ dest }: { dest: Destination }) {
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const phase = useUniverse((s) => s.phase);
  const location = useUniverse((s) => s.location);

  const interactive = canInteract(dest.id, phase, location);
  const active = hovered && interactive;
  const moon = dest.kind === "moon";
  const hitRadius = dest.radius * (moon ? 1.9 : 1.25);
  const ringRadius = dest.radius * (moon ? 1.6 : 1.32);

  useEffect(() => {
    if (!active) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [active]);

  useFrame((state) => {
    const r = ring.current;
    if (r && r.visible) r.quaternion.copy(state.camera.quaternion);
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const onOut = () => setHovered(false);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const s = useUniverse.getState();
    if (!canInteract(dest.id, s.phase, s.location)) return;
    e.stopPropagation();
    // A drag (e.g. looking around) is not a click.
    if (e.delta > 8) return;
    s.travelTo(dest.id);
  };

  return (
    <group position={dest.position}>
      <mesh scale={hitRadius} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <mesh ref={ring} visible={active} scale={ringRadius} renderOrder={4}>
        <ringGeometry args={[1, 1.03, 96]} />
        <meshBasicMaterial
          color="#bcdcff"
          transparent
          opacity={0.6}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
