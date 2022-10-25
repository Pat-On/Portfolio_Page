import React from "react";
import classes from "./ControllerElement.module.scss";

import GoldButton from "../../../../UI/GoldButton/GoldButton";

const ControllerElement = (props) => {
  return (
    <li className={classes.controlList__element}>
      <GoldButton
        company={props.company}
        val={props.val}
        chosenJob={props.chosenJob}
      />
    </li>
  );
};

export default ControllerElement;
