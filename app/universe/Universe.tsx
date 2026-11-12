"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { detectQuality, hasWebGL, storedQuality } from "./lib/capabilities";
import { useUniverse } from "./state/store";
import { Hud } from "./hud/Hud";
import { PanelHost } from "./panels/PanelHost";
import { FallbackPortfolio } from "./fallback/FallbackPortfolio";

const SpaceCanvas = dynamic(() => import("./SpaceCanvas"), { ssr: false });

type Mode = "checking" | "space" | "fallback";

export function Universe() {
  const [mode, setMode] = useState<Mode>("checking");

  useEffect(() => {
    if (!hasWebGL()) {
      setMode("fallback");
      return;
    }
    useUniverse.getState().setQuality(storedQuality() ?? detectQuality());
    setMode("space");
  }, []);

  if (mode === "fallback") return <FallbackPortfolio reason="no-webgl" />;

  return (
    <main className="fixed inset-0 overflow-hidden bg-space-950 text-slate-100">
      {mode === "space" && (
        <>
          <SpaceCanvas />
          <Hud />
          <PanelHost />
        </>
      )}
      <Toaster position="top-center" />
    </main>
  );
}
