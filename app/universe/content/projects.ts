import type { MoonId } from "../state/types";

/**
 * Project facts are taken from each project's own repository (README + docs).
 * Do not add capabilities, numbers or claims that are not in those repos.
 */
export interface ProjectMedia {
  type: "image" | "video";
  /** Path under /public, e.g. /images/projects/dread/01.webp */
  src: string;
  alt: string;
}

export interface Project {
  id: MoonId;
  title: string;
  subtitle: string;
  summary: string;
  highlights: string[];
  tech: string[];
  challenges: { title: string; detail: string }[];
  /** Empty until real screenshots are added to /public/images/projects/<id>/ */
  media: ProjectMedia[];
  githubUrl: string;
  /** Leave undefined when there is no public deployment. */
  liveUrl?: string;
  status?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "dread",
    title: "DREAD",
    subtitle: "Multiplayer survival horror",
    summary:
      "A first-person survival horror game that runs in the browser. Pick an expedition, read the briefing, go in, get out. Each expedition is generated from a seed, so the objective, the hazards, what is hunting you and the way out change between runs.",
    highlights: [
      "Seven locations, from an asylum and a prison to an arctic research station and a hotel",
      "Eight creatures that hunt differently: by sound, by light, or only when you are not looking",
      "Seeded expeditions with one primary objective and up to three optional ones",
      "4-player online co-op with rooms, invite codes, downed/revive and timed extraction",
      "Runs last about 10–20 minutes",
    ],
    tech: [
      "TypeScript",
      "React",
      "Three.js",
      "React Three Fiber",
      "Drei",
      "Rapier",
      "Zustand",
      "Howler / Web Audio",
      "Colyseus",
      "Node.js",
      "Express",
      "Vite",
      "Tailwind CSS",
    ],
    challenges: [
      {
        title: "Turning a single-player game into co-op",
        detail:
          "The game was built with one flat store and one player runtime. Co-op meant splitting world, per-player and local UI state, then running the real game logic headless on the server: a Colyseus room per expedition with one worker thread per match.",
      },
      {
        title: "Holding frame rate on integrated graphics",
        detail:
          "Performance work is measured on a low-end integrated GPU: KTX2 textures, per-instance prop culling, adaptive resolution, shader warm-up and lazily loaded audio packs.",
      },
      {
        title: "Runs that differ on the same map",
        detail:
          "Objectives, side objectives, creatures, hazards and extraction are all derived from a seed, so every expedition is reproducible but no two play the same.",
      },
    ],
    media: [],
    githubUrl: "https://github.com/DarkLord125/dread",
    status: "Single-player on main · co-op on the dread-multiplayer branch",
  },
  {
    id: "mythos",
    title: "MYTHOS",
    subtitle: "Ancient Wars",
    summary:
      "A browser-based, turn-based tactical strategy game. Command a small army from one of seven ancient civilizations on an 8×8 isometric battlefield. It can be learned in minutes, a match lasts 5–10, and it runs on desktop and mobile with no install and no account.",
    highlights: [
      "Seven civilizations: Indian, Greek, Persian, Roman, Egyptian, Norse and Mesopotamian",
      "Four unit classes with soft counters, facing, flanking and per-unit stances",
      "Terrain that matters: forests conceal, hills extend range, rivers block, forts protect",
      "AI opponents at Easy, Medium and Hard, plus Pass & Play on one device",
      "Post-battle analysis that reviews every move like a chess analysis board",
    ],
    tech: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Vitest"],
    challenges: [
      {
        title: "One engine decides what is legal",
        detail:
          "The UI and the AI both submit actions through a single applyAction(state, action) function and never decide legality themselves, which keeps rules, AI and interface from drifting apart.",
      },
      {
        title: "Deterministic combat",
        detail:
          "There are no dice. Tapping an enemy shows exactly what an attack will do, with every modifier itemised, and battles can be replayed and analysed move by move.",
      },
      {
        title: "An isometric battlefield without image assets",
        detail:
          "The board, terrain and per-civilization unit sprites with their animations are drawn in code over the logical grid, with free camera rotation, pinch zoom and touch-first controls.",
      },
    ],
    media: [],
    githubUrl: "https://github.com/DarkLord125/mythos",
  },
  {
    id: "royal-flush",
    title: "ROYAL FLUSH",
    subtitle: "Poker platform",
    summary:
      "A browser-based, real-time multiplayer Texas Hold'em room. Players open public or private tables, invite friends with a link and play in real time, or sit down at a practice table against AI bots. Virtual chips only, with no monetary value.",
    highlights: [
      "Real-time tables over Socket.IO with reconnection",
      "AI bots at three difficulty levels for practice tables",
      "A pure TypeScript poker engine with zero runtime dependencies",
      "Public and private tables with invite links",
      "Unit, integration and Playwright end-to-end tests",
    ],
    tech: [
      "TypeScript",
      "Next.js",
      "React",
      "Tailwind CSS",
      "Zustand",
      "Node.js",
      "Express",
      "Socket.IO",
      "Prisma",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Vitest",
      "Playwright",
    ],
    challenges: [
      {
        title: "A poker engine with no I/O",
        detail:
          "Rules of play, pots and hand evaluation live in a standalone package the server drives. Humans and bots act through the same engine path.",
      },
      {
        title: "Live table state and recovery",
        detail:
          "Each table has its own runtime on the server, with snapshots and an action log so a table can recover and players can reconnect mid-hand.",
      },
      {
        title: "Bots that play at different levels",
        detail:
          "Easy uses coarse hand strength, Medium uses Monte Carlo equity against pot odds, and Advanced narrows opponent ranges from their betting and uses position, implied odds and bluffs.",
      },
    ],
    media: [],
    githubUrl: "https://github.com/DarkLord125/royal-flush",
  },
];

export const getProject = (id: MoonId) => PROJECTS.find((p) => p.id === id)!;

/** Earlier work carried over from the previous portfolio. */
export const ARCHIVE_PROJECTS = [
  {
    title: "MusicTune",
    description:
      "A music streaming web player where you can search for songs and listen to your favourites.",
    image: "/images/projects/music-tune.png",
    githubUrl: "https://github.com/DarkLord125/MusicTune",
  },
  {
    title: "Attend Now",
    description:
      "An online attendance management system that uses facial recognition to track student attendance.",
    image: "/images/projects/attend-now.png",
    githubUrl: "https://github.com/DarkLord125/AtttendNow",
  },
  {
    title: "Society Management System",
    description:
      "A web portal to manage society residents, staff, visitors, billing, online payment and documents.",
    image: "/images/projects/society-management-system.png",
    githubUrl: "https://github.com/DarkLord125/Society-Management-System",
  },
  {
    title: "BooksHive",
    description:
      "A bookstore app where users can browse books across genres and ratings and purchase them.",
    image: "/images/projects/BooksHive.jpg",
    githubUrl: "https://github.com/DarkLord125/BooksHive",
  },
];
