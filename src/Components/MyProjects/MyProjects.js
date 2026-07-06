import React, { useState } from "react";
import classes from "./MyProjects.module.scss";

import ProjectDisplay from "./ProjectDisplay/ProjectDisplay";
import ProjectDescription from "./ProjectDescription/ProjectDescription";
import ProjectControlPanel from "./ProjectControlPanel/ProjectControlPanel";

import {
  featuredProjects,
  GITHUB_PROFILE,
} from "../../assets/JSON/projectsDescription";

const MyProjects = (props) => {
  const [activeProj, setActiveProj] = useState("0");
  const [proj, setProj] = useState(featuredProjects[0]);

  const projectSwitcher = (e) => {
    if (!e.target.value) return;
    const chosenProj = e.target.value;
    setProj((prev) => featuredProjects[chosenProj]);
    setActiveProj((prev) => chosenProj);
  };

  return (
    <section className={classes.myProjects} data-animate="true">
      <div className={classes.myProjects__sectionHead}>
        <span className={classes.myProjects__num}>03</span>
        <h2 className={classes.myProjects__title}>Selected Projects</h2>
      </div>

      <div className={classes.myProjects__imgContainer}>
        <ProjectDisplay img={proj.img} />
      </div>

      <div className={classes.myProjects__descriptionContainer}>
        <ProjectDescription chosenProject={proj} />
      </div>

      <div
        className={classes.myProjects__controllerContainer}
        onClick={projectSwitcher}
      >
        <ProjectControlPanel
          projects={featuredProjects}
          chosenProj={activeProj}
        />
      </div>

      <p className={classes.myProjects__earlier}>
        <a
          className={classes.myProjects__earlierLink}
          href={GITHUB_PROFILE}
          target="_blank"
          rel="noreferrer"
        >
          See earlier work on GitHub →
        </a>
      </p>
    </section>
  );
};

export default MyProjects;
