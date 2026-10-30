import React, { useEffect, useRef } from "react";
import classes from "./GameBriefing.module.scss";

const DESKTOP_CONTROLS = [
  ["WASD", "move"],
  ["MOUSE", "aim"],
  ["HOLD CLICK", "fire (manual)"],
  ["SHIFT", "boost"],
  ["SPACE / E", "up / down"],
  ["P", "pause"],
  ["M", "mute"],
  ["ESC", "exit"],
];

const MOBILE_CONTROLS = [
  ["LEFT THUMB", "move"],
  ["RIGHT THUMB", "look"],
  ["FIRE", "hold to shoot (manual)"],
  ["BOOST", "hold to speed up"],
  ["⏸", "pause"],
];

const GameBriefing = ({ active, isMobile, autoFire, onAutoFireToggle, onStart, onCancel }) => {
  const startRef = useRef(null);
  const dialogRef = useRef(null);

  // Behave as a modal: focus the start button, Escape backs out, and focus
  // goes back to whatever opened the briefing once it closes
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement;
    startRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const buttons = dialogRef.current.querySelectorAll("button");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener && opener.isConnected && opener !== document.body) opener.focus();
    };
  }, [active, onCancel]);

  if (!active) return null;

  const controls = isMobile ? MOBILE_CONTROLS : DESKTOP_CONTROLS;

  return (
    <div
      ref={dialogRef}
      className={classes.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-briefing-title"
    >
      <h1 id="game-briefing-title" className={classes.title}>COMBAT BRIEFING</h1>
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
      <button
        className={`${classes.autoFireToggle} ${autoFire ? classes.autoFireOn : ""}`}
        onClick={onAutoFireToggle}
        aria-pressed={autoFire}
      >
        🎯 AUTO-FIRE: {autoFire ? "ON" : "OFF"}
      </button>
      <p className={classes.tip}>
        Green pickups restore hull. Rebel and Imperial ships also fight each other.
      </p>
      <button ref={startRef} className={classes.startBtn} onClick={onStart}>
        {isMobile ? "TAP TO START" : "CLICK TO START"}
      </button>
      <button className={classes.backBtn} onClick={onCancel}>
        BACK
      </button>
    </div>
  );
};

export default GameBriefing;
