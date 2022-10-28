import loginPage from "../images/myProjects/loginPage.png";
import portfolioV1 from "../images/myProjects/portfolioV1Desktop1.png";
import portfolioV2 from "../images/myProjects/portfolioV2.png";
import repairsForYou from "../images/myProjects/repairsForYouDesktop1.png";

const projectsData = [
  {
    title: "Current Portfolio",
    img: portfolioV2,
    description:
      "The newest version of my portfolio where I merged together my love to coding and curiosity about space.",
    technologies: ["JavaScript", "React.js", "Three.js", "SASS"],
    linkGithub: "https://github.com/Pat-On/Portfolio_Page",
    linkLive: "https://patryk-nowak-portfolio.netlify.app",
  },
  {
    title: "Repairer Service Website",
    img: repairsForYou,
    description: `The project, developed by a small team, has fully functional authentication and authorisation with different roles and routes protected by middleware.`,
    technologies: ["JavaScript", "Express", "PostgresSQL", "React.js", "SASS"],
    linkGithub: "https://github.com/Pat-On/repairs_for_you",
    linkLive: "",
  },
  {
    title: "Sign-up Form",
    img: loginPage,
    description:
      "Fully functional sign-up form, with user input validation that include tips for a user on what input is wrong and unit tests written using Jest.js library.",
    technologies: ["JavaScript", "React.js", "Jest", "CSS"],
    linkGithub: "https://github.com/Pat-On/signup-form-assessment",
    linkLive: "https://sign-up-form-patryk-nowak.netlify.app/",
  },
  {
    title: "Portfolio V2",
    img: portfolioV1,
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

export { projectsData };
