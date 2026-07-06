import React from "react";
import PropTypes from "prop-types";
import classes from "./ProjectControlPanel.module.scss";

import GoldButton from "../../../UI/GoldButton/GoldButton";

const ProjectControlPanel = (props) => {
  const controlListElements = props.projects.map((proj, idx) => {
    return (
      <li key={proj.title} role="presentation">
        <GoldButton
          company={proj.title}
          val={`${idx}`}
          chosenJob={props.chosenProj}
          role="tab"
          action={props.onSelect}
        />
      </li>
    );
  });

  return (
    <ul className={classes.controlPanel} role="tablist" aria-label="Projects">
      {controlListElements}
    </ul>
  );
};

ProjectControlPanel.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  chosenProj: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ProjectControlPanel;
