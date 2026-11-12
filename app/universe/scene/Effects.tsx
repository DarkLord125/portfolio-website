"use client";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

/**
 * High-quality post-processing only. The bloom threshold sits at 1.0 in the
 * linear HDR buffer, so only over-bright sources (the star, engine exhaust,
 * the brightest stars) bloom; planets stay crisp.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={2}>
      <Bloom mipmapBlur intensity={0.55} radius={0.7} luminanceThreshold={1} luminanceSmoothing={0.2} />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}
