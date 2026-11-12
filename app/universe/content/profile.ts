export const PROFILE = {
  name: "Ashwin Nair",
  shortName: "Ashwin",
  title: "Software Engineer",
  welcome: "Welcome, Explorer. You've entered Ashwin's Universe.",
  photo: "/images/Ashwin.png",
};

export const ABOUT = {
  headline: "Software Engineer",
  facts: [
    { label: "Experience", value: "2+ years of professional development" },
    { label: "Focus", value: "Full-stack development" },
    { label: "Based at", value: "MND Technologies" },
  ],
  intro:
    "I am a software engineer who is passionate about technology. I build full-stack web applications for a living, and browser games and tools for the fun of it.",
  interests: [
    {
      title: "AI engineering",
      detail: "Putting language models to work inside real products.",
    },
    {
      title: "Developer tools",
      detail: "Things that make building software faster and less painful.",
    },
    {
      title: "Interactive applications",
      detail: "Games and real-time experiences that run in a browser tab.",
    },
  ],
  // Draft copy derived from how the three game projects are built.
  // TODO(ashwin): rewrite in your own words.
  philosophy: [
    {
      title: "Put the rules in one place",
      detail:
        "Game logic lives in an engine that the UI, the AI and the server all go through, so they cannot disagree about what is allowed.",
    },
    {
      title: "Measure, then optimise",
      detail:
        "Performance work starts from numbers taken on modest hardware, not from guesses.",
    },
    {
      title: "No install, no account",
      detail:
        "The best demo is a link. I like building things people can open and use straight away.",
    },
  ],
  certifications: [
    "Introduction to Cloud Computing — IBM",
    "Version Control — Meta",
  ],
  hobbies: ["Music", "Reading", "Podcasts", "Badminton", "Table tennis"],
};

export const CONTACT = {
  quote: "Every great journey begins with a connection.",
  blurb:
    "My inbox is always open. Whether you have a question or just want to say hi, I'll do my best to get back to you.",
  /** Shown as a mailto link only when set; otherwise the form is the way in. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  links: [
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/ashwinhnair/" },
    { id: "github", label: "GitHub", href: "https://github.com/DarkLord125" },
    { id: "x", label: "X", href: "https://x.com/AshwinN84178463" },
    { id: "medium", label: "Medium", href: "https://medium.com/@hashwin381" },
  ],
  resume: "/resume/resume.pdf",
};
