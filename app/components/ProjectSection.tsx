"use client";
import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectTag } from "./ProjectTag";

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
      previewUrl: null,
    },
    {
      id: 2,
      title: "Attend Now",
      description:
        "It is an online attendance management system that utilizes facial recognition to track student attendance.",
      image: "/images/projects/attend-now.png",
      tag: ["All", "Web"],
      gitUrl: "https://github.com/DarkLord125/AtttendNow",
      previewUrl: null,
    },
    {
      id: 3,
      title: "Society Management System",
      description:
        "A web portal designed to manage your society residents, staff, visitors, billing, online payment, documents",
      image: "/images/projects/society-management-system.png",
      tag: ["All", "Web"],
      gitUrl: "https://github.com/DarkLord125/Society-Management-System",
      previewUrl: null,
    },
    {
      id: 4,
      title: "BooksHive",
      description:
        "It is a book store app in which users can access various books and can purchase them",
      image: "/images/projects/BooksHive.jpg",
      tag: ["All", "Mobile"],
      gitUrl: "https://github.com/DarkLord125/BooksHive",
      previewUrl: null,
    },
  ];

  const [tag, setTag] = useState("All");

  const filteredProjects = projectsData.filter((project) => project.tag.includes(tag))

  return (
    <section id="projects">
      <h2 className="text-center text-2xl lg:text-4xl font-bold text-white mt-4 mb-8 md:mb-10">
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
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {filteredProjects.map((project) => (
          <div key={project.id}>
            <ProjectCard
              title={project.title}
              imgUrl={project.image}
              description={project.description}
              gitHubUrl={project.gitUrl}
              previewUrl={project.previewUrl}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
