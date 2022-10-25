import React from "react";
import classes from "./MyProjects.module.scss";

// Icon by <a href="https://freeicons.io/profile/714">Raj Dev</a> on <a href="https://freeicons.io">freeicons.io</a>

import portfoliov2 from "../../assets/images/myProjects/portfolioV2.png";

import ProjectDisplay from "./ProjectDisplay/ProjectDisplay";
import ProjectDescription from "./ProjectDescription/ProjectDescription";
import ProjectControlPanel from "./ProjectControlPanel/ProjectControlPanel";

// TODO: Think about a nice way of displaying here project in next version
const MyProjects = (props) => {
  return (
    <div className={classes.myProjects}>
      <h2 className={classes.myProjects__title}>My Projects</h2>

      <div className={classes.myProjects__imgContainer}>
        <ProjectDisplay img={portfoliov2} />
      </div>

      <div className={classes.myProjects__descriptionContainer}>
        <ProjectDescription />
      </div>

      <div className={classes.myProjects__controllerContainer}>
        <ProjectControlPanel />
      </div>
    </div>
  );
};

export default MyProjects;
