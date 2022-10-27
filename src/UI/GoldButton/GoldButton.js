import React from "react";
import classes from "./GoldButton.module.scss";

const GoldButton = (props) => {
  let styling = classes.goldButton;
  if (props.val === props.chosenJob) {
    styling = `${classes.goldButton} ${classes.goldButton__chosen}`;
  }

  let button = (
    <button className={styling} value={props.val}>
      {props.company}
    </button>
  );

  if (props.action) {
    button = (
      <button className={styling} value={props.val} onClick={props.action}>
        {props.company}
      </button>
    );
  }

  return button;
};

export default GoldButton;
