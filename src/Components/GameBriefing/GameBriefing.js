import React from "react";
import classes from "./GameBriefing.module.scss";

const DESKTOP_CONTROLS = [
  ["WASD", "move"],
  ["MOUSE", "aim"],
  ["HOLD CLICK", "fire"],
  ["SHIFT", "boost"],
  ["SPACE / E", "up / down"],
  ["P", "pause"],
  ["M", "mute"],
  ["ESC", "exit"],
];

const MOBILE_CONTROLS = [
  ["LEFT THUMB", "move"],
  ["RIGHT THUMB", "look"],
  ["FIRE", "hold to shoot"],
  ["BOOST", "hold to speed up"],
  ["⏸", "pause"],
];

const GameBriefing = ({ active, isMobile, onStart, onCancel }) => {
  if (!active) return null;

  const controls = isMobile ? MOBILE_CONTROLS : DESKTOP_CONTROLS;

  return (
    <div className={classes.overlay}>
      <h1 className={classes.title}>COMBAT BRIEFING</h1>
      <p className={classes.objective}>
        Hostile ships inbound. Clear 8 waves &mdash; destroy the Death Star.
      </p>
      <dl className={classes.controls}>
        {controls.map(([key, action]) => (
          <div className={classes.controlRow} key={key}>
            <dt className={classes.key}>{key}</dt>
            <dd className={classes.action}>{action}</dd>
          </div>
        ))}
      </dl>
      <p className={classes.tip}>
        Green pickups restore hull. Rebel and Imperial ships also fight each other.
      </p>
      <button className={classes.startBtn} onClick={onStart}>
        {isMobile ? "TAP TO START" : "CLICK TO START"}
      </button>
      <button className={classes.backBtn} onClick={onCancel}>
        BACK
      </button>
    </div>
  );
};

export default GameBriefing;
