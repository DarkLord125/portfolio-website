"use client";
import { useRef, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectTag } from "./ProjectTag";
import { motion, useInView } from "motion/react";

export const ProjectSection = () => {
  const projectsData = [
    {
      id: 1,
      title: "MusicTune",
      description:
        "It is a music streaming web player where you can search songs and listen to your favourite songs",
      image: "/images/projects/music-tune.png",
      tag: ["All", "Web"],
      gitUrl: "https://github.com/DarkLord125/MusicTune",
      previewUrl: "",
    },
    {
      id: 2,
      title: "Attend Now",
      description:
        "It is an online attendance management system that utilizes facial recognition to track student attendance.",
      image: "/images/projects/attend-now.png",
      tag: ["All", "Web"],
      gitUrl: "https://github.com/DarkLord125/AtttendNow",
      previewUrl: "",
    },
    {
      id: 3,
      title: "Society Management System",
      description:
        "A web portal designed to manage your society residents, staff, visitors, billing, online payment, documents",
      image: "/images/projects/society-management-system.png",
      tag: ["All", "Web"],
      gitUrl: "https://github.com/DarkLord125/Society-Management-System",
      previewUrl: "",
    },
    {
      id: 4,
      title: "BooksHive",
      description:
        "It is a bookstore app in which users can browse and explore a wide variety of books across different genres, ratings etc and can purchase them",
      image: "/images/projects/BooksHive.jpg",
      tag: ["All", "Mobile"],
      gitUrl: "https://github.com/DarkLord125/BooksHive",
      previewUrl: "",
    },
  ];

  const [tag, setTag] = useState("All");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const filteredProjects = projectsData.filter((project) =>
    project.tag.includes(tag)
  );

  const cardVariants = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  return (
    <section id="projects" ref={ref}>
      <h2 className="text-center text-2xl lg:text-4xl font-bold text-white mt-4 mb-2 md:mb-4">
        My Projects
      </h2>
      <div className="text-white flex flex-row justify-center items-center gap-2 py-6">
        <ProjectTag
          name="All"
          isSelected={tag === "All"}
          onClick={() => setTag("All")}
        />
        <ProjectTag
          name="Web"
          isSelected={tag === "Web"}
          onClick={() => setTag("Web")}
        />
        <ProjectTag
          name="Mobile"
          isSelected={tag === "Mobile"}
          onClick={() => setTag("Mobile")}
        />
      </div>
      <ul className="grid md:grid-cols-2 gap-8 md:gap-12">
        {filteredProjects.map((project) => (
          <motion.li
            key={project.id}
            variants={cardVariants}
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            transition={{ duration: 0.3, delay: project.id * 0.3 }}
          >
            <ProjectCard
              title={project.title}
              imgUrl={project.image}
              description={project.description}
              gitHubUrl={project.gitUrl}
              previewUrl={project.previewUrl}
            />
          </motion.li>
        ))}
      </ul>
    </section>
  );
};
