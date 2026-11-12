export interface Milestone {
  id: string;
  kind: "education" | "research" | "internship" | "role" | "engagement";
  organization: string;
  role: string;
  period: string;
  /** Short label under the star, e.g. "2020" */
  marker: string;
  summary: string;
  contributions: string[];
  tech: string[];
  logo?: string;
  /** Hidden everywhere while false. */
  disclosed: boolean;
}

/** Oldest first: the journey reads left to right / inner to outer. */
export const MILESTONES: Milestone[] = [
  {
    id: "btech",
    kind: "education",
    organization: "KJ Somaiya College of Engineering",
    role: "B.Tech, Computer Science",
    period: "2020 – 2024",
    marker: "2020",
    summary: "Undergraduate degree in computer science.",
    contributions: [],
    tech: [],
    logo: "/images/experience/kjsce-logo.png",
    disclosed: true,
  },
  {
    id: "research",
    kind: "research",
    organization: "KJ Somaiya College of Engineering",
    role: "Research Intern",
    period: "Sep 2022 – Jun 2023",
    marker: "2022",
    summary: "Computer-vision research on drone footage of forests.",
    contributions: [
      "Used the Track Anything library to perform precise video segmentation on drone-captured forest footage.",
      "Published the 'Dronescape' dataset, a high-resolution drone footage dataset for tree region segmentation, on IEEE DataPort.",
    ],
    tech: ["Python", "Track Anything", "Video segmentation"],
    logo: "/images/experience/kjsce-logo.png",
    disclosed: true,
  },
  {
    id: "mnd-intern",
    kind: "internship",
    organization: "MND Technologies Pvt Ltd",
    role: "Software Engineer Intern",
    period: "Jun 2023 – Jun 2024",
    marker: "2023",
    summary: "First professional engineering work, across frontend and backend on client products.",
    contributions: [
      "Built full-stack components for a resume builder web app using Next.js, Express.js and MongoDB.",
      "Developed UI components for TechTailz, a SaaS platform for pet care services, using Next.js, Tailwind CSS and Ant Design.",
      "Contributed to frontend and backend development for Vision Cure, an ophthalmic device company, using Next.js, NestJS and PostgreSQL to streamline test and doctor management.",
      "Used Git, GitHub and Bitbucket for version control and collaborative development.",
    ],
    tech: ["Next.js", "Express.js", "NestJS", "MongoDB", "PostgreSQL", "Tailwind CSS", "Ant Design"],
    logo: "/images/experience/my_next_developer_logo.jpg",
    disclosed: true,
  },
  {
    id: "mnd",
    kind: "role",
    organization: "MND Technologies Pvt Ltd",
    role: "Software Developer",
    period: "Jul 2024 – Present",
    marker: "2024",
    summary: "Full-stack engineering on production applications.",
    contributions: [
      "Designed and developed responsive UI components for JForJobs, a recruitment platform, using Next.js and Tailwind CSS.",
      "Engineered both the frontend and backend of Quartz, a real-time educational live streaming platform, using Next.js, LiveKit, MongoDB and AWS.",
      "Redesigned and modernized the frontend of AgentOps using Next.js and Tailwind CSS.",
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "LiveKit", "MongoDB", "AWS"],
    logo: "/images/experience/my_next_developer_logo.jpg",
    disclosed: true,
  },
  {
    // TODO(ashwin): fill in and set disclosed: true once you are cleared to
    // describe this work publicly. It is hidden from the site until then.
    id: "reach-pathways",
    kind: "engagement",
    organization: "Reach Pathways",
    role: "",
    period: "",
    marker: "Now",
    summary: "",
    contributions: [],
    tech: [],
    disclosed: false,
  },
];

export const VISIBLE_MILESTONES = MILESTONES.filter((m) => m.disclosed);
