import React from "react";
import classes from "./ProjectControlPanel.module.scss";

import GoldButton from "../../../UI/GoldButton/GoldButton";

const ProjectControlPanel = () => {
  return (
    <ul className={classes.controlPanel}>
      <li>
        <GoldButton company="Project 1" />
      </li>
      <li>
        <GoldButton company="Project 2" />
      </li>
      <li>
        <GoldButton company="Project 3" />
      </li>
      <li>
        <GoldButton company="Project 4" />
      </li>
    </ul>
  );
};

export default ProjectControlPanel;
