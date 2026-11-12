/**
 * Familiarity is stated as *where* a technology has been used, never as a
 * percentage or a self-rating:
 *   professional – used in client/production work at MND Technologies
 *   projects     – used in personal projects
 *   exploring    – an area of current interest and learning
 */
export type Familiarity = "professional" | "projects" | "exploring";

export const FAMILIARITY_LABEL: Record<Familiarity, string> = {
  professional: "Used in professional work",
  projects: "Used in personal projects",
  exploring: "Currently exploring",
};

export type SkillCategoryId = "frontend" | "backend" | "ai" | "tools";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategoryId;
  familiarity: Familiarity;
  note: string;
  usedIn: string[];
  /** Position inside the category's constellation, 0..1 on both axes. */
  x: number;
  y: number;
}

export interface SkillCategory {
  id: SkillCategoryId;
  name: string;
  color: string;
  /** Pairs of skill ids joined by a constellation line. */
  links: [string, string][];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "frontend",
    name: "Frontend",
    color: "#9fd0ff",
    links: [
      ["javascript", "typescript"],
      ["typescript", "react"],
      ["react", "nextjs"],
      ["react", "tailwind"],
    ],
  },
  {
    id: "backend",
    name: "Backend",
    color: "#ffc37a",
    links: [
      ["node", "express"],
      ["express", "rest"],
      ["node", "mongodb"],
      ["node", "postgres"],
    ],
  },
  {
    id: "ai",
    name: "AI Engineering",
    color: "#c9b3ff",
    links: [
      ["llm", "anthropic-sdk"],
      ["llm", "rag"],
      ["anthropic-sdk", "agents"],
      ["agents", "mcp"],
    ],
  },
  {
    id: "tools",
    name: "Tools & Infrastructure",
    color: "#9fe0c0",
    links: [
      ["git", "github"],
      ["github", "docker"],
      ["cursor", "claude-code"],
      ["git", "cursor"],
    ],
  },
];

export const SKILLS: Skill[] = [
  // Frontend
  {
    id: "react",
    name: "React",
    category: "frontend",
    familiarity: "professional",
    note: "The UI layer for nearly everything I build, at work and in my own projects.",
    usedIn: ["JForJobs", "Quartz", "AgentOps", "DREAD", "MYTHOS", "Royal Flush"],
    x: 0.5,
    y: 0.45,
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend",
    familiarity: "professional",
    note: "My default framework for web apps since my internship.",
    usedIn: ["JForJobs", "Quartz", "AgentOps", "Vision Cure", "MYTHOS", "Royal Flush"],
    x: 0.78,
    y: 0.22,
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "frontend",
    familiarity: "professional",
    note: "Used across frontend, backend and game logic.",
    usedIn: ["DREAD", "MYTHOS", "Royal Flush", "Client work at MND"],
    x: 0.26,
    y: 0.26,
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "frontend",
    familiarity: "professional",
    note: "Where I started; still the base under everything else.",
    usedIn: ["MusicTune", "Client work at MND"],
    x: 0.1,
    y: 0.58,
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "frontend",
    familiarity: "professional",
    note: "How I style most interfaces.",
    usedIn: ["JForJobs", "AgentOps", "TechTailz", "MYTHOS", "Royal Flush", "DREAD"],
    x: 0.68,
    y: 0.78,
  },
  // Backend
  {
    id: "node",
    name: "Node.js",
    category: "backend",
    familiarity: "professional",
    note: "Runtime for the APIs and game servers I write.",
    usedIn: ["Quartz", "Resume builder", "DREAD server", "Royal Flush server"],
    x: 0.48,
    y: 0.5,
  },
  {
    id: "express",
    name: "Express",
    category: "backend",
    familiarity: "professional",
    note: "REST services at work and the HTTP layer of my game servers.",
    usedIn: ["Resume builder", "Royal Flush", "DREAD"],
    x: 0.74,
    y: 0.28,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "backend",
    familiarity: "professional",
    note: "Document storage on production client projects.",
    usedIn: ["Quartz", "Resume builder"],
    x: 0.2,
    y: 0.24,
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "backend",
    familiarity: "professional",
    note: "Relational data at work and, through Prisma, in Royal Flush.",
    usedIn: ["Vision Cure", "Royal Flush"],
    x: 0.24,
    y: 0.8,
  },
  {
    id: "rest",
    name: "REST APIs",
    category: "backend",
    familiarity: "professional",
    note: "Designing and consuming HTTP APIs is part of most of my work.",
    usedIn: ["Vision Cure", "Resume builder", "Royal Flush"],
    x: 0.9,
    y: 0.62,
  },
  // AI Engineering
  {
    id: "llm",
    name: "LLM integrations",
    category: "ai",
    familiarity: "exploring",
    note: "Wiring language models into applications.",
    usedIn: [],
    x: 0.48,
    y: 0.5,
  },
  {
    id: "anthropic-sdk",
    name: "Anthropic SDK",
    category: "ai",
    familiarity: "exploring",
    note: "Building against the Claude API.",
    usedIn: [],
    x: 0.72,
    y: 0.26,
  },
  {
    id: "rag",
    name: "RAG",
    category: "ai",
    familiarity: "exploring",
    note: "Retrieval-augmented generation.",
    usedIn: [],
    x: 0.2,
    y: 0.3,
  },
  {
    id: "agents",
    name: "AI Agents",
    category: "ai",
    familiarity: "exploring",
    note: "Tool-using agents and multi-step workflows.",
    usedIn: [],
    x: 0.86,
    y: 0.6,
  },
  {
    id: "mcp",
    name: "MCP",
    category: "ai",
    familiarity: "exploring",
    note: "Model Context Protocol for connecting models to tools and data.",
    usedIn: [],
    x: 0.6,
    y: 0.84,
  },
  // Tools
  {
    id: "git",
    name: "Git",
    category: "tools",
    familiarity: "professional",
    note: "Daily version control.",
    usedIn: ["Everything"],
    x: 0.3,
    y: 0.34,
  },
  {
    id: "github",
    name: "GitHub",
    category: "tools",
    familiarity: "professional",
    note: "Hosting, review and collaboration.",
    usedIn: ["Client work at MND", "All personal projects"],
    x: 0.58,
    y: 0.2,
  },
  {
    id: "docker",
    name: "Docker",
    category: "tools",
    familiarity: "projects",
    note: "Local infrastructure such as PostgreSQL and Redis via Compose.",
    usedIn: ["Royal Flush"],
    x: 0.86,
    y: 0.4,
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "tools",
    familiarity: "projects",
    note: "AI-assisted editor in my development workflow.",
    usedIn: [],
    x: 0.22,
    y: 0.72,
  },
  {
    id: "claude-code",
    name: "Claude Code",
    category: "tools",
    familiarity: "projects",
    note: "Agentic coding in the terminal, used on my recent game projects.",
    usedIn: ["MYTHOS", "Royal Flush", "DREAD"],
    x: 0.56,
    y: 0.82,
  },
];
