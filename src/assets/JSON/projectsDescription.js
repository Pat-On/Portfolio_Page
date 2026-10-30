import loginPage from "../images/myProjects/loginPage.png";
import portfolioV1 from "../images/myProjects/portfolioV1Desktop1.png";
import portfolioHero from "../images/myProjects/portfolioHero.jpg";
import portfolioExplore from "../images/myProjects/portfolioExplore.jpg";
import portfolioCombat from "../images/myProjects/portfolioCombat.jpg";
import portfolioMobile from "../images/myProjects/portfolioMobile.jpg";
import repairsForYou from "../images/myProjects/repairsForYouDesktop1.png";
import repairsForYouMission from "../images/myProjects/repairsForYouDesktop2.png";
import repairsForYouMobile from "../images/myProjects/repairsForYouMobileTrio.png";

// `featured: true` projects lead the Selected Projects section; the rest are
// surfaced as a quiet "Earlier work" link to GitHub to keep the focus on the
// strongest, most representative work.
//
// A featured project's `tour` is the short guided walk-through shown in its
// panel: one screenshot per step, with a caption saying what to notice.
const projectsData = [
  {
    title: "Current Portfolio",
    img: portfolioHero,
    featured: true,
    description:
      "This site — a portfolio that merges my love of coding with my curiosity about space. The entire solar system is built procedurally in Three.js (no model files) and runs as an interactive WebGL layer behind the React UI.",
    technologies: ["JavaScript", "React.js", "Three.js", "SASS"],
    linkGithub: "https://github.com/Pat-On/Portfolio_Page",
    // No live-site link: the visitor is already on it, and the tour's Explore
    // and Game Mode buttons are the live demo.
    linkLive: "",
    tour: [
      {
        img: portfolioHero,
        alt: "The portfolio's hero section over the Three.js solar system",
        heading: "The site",
        body: "Everything behind the text is live WebGL. The planets, their textures and the starfield are generated in code when the page loads; there are no model files.",
      },
      {
        img: portfolioExplore,
        alt: "Explore mode: ships and a Death Star drifting among the stars",
        heading: "Fly through it",
        body: "Fly through the system yourself: WASD and the mouse on desktop, or a thumb on each side of the screen on a phone. Explore is also in the MENU at the top of the page.",
        tryIt: "explore",
      },
      {
        img: portfolioCombat,
        alt: "Game Mode in play: the sun and planets ahead, with the radar, score and hull bar on screen",
        heading: "Combat mode",
        body: "Game Mode turns the scene into a small space shooter: clear eight waves of ships, then destroy the Death Star. The game code is loaded only when you start it, so the page itself stays light.",
        tryIt: "game",
      },
      {
        img: portfolioMobile,
        alt: "The portfolio on two phone screens: the hero and the Selected Projects tour",
        heading: "Built to behave",
        body: "Responsive down to phones, keyboard-navigable, and the 3D scene stands still for anyone who has reduced motion turned on. Components are tested with Jest and React Testing Library.",
      },
    ],
  },
  {
    title: "Repairer Service Website",
    img: repairsForYou,
    featured: true,
    description: `A full-stack repair-booking app built with a small team, featuring complete authentication and role-based authorisation with routes protected by middleware.`,
    technologies: ["JavaScript", "Express", "PostgreSQL", "React.js", "SASS"],
    linkGithub: "https://github.com/Pat-On/repairs_for_you",
    linkLive: "",
    tour: [
      {
        img: repairsForYou,
        alt: "Repairs For You home page: Find a Repairer From Your Community",
        heading: "Find a repairer",
        body: "Customers find a local repairer or ask for a price; repairers can sign up to offer their services.",
      },
      {
        img: repairsForYouMission,
        alt: "The Our Mission section naming Coventry Refugee and Migrant Centre and Code Your Future",
        heading: "Who it is for",
        body: "Built at Code Your Future for the Coventry Refugee and Migrant Centre, to help refugees and migrants offer home-repair services across Coventry.",
      },
      {
        img: repairsForYouMobile,
        alt: "Three phone screenshots: the home page, the open menu and the mission section",
        heading: "On a phone",
        body: "The layout reflows for small screens, with a slide-out menu. Behind it sit authentication and role-based access, with routes protected by Express middleware.",
      },
    ],
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
