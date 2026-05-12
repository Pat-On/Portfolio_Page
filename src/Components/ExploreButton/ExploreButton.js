import React, { useState } from "react";
import classes from "./ExploreButton.module.scss";

const ExploreButton = ({ exploring, gameMode, onToggle, onGameModeToggle, isMobile }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(o => !o);
    onToggle();
  };

  const handleGameToggle = () => {
    setOpen(false);
    onGameModeToggle();
  };

  // While in explore / game mode the menu collapses — show only the active-state button
  if (exploring || gameMode) {
    return (
      <>
        {!gameMode && (
          <button
            className={`${classes.btn} ${classes.btn__active}`}
            onClick={onToggle}
          >
            ⬡ EXPLORING
          </button>
        )}
        {gameMode && (
          <button
            className={`${classes.btn} ${classes.btn__gameActive}`}
            onClick={handleGameToggle}
          >
            ⊕ IN COMBAT
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
  }

  return (
    <div className={classes.menu}>
      <button
        className={`${classes.btn} ${classes.hamburger} ${open ? classes.hamburger__open : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? "✕ CLOSE" : "☰ MENU"}
      </button>

      {open && (
        <div className={classes.dropdown}>
          <button
            className={`${classes.btn} ${classes.dropdownBtn}`}
            onClick={handleToggle}
          >
            ⬡ EXPLORE
          </button>
          <button
            className={`${classes.btn} ${classes.dropdownBtn}`}
            onClick={handleGameToggle}
          >
            ⊕ GAME MODE
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreButton;
