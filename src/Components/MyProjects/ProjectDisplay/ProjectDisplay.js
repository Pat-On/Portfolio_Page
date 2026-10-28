import React from "react";
import PropTypes from "prop-types";
import classes from "./ProjectDisplay.module.scss";

const ProjectDisplay = (props) => {
  return (
    <img
      className={classes.projectImage}
      src={props.img}
      alt={props.title ? `Screenshot of ${props.title}` : "Screenshot of the project"}
      loading="lazy"
    />
  );
};

ProjectDisplay.propTypes = {
  img: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default ProjectDisplay;
