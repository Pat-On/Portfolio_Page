import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classes from "./ProjectTour.module.scss";
import { usePortfolioMode } from "../../../state/PortfolioModeContext";

// A short walk-through of one project: a screenshot per step with a caption
// saying what to notice. MyProjects remounts it per project (via `key`), so
// switching project always starts the tour from the first step.
const TRY_IT = {
  explore: { label: "Start Explore mode ↗", start: (mode) => mode.startExplore() },
  game: { label: "Play Game Mode ↗", start: (mode) => mode.openGame() },
};

const ProjectTour = ({ steps }) => {
  const mode = usePortfolioMode();
  const [step, setStep] = useState(0);
  const last = steps.length - 1;
  const current = steps[step];

  const goTo = (idx) => setStep(Math.min(Math.max(idx, 0), last));

  useEffect(() => {
    const next = steps[step + 1];
    if (next) new Image().src = next.img;
  }, [step, steps]);

  // Arrow keys work on any of the tour's buttons once one has focus.
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") goTo(step + 1);
    if (e.key === "ArrowLeft") goTo(step - 1);
  };

  // Inside App the button starts the mode itself; on its own (tests, or no
  // scene) it falls back to scrolling up to the hero.
  const tryIt = (kind) => {
    if (mode) return TRY_IT[kind].start(mode);
    const header = document.querySelector("header");
    if (header) header.scrollIntoView({ behavior: "smooth" });
  };

  const comeBackHint = mode?.isMobile
    ? "Goes full screen; tap the button in the top corner to come back."
    : "Takes over the screen; press Esc or the button in the top corner to come back.";

  return (
    <div
      className={classes.tour}
      role="group"
      aria-label="Project tour"
      aria-roledescription="carousel"
    >
      <figure className={classes.tour__figure}>
        <img
          key={current.img + step}
          className={classes.tour__image}
          src={current.img}
          alt={current.alt}
        />
      </figure>

      <div className={classes.tour__nav}>
        <button
          className={classes.tour__arrow}
          onClick={() => goTo(step - 1)}
          onKeyDown={onKeyDown}
          disabled={step === 0}
          aria-label="Previous step"
        >
          ‹
        </button>

        <ol className={classes.tour__dots}>
          {steps.map((s, idx) => (
            <li key={s.heading}>
              <button
                className={`${classes.tour__dot} ${idx === step ? classes.tour__dot_current : ""}`}
                onClick={() => goTo(idx)}
                onKeyDown={onKeyDown}
                aria-label={`Step ${idx + 1}: ${s.heading}`}
                aria-current={idx === step ? "step" : undefined}
              />
            </li>
          ))}
        </ol>

        <span className={classes.tour__counter}>
          {step + 1} / {steps.length}
        </span>

        <button
          className={classes.tour__arrow}
          onClick={() => goTo(step + 1)}
          onKeyDown={onKeyDown}
          disabled={step === last}
          aria-label="Next step"
        >
          ›
        </button>
      </div>

      <p className={classes.tour__srOnly} aria-live="polite">
        Step {step + 1} of {steps.length}: {current.heading}
      </p>

      {/* Every caption sits in the same grid cell, so the box always has the
          height of the longest one and nothing below it jumps between steps. */}
      <div className={classes.tour__captions}>
        {steps.map((s, idx) => (
          <div
            key={s.heading}
            className={`${classes.tour__caption} ${idx === step ? "" : classes.tour__caption_hidden}`}
            aria-hidden={idx === step ? undefined : "true"}
          >
            <h3 className={classes.tour__heading}>{s.heading}</h3>
            <p className={classes.tour__body}>{s.body}</p>
            {s.tryIt && (
              <div className={classes.tour__try}>
                <button
                  className={classes.tour__tryIt}
                  onClick={() => tryIt(s.tryIt)}
                  tabIndex={idx === step ? undefined : -1}
                >
                  {TRY_IT[s.tryIt].label}
                </button>
                <p className={classes.tour__hint}>{comeBackHint}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

ProjectTour.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      img: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
      heading: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      tryIt: PropTypes.oneOf(["explore", "game"]),
    })
  ).isRequired,
};

export default ProjectTour;
