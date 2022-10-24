import React from "react";
import classes from "./ControllerElement.module.scss";

const ControllerElement = (props) => {
  let styling = classes.controlList__button;
  if (props.val === props.chosenJob) {
    styling = `${classes.controlList__button} ${classes.controlList__buttonChosen}`;
  }

  return (
    <li className={classes.controlList__element} key={props.keyVal}>
      <button className={styling} value={props.val}>
        {props.company}
      </button>
    </li>
  );
};

export default ControllerElement;
