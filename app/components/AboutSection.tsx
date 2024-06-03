"use client";
import { useState } from "react";
import { TabButton } from "./TabButton";
import Image from "next/image";

export const AboutSection = () => {
  const [tab, setTab] = useState("skills");

  const skills = [
    {
      name: "Prisma",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg",
    },
    {
      name: "PostgreSQL",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    },
    {
      name: "JavaScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    },
    {
      name: "Docker",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
    },
    {
      name: "MongoDB",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
    },
    {
      name: "Git",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
    },
    {
      name: "Firebase",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg",
    },
    {
      name: "HTML",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
    },
    {
      name: "CSS",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
    },
    {
      name: "Next.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
    },
    {
      name: "Node.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
    },
    {
      name: "TypeScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
    },
  ];
  const certifications = [
    "Introduction To Cloud Computing - IBM",
    "Version Control - Meta",
  ];
  const hobbies = [
    "Listening to Music",
    "Reading Books",
    "Listening to Podcasts",
  ];

  const TAB_DATA = [
    {
      id: "skills",
      content: (
        <div className="flex flex-wrap cursor-pointer gap-4">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="p-2 flex gap-2 border rounded-md text-xs sm:text-sm hover:border-[#7074e5] hover:text-[#74aff5] w-fit"
            >
              <Image
                src={skill.icon}
                alt="tech-stack-icons"
                height={20}
                width={20}
              />
              {skill.name}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "certifications",
      content: (
        <div className="flex flex-wrap cursor-pointer gap-4">
          {certifications.map((certificate, index) => (
            <div
              key={index}
              className="p-2 border rounded-md text-sm hover:border-[#7074e5] hover:text-[#74aff5] w-fit"
            >
              {certificate}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "hobbies",
      content: (
        <div className="flex flex-wrap cursor-pointer gap-4">
          {hobbies.map((hobby, index) => (
            <div
              key={index}
              className="p-2 border rounded-md text-sm hover:border-[#7074e5] hover:text-[#74aff5] w-fit"
            >
              {hobby}
            </div>
          ))}
        </div>
      ),
    },
  ];
  const handleTabChange = (id: string) => {
    setTab(id);
  };

  return (
    <section className="text-white" id="about">
      <div className="flex flex-col items-center py-8 px-2 xl:gap-16 sm:py-16 xl:px-24">
        <div className="flex flex-col mt-4 md:mt-0 text-left h-full">
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-white">
            About Me
          </h2>
          <p className="text-base lg:text-lg">
            I am a software engineer who is passionate about technology. I have
            experience in web development using frameworks such as Nest.js,
            Express.js, and Next.js. I am also familiar with databases like
            PostgreSQL and MongoDB. I am a quick learner, highly organized, and
            detail-oriented, with a strong ability to work independently and in
            a team. I am also excited to learn new technologies and techniques
            to improve my skills.
          </p>
          <div className="flex flex-row justify-start mt-8">
            <TabButton
              selectTab={() => handleTabChange("skills")}
              active={tab === "skills"}
            >
              Skills
            </TabButton>
            <TabButton
              selectTab={() => handleTabChange("certifications")}
              active={tab === "certifications"}
            >
              Certifications
            </TabButton>
            <TabButton
              selectTab={() => handleTabChange("hobbies")}
              active={tab === "hobbies"}
            >
              Hobbies
            </TabButton>
          </div>
          <div className="mt-8">
            {TAB_DATA.find((data) => data.id === tab)?.content}
          </div>
        </div>
      </div>
    </section>
  );
};
