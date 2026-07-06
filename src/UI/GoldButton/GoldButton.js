import React from "react";
import PropTypes from "prop-types";
import classes from "./GoldButton.module.scss";

const GoldButton = (props) => {
  const isChosen = props.val === props.chosenJob;
  let styling = classes.goldButton;
  if (isChosen) {
    styling = `${classes.goldButton} ${classes.goldButton__chosen}`;
  }

  return (
    <button
      className={styling}
      value={props.val}
      onClick={props.action}
      aria-label={props.ariaLabel}
      role={props.role}
      aria-selected={props.role === "tab" ? isChosen : undefined}
    >
      {props.company}
    </button>
  );
};

GoldButton.propTypes = {
  val: PropTypes.string,
  chosenJob: PropTypes.string,
  company: PropTypes.node,
  action: PropTypes.func,
  ariaLabel: PropTypes.string,
  role: PropTypes.string,
};

export default GoldButton;
