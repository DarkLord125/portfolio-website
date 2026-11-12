"use client";
import { Suspense } from "react";
import { DESTINATIONS, MOON_ORDER, PLANET_ORDER } from "../config/destinations";
import type { DestinationId, Quality } from "../state/types";
import { BodyInteraction } from "./BodyInteraction";
import { Constellation } from "./Constellation";
import { Earth, EarthFallback } from "./Earth";
import { ProceduralPlanet } from "./ProceduralPlanet";
import { StarChain } from "./StarChain";

const ALL: DestinationId[] = [...PLANET_ORDER, ...MOON_ORDER];

function Body({ id, quality }: { id: DestinationId; quality: Quality }) {
  const dest = DESTINATIONS[id];
  switch (dest.kind) {
    case "planet":
      return <ProceduralPlanet dest={dest} surface="rocky" quality={quality} tilt={0.3} spin={0.03} seed={3.1} />;
    case "gas-giant":
      return <ProceduralPlanet dest={dest} surface="gas" quality={quality} tilt={0.22} spin={0.045} seed={8.4} ring />;
    case "constellation":
      return <Constellation dest={dest} quality={quality} />;
    case "star-system":
      return <StarChain dest={dest} quality={quality} />;
    case "habitable":
      return (
        <Suspense fallback={<EarthFallback dest={dest} />}>
          <Earth dest={dest} quality={quality} />
        </Suspense>
      );
    case "moon":
      if (id === "dread")
        return <ProceduralPlanet dest={dest} surface="dread" quality={quality} tilt={0.1} spin={0.05} seed={1.7} />;
      if (id === "mythos")
        return <ProceduralPlanet dest={dest} surface="mythos" quality={quality} tilt={0.35} spin={0.04} seed={5.2} />;
      return <ProceduralPlanet dest={dest} surface="felt" quality={quality} tilt={0.18} spin={0.035} seed={2.6} />;
  }
}

/** One visual body and one hit target per entry in DESTINATIONS. */
export function Bodies({ quality }: { quality: Quality }) {
  return (
    <group>
      {ALL.map((id) => (
        <Body key={id} id={id} quality={quality} />
      ))}
      {ALL.map((id) => (
        <BodyInteraction key={id} dest={DESTINATIONS[id]} />
      ))}
    </group>
  );
}
