import { Timeline } from "./Timeline";

export interface ExperienceItemsProps {
  id: number;
  title: string;
  location: string;
  description: string[];
  date: string;
  logo: string;
}

export const ExperienceSection = () => {
  const items: ExperienceItemsProps[] = [
    {
      id: 1,
      title: "Software Engineer",
      location: "MND Technologies Pvt Ltd",
      date: "Jul 2024 - Present",
      description: [
        "Designed and developed responsive UI components for JForJobs, a recruitment platform, using Next.js and Tailwind CSS.",
        "Engineered both the frontend and backend of Quartz, a real-time educational live streaming platform, leveraging Next.js, Livekit, MongodDb and AWS for scalable performance and maintainability.",
        "Redesigned and modernized the frontend of AgentOps using Next.js and Tailwind CSS.",
      ],
      logo: "/images/experience/my_next_developer_logo.jpg",
    },
    {
      id: 2,
      title: "Software Engineer Intern",
      location: "MND Technologies Pvt Ltd",
      date: "Jun 2023 - Jun 2024",
      description: [
        "Built full-stack components for a resume builder web app using Next.js, Express.js, and MongoDB.",
        "Developed intuitive UI components for TechTailz, a SaaS platform for pet care services, using Next.js, Tailwind CSS, and Ant Design.",
        "Contributed to both frontend and backend development for Vision Cure, an ophthalmic device company, using Next.js, NestJS, and PostgreSQL to streamline test and doctor management.",
        "Utilized Git, GitHub, and Bitbucket for effective version control and collaborative development workflows.",
      ],
      logo: "/images/experience/my_next_developer_logo.jpg",
    },
    {
      id: 3,
      title: "Research Intern",
      location: "KJ Somaiya College Of Engineering",
      date: "Sep 2022 - Jun 2023",
      description: [
        "Utilized the Track Anything library to perform precise video segmentation on drone-captured forest footage.",
        "Published the 'Dronescape' dataset—a high-resolution drone footage dataset for tree region segmentation—on IEEE DataPort.",
      ],
      logo: "/images/experience/kjsce-logo.png",
    },
  ];

  return (
    <section id="experience">
      <Timeline data={items} />
    </section>
  );
};
