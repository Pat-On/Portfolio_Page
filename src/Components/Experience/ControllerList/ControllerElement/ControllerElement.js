import React from "react";
import classes from "./ControllerElement.module.scss";

const ControllerElement = (props) => {
  return (
    <li className={classes.controlList__element} key={props.keyVal}>
      <button className={classes.controlList__button} value={props.val}>
        {props.company}
      </button>
    </li>
  );
};

export default ControllerElement;
