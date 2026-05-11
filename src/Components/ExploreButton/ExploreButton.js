import React from "react";
import classes from "./ExploreButton.module.scss";

const ExploreButton = ({ exploring, gameMode, onToggle, onGameModeToggle, isMobile }) => (
  <>
    {!gameMode && (
      <button
        className={`${classes.btn} ${exploring && !gameMode ? classes.btn__active : ""}`}
        onClick={onToggle}
      >
        {exploring ? "⬡ EXPLORING" : "⬡ EXPLORE"}
      </button>
    )}

    {!exploring && (
      <button
        className={`${classes.btn} ${classes.btn__game} ${gameMode ? classes.btn__gameActive : ""}`}
        onClick={onGameModeToggle}
      >
        {gameMode ? "⊕ IN COMBAT" : "⊕ GAME MODE"}
      </button>
    )}

    {exploring && !gameMode && (
      <div className={classes.hint}>
        {isMobile
          ? "LEFT — move  |  RIGHT — look  |  BUTTON — exit"
          : "WASD — move  |  MOUSE — look  |  SPACE / E — up / down  |  ESC — exit"}
      </div>
    )}

    {gameMode && (
      <div className={classes.hint}>
        WASD — move  |  MOUSE — aim  |  AUTO-FIRE active  |  ESC — exit
      </div>
    )}
  </>
);

export default ExploreButton;
