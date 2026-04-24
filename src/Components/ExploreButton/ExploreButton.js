import React from "react";
import classes from "./ExploreButton.module.scss";

const ExploreButton = ({ exploring, onToggle }) => (
  <>
    <button
      className={`${classes.btn} ${exploring ? classes.btn__active : ""}`}
      onClick={onToggle}
    >
      {exploring ? "⬡ EXPLORING" : "⬡ EXPLORE"}
    </button>

    {exploring && (
      <div className={classes.hint}>
        WASD — move &nbsp;|&nbsp; MOUSE — look &nbsp;|&nbsp; SPACE / E — up / down &nbsp;|&nbsp; ESC — exit
      </div>
    )}
  </>
);

export default ExploreButton;
