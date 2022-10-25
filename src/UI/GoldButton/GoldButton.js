import React from "react";
import classes from "./GoldButton.module.scss";

const GoldButton = (props) => {
  let styling = classes.goldButton;
  if (props.val === props.chosenJob) {
    styling = `${classes.goldButton} ${classes.goldButton__chosen}`;
  }

  return (
    <button className={styling} value={props.val}>
      {props.company}
    </button>
  );
};

export default GoldButton;
