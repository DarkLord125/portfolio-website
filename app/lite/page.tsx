import type { Metadata } from "next";
import { FallbackPortfolio } from "../universe/fallback/FallbackPortfolio";

export const metadata: Metadata = {
  title: "Ashwin Nair — Software Engineer (text version)",
};

/** Plain, fast, fully accessible version of the portfolio. No WebGL. */
export default function LitePage() {
  return <FallbackPortfolio reason="chosen" />;
}
