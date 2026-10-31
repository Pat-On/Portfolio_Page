import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classes from "./ExploreButton.module.scss";

const ExploreButton = ({ exploring, gameMode, onToggle, onGameModeToggle, isMobile }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  // An open menu closes on Escape or on a press anywhere outside it
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen(o => !o);
    onToggle();
  };

  const handleGameToggle = () => {
    setOpen(false);
    // The dropdown item is about to unmount; keep focus somewhere real
    toggleRef.current?.focus();
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
          <div className={`${classes.hint} ${classes.hint__game}`}>
            {isMobile
              ? "LEFT — move  |  RIGHT — look  |  FIRE / BOOST — buttons"
              : "WASD — move  |  MOUSE — aim  |  HOLD CLICK — fire  |  SHIFT — boost  |  P — pause  |  ESC — exit"}
          </div>
        )}
      </>
    );
  }

  return (
    <div className={classes.menu} ref={menuRef}>
      <button
        ref={toggleRef}
        className={`${classes.btn} ${classes.hamburger} ${open ? classes.hamburger__open : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
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

ExploreButton.propTypes = {
  exploring: PropTypes.bool.isRequired,
  gameMode: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onGameModeToggle: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default ExploreButton;
