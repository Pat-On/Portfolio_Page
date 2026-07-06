import React from "react";
import classes from "./ControllerElement.module.scss";

const ControllerElement = (props) => {
  const isChosen = props.val === props.chosenJob;
  const btnClass = isChosen
    ? `${classes.controlList__button} ${classes.controlList__buttonChosen}`
    : classes.controlList__button;

  return (
    <li className={classes.controlList__element}>
      <button className={btnClass} value={props.val}>
        {props.label}
      </button>
    </li>
  );
};

export default ControllerElement;
