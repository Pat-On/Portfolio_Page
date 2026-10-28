import loginPage from "../images/myProjects/loginPage.png";
import portfolioV1 from "../images/myProjects/portfolioV1Desktop1.png";
import portfolioV2 from "../images/myProjects/portfolioV2.png";
import repairsForYou from "../images/myProjects/repairsForYouDesktop1.png";

// `featured: true` projects lead the Selected Projects section; the rest are
// surfaced as a quiet "Earlier work" link to GitHub to keep the focus on the
// strongest, most representative work.
const projectsData = [
  {
    title: "Current Portfolio",
    img: portfolioV2,
    featured: true,
    description:
      "This site — a portfolio that merges my love of coding with my curiosity about space. The entire solar system is built procedurally in Three.js (no model files) and runs as an interactive WebGL layer behind the React UI.",
    technologies: ["JavaScript", "React.js", "Three.js", "SASS"],
    linkGithub: "https://github.com/Pat-On/Portfolio_Page",
    linkLive: "https://patryk-nowak-portfolio.netlify.app",
  },
  {
    title: "Repairer Service Website",
    img: repairsForYou,
    featured: true,
    description: `A full-stack repair-booking app built with a small team, featuring complete authentication and role-based authorisation with routes protected by middleware.`,
    technologies: ["JavaScript", "Express", "PostgreSQL", "React.js", "SASS"],
    linkGithub: "https://github.com/Pat-On/repairs_for_you",
    linkLive: "",
  },
  {
    title: "Sign-up Form",
    img: loginPage,
    featured: false,
    description:
      "Fully functional sign-up form, with user input validation that include tips for a user on what input is wrong and unit tests written using Jest.js library.",
    technologies: ["JavaScript", "React.js", "Jest", "CSS"],
    linkGithub: "https://github.com/Pat-On/signup-form-assessment",
    linkLive: "https://sign-up-form-patryk-nowak.netlify.app/",
  },
  {
    title: "Portfolio V2",
    img: portfolioV1,
    featured: false,
    description:
      "The first portfolio I did during my boot-camp using React and SASS. Project this follows best practices of responsive design.",
    technologies: [
      "JavaScript",
      "React.js",
      "React-Router",
      "Particle.js",
      "CSS",
    ],
    linkGithub: "https://github.com/Pat-On/portfolio-pat-on",
    linkLive: "https://old-portfolio-v2-patryk-nowak.netlify.app/",
  },
];

// Featured projects, in display order. Falls back to all projects if none are
// explicitly flagged.
const featuredProjects = projectsData.filter((p) => p.featured);

const earlierProjects = projectsData.filter((p) => !p.featured);

const GITHUB_PROFILE = "https://github.com/Pat-On";

export { projectsData, featuredProjects, earlierProjects, GITHUB_PROFILE };
