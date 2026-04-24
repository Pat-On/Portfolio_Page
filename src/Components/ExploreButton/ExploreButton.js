import React from "react";
import classes from "./ExploreButton.module.scss";

const ExploreButton = ({ exploring, onToggle, isMobile }) => (
  <>
    <button
      className={`${classes.btn} ${exploring ? classes.btn__active : ""}`}
      onClick={onToggle}
    >
      {exploring ? "⬡ EXPLORING" : "⬡ EXPLORE"}
    </button>

    {exploring && (
      <div className={classes.hint}>
        {isMobile
          ? "LEFT — move  |  RIGHT — look  |  BUTTON — exit"
          : "WASD — move  |  MOUSE — look  |  SPACE / E — up / down  |  ESC — exit"
        }
      </div>
    )}
  </>
);

export default ExploreButton;
