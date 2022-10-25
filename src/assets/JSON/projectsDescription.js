import loginPage from "../images/myProjects/loginPage.png";
import portfolioV1 from "../images/myProjects/portfolioV1Desktop1.png";
import portfolioV2 from "../images/myProjects/portfolioV2.png";
import repairsForYou from "../images/myProjects/repairsForYouMobile1.png";

const projectsData = [
  {
    title: "Current Portfolio",
    img: portfolioV2,
    description:
      "The newest version of my portfolio where I merged together my love to coding and curiosity about space.",
    technologies: ["JavaScript", "React.js", "Three.js", "SASS"],
    linkGithub: "https://github.com/Pat-On/Portfolio_Page",
    linkLive: "https://heroic-malasada-d26670.netlify.app/",
  },
  {
    title: "Sign-up Form",
    img: loginPage,
    description:
      "Fully functional sign-up form, with validation of users input and unit tests written by using Jest.js library.",
    technologies: ["JavaScript", "React.js", "Jest", "CSS"],
    linkGithub: "https://github.com/Pat-On/signup-form-assessment",
    linkLive: "https://sign-up-form-patryk-nowak.netlify.app/",
  },
  {
    title: "Portfolio V1",
    img: portfolioV1,
    description:
      "My first portfolio that I done during my boot-camp, by using React and SASS. Project this follow best practices of responsive design. ",
    technologies: [
      "JavaScript",
      "React.js",
      "React-Router",
      "Particle.js",
      "CSS",
    ],
    linkGithub: "https://github.com/Pat-On/portfolio-pat-on",
    linkLive: "https://patryk-nowak-portfolio.netlify.app/",
  },
  {
    title: "Repairer Service Website",
    img: repairsForYou,
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
     Nulla quis odio ullamcorper, faucibus purus ac, lobortis tortor. Mauris et quam blandit, vestibulum tellus nec, scelerisque tortor.`,
    technologies: [
      "JavaScript",
      "Express",
      "jsonwebtoken",
      "PostgresSQL",
      "React.js",
      "SASS",
    ],
    linkGithub: "https://github.com/Pat-On/repairs_for_you",
    linkLive: "",
  },
];

export { projectsData };
