import React, { useState } from "react";
import classes from "./MyProjects.module.scss";

import ProjectDisplay from "./ProjectDisplay/ProjectDisplay";
import ProjectDescription from "./ProjectDescription/ProjectDescription";
import ProjectControlPanel from "./ProjectControlPanel/ProjectControlPanel";

import { projectsData } from "../../assets/JSON/projectsDescription";

const MyProjects = (props) => {
  const [activeProj, setActiveProj] = useState("0");
  const [proj, setProj] = useState(projectsData[0]);

  const projectSwitcher = (e) => {
    if (!e.target.value) return;
    const chosenProj = e.target.value;
    setProj((prev) => projectsData[chosenProj]);
    setActiveProj((prev) => chosenProj);
  };

  return (
    <div className={classes.myProjects}>
      <h2 className={classes.myProjects__title}>My Projects</h2>

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
        <ProjectControlPanel projects={projectsData} chosenProj={activeProj} />
      </div>
    </div>
  );
};

export default MyProjects;
