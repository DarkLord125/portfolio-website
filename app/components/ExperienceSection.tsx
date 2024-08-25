"use client";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import Image from "next/image";
import { ReactNode } from "react";

interface ExperienceItemsProps {
  id: number;
  title: string;
  location: string;
  description: ReactNode;
  date: string;
  logo: string;
}

const textStyles = "text-black text-sm sm:text-base mt-1";

export const ExperienceSection = () => {
  const items: ExperienceItemsProps[] = [
    {
      id: 1,
      title: "Software Engineer Intern",
      location: "MND Technologies Pvt Ltd",
      description: (
        <ul className="list-disc px-4">
          <li className={textStyles}>
            Developed and implemented responsive UI components for a recruitment
            platform using Next.js and Tailwind CSS.
          </li>
        </ul>
      ),
      date: "July 2024 - present",
      logo: "/images/experience/my_next_developer_logo.jpg",
    },
    {
      id: 2,
      title: "Software Engineer",
      location: "MND Technologies Pvt Ltd",
      description: (
        <ul className="list-disc px-4">
          <li className={textStyles}>
            Worked on the frontend and backend components for a resume builder
            web app using Next.js, Express.js and MongoDB.
          </li>
          <li className={textStyles}>
            Contributed to the frontend application for a pet services SaaS
            start-up using Next.js, Tailwind CSS and AntDesign.
          </li>
          <li className={textStyles}>
            Worked on the frontend and backend for an ophthalmic device company
            to manage doctors and tests using Next.js, Nest.js and PostgreSQL.
          </li>
          <li className={textStyles}>
            Employed Git, Github and Bitbucket for version control and
            collaborative code management.
          </li>
        </ul>
      ),
      date: "June 2023 - June 2024",
      logo: "/images/experience/my_next_developer_logo.jpg",
    },
    {
      id: 3,
      title: "Research Intern",
      location: "KJ Somaiya College Of Engineering, Vidyavihar",
      description: (
        <ul className="list-disc px-4">
          <li className={textStyles}>
            Used Track Anything library, to perform video segmentation on drone
            footage of forests.
          </li>
          <li className={textStyles}>
            Published a dataset titled - Dronescape: A high-resolution drone
            footage dataset for tree region segmentation on IEEE DataPort.
          </li>
        </ul>
      ),
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
        <VerticalTimeline animate={false}>
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
              {item.description}
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
};
