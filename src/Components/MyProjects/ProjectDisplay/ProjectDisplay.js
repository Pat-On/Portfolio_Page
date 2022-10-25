import React from "react";
import classes from "./ProjectDisplay.module.scss";

const ProjectDisplay = (props) => {
  return (
    <img
      className={classes.projectImage}
      src={props.img}
      alt="Screenshot of the project"
    />
  );
};

export default ProjectDisplay;
