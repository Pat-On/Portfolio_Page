import React from "react";
import classes from "./ProjectControlPanel.module.scss";

import GoldButton from "../../../UI/GoldButton/GoldButton";

const ProjectControlPanel = (props) => {
  const controlListElements = props.projects.map((proj, idx) => {
    return (
      <li key={idx}>
        <GoldButton
          company={proj.title}
          val={`${idx}`}
          chosenJob={props.chosenProj}
        />
      </li>
    );
  });

  return <ul className={classes.controlPanel}>{controlListElements}</ul>;
};

export default ProjectControlPanel;
