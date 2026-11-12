# AGENTS.md — Ashwin's Universe

Rules for anyone (human or AI) changing this repository. Read this first.

## What this is

A developer portfolio presented as a space exploration experience: a ship flies
between planets, each planet holds one part of the portfolio. Next.js 14 (App
Router), React 18, TypeScript (strict), Tailwind CSS 3, Three.js through React
Three Fiber 8 and Drei 9, GSAP for flight timelines, Zustand for state.

Versions are pinned to the React 18 line: `@react-three/fiber@8`, `@react-three/drei@9`,
`@react-three/postprocessing@2`. Do not upgrade them without upgrading React and Next.

## Layout and ownership

```
app/
  page.tsx                 renders <Universe/>
  lite/page.tsx            text version (FallbackPortfolio), no WebGL
  api/send/route.ts        contact form endpoint (nodemailer)
  universe/
    Universe.tsx           capability check, mounts canvas + DOM layers
    SpaceCanvas.tsx        the only <Canvas>
    state/                 types.ts, store.ts (navigation state machine), rig.ts (per-frame flight state)
    config/destinations.ts positions, radii, palettes of every body  ← single source of truth
    content/               portfolio data: profile, projects, skills, career (pure data, no JSX)
    lib/                   capabilities.ts and other framework-free helpers
    scene/                 everything rendered inside the canvas (stars, nebula, star, planets, moons, ship, effects)
    flight/                FlightDirector: ship + camera motion, GSAP timelines
    hud/                   DOM overlay: intro, HUD bar, galaxy map, destination list, skip, mobile nav
    panels/                DOM content panels shown in orbit, one per destination
    fallback/              FallbackPortfolio: plain accessible page built from content/
public/
  models/ textures/        3D assets; every file is listed in public/CREDITS.md
```

Each folder has one job. Do not reach across:

- `scene/` never changes navigation state except by calling `travelTo(id)` when a body is clicked. It never moves the camera.
- `flight/` is the only writer of `rig` and the only code that moves the camera. It is the only caller of `launchComplete()` and `arrive()`.
- `hud/` and `panels/` are DOM only: no three.js imports. They call store actions; they never animate the ship.
- `content/` holds facts. Components render it; they do not hardcode portfolio text.
- Positions and sizes come from `config/destinations.ts`. Never hardcode a planet position anywhere else.

## Navigation state machine (`state/store.ts`)

```
intro --beginExploration--> launching --launchComplete--> galaxy
galaxy | orbit --travelTo(id)--> travelling --arrive--> orbit
orbit --leaveOrbit--> galaxy          ship stays parked at `location`
any --jumpTo(id)--> orbit             instant, for "skip" and direct links
launching | travelling --skip()--> the running timeline is fast-forwarded
```

`location === null` means the ship is at the hub. Moons (`dread`, `mythos`,
`royal-flush`) are destinations whose `parent` is `projects`.

Two kinds of state, never mixed:

- **Zustand store**: low-frequency, drives React (phase, location, target, quality).
- **`rig`**: mutable, read and written every frame, never causes a render.

Inside `useFrame`, read the store with `useUniverse.getState()`, not hooks, and never call `setState`.

## DOM layout zones

Canvas fills the viewport. HUD and panels share it without overlapping:

- Top bar: height `var(--hud-top)`.
- Desktop (≥ md): galaxy map bottom-left; content panel docked right, `top: calc(var(--hud-top) + 16px)`, width `min(560px, 46vw)`. In orbit the camera frames the planet left of centre.
- Mobile (< md): bottom nav bar of height `var(--hud-bottom)`; content panel is a bottom sheet above it, max ~68vh, scrolls inside. The camera frames the planet in the upper third.
- z-index: canvas 0, HUD 20, panels 30, intro overlay 40, toasts above.

## Visual rules

- Palette: `space-*` surfaces, `ice` for lines/focus/links, `ember` for the primary action and "you are here". No other accent colours in the UI; planet colours live in `destinations.ts` palettes.
- Type: `font-display` (Space Grotesk) for titles, `font-body` (Inter) for prose, `font-mono` (JetBrains Mono) for HUD data. Use `.hud-label`, `.hud-value`, `.hud-surface`, `.focus-ring` from `globals.css`.
- Restraint over spectacle: no neon, no glow on text, nothing pulsing forever in the HUD. Motion happens when the user travels; otherwise the scene idles slowly.
- Keep the exploration screen nearly text-free. Detail belongs in panels.

## Performance rules

- Two quality tiers from `useUniverse(s => s.quality)`: `high` and `low` (reduced effects). `low` must disable post-processing, cut particle counts by at least half, and use lower segment counts. Everything must still be usable in `low`.
- No per-frame allocations in `useFrame` (reuse vectors/quaternions at module scope).
- Stars and particles are single `Points` / instanced draws, never one mesh per star.
- Dispose what you create by hand (geometries, materials, textures, render targets) on unmount.
- Honour `prefers-reduced-motion`: travel becomes a short fade/jump instead of a long flight.
- Textures ≤ 2048px, models ≤ ~1.5 MB each, Draco/meshopt or already-small GLB. Lazy-load anything only one destination needs.

## Assets and licences

Only CC0, CC-BY (with attribution) or MIT/Apache assets. Every third-party file
added under `public/` gets a row in `public/CREDITS.md`: file, source URL,
author, licence. No asset without a row.

## Content rules

- Do not invent project features, numbers, achievements or proficiency levels. Project facts come from the project repositories; skill familiarity states where a technology was used, not a rating.
- `content/career.ts` entries with `disclosed: false` must not render anywhere.
- Project screenshots go in `public/images/projects/<id>/` and are listed in `content/projects.ts` `media`. Panels must look complete when `media` is empty.

## Accessibility

- Every destination is reachable by keyboard from the HUD destination list; nothing is reachable only by clicking a 3D object.
- Skip is always available during `launching` and `travelling` (button and Esc/Space).
- The `/lite` page presents all content without WebGL and is linked from the HUD.

## Commands

```bash
npm run dev
```

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

```bash
npm run build
```

Contact form needs `BURNER_EMAIL`, `BURNER_PASSWORD` and `EMAIL` in `.env.local`.
`NEXT_PUBLIC_CONTACT_EMAIL` is optional and, when set, is shown publicly as a mailto link.
