import React from "react";
import PropTypes from "prop-types";
import classes from "./ControllerElement.module.scss";

const ControllerElement = (props) => {
  const isChosen = props.val === props.chosenJob;
  const btnClass = isChosen
    ? `${classes.controlList__button} ${classes.controlList__buttonChosen}`
    : classes.controlList__button;

  return (
    <li className={classes.controlList__element} role="presentation">
      <button
        className={btnClass}
        value={props.val}
        onClick={props.onSelect}
        role="tab"
        aria-selected={isChosen}
      >
        {props.label}
      </button>
    </li>
  );
};

ControllerElement.propTypes = {
  val: PropTypes.string.isRequired,
  chosenJob: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ControllerElement;
