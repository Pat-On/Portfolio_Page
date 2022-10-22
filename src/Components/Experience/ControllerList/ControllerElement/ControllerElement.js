import React from "react";
import classes from "./ControllerElement.module.scss";

const ControllerElement = (props) => {
  return (
    <li key={props.keyVal}>
      <button value={props.val}>{props.company}</button>
    </li>
  );
};

export default ControllerElement;
