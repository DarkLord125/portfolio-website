"use client";
import { BriefcaseIcon } from "@heroicons/react/16/solid";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import Image from "next/image";

export const ExperienceSection = () => {
  const items = [
    {
      id: 1,
      title: "Software Engineer Intern",
      location: "MND Technologies Pvt Ltd",
      description:
        "Developed and implemented responsive UI components for the Vision Cure project. Wrote efficient back-end code using Nest.js and Prisma, and managed the PostgreSQL database. Employed Git, Github and Bitbucket for version control and collaborative code management.  ",
      date: "June 2023 - present",
      logo: "/images/experience/my_next_developer_logo.jpg",
    },
    {
      id: 2,
      title: "Research Intern",
      location: "KJ Somaiya College Of Engineering, Vidyavihar",
      description:
        "Used Track Anything library, to perform video segmentation on drone footage of forests. Published a dataset titled - Dronescape: A high-resolution drone footage dataset for tree region segmentation on IEEE DataPort.",
      date: "September 2022 - June 2023",
      logo: "/images/experience/kjsce-logo.png",
    },
  ];

  return (
    <section id="experience">
      <h2 className="text-center text-2xl lg:text-4xl font-bold text-white mt-10 mb-8 md:mb-10">
        My Journey
      </h2>
      <div>
        <VerticalTimeline
          animate={false}
          // className="bg-gradient-to-r from-[#6b22cf] via-[#7074e5] to-[#74aff5]"
        >
          {items.map((item) => (
            <VerticalTimelineElement
              key={item.id}
              className="vertical-timeline-element--work"
              date={item.date}
              iconStyle={{
                // background: "rgb(233, 30, 99)",
                color: "#fff",
              }}
              icon={
                <Image
                  src={item.logo}
                  alt="logo"
                  height={70}
                  className="rounded-full"
                  width={70}
                />
              }
            >
              <h3 className="vertical-timeline-element-title text-black text-sm sm:text-base font-semibold">
                {item.title}
              </h3>
              <h4 className="vertical-timeline-element-subtitle text-black text-sm sm:text-base">
                {item.location}
              </h4>
              <p className="text-black text-sm sm:text-base">
                {item.description}
              </p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
};
