import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classes from "./ProjectTour.module.scss";

// A short walk-through of one project: a screenshot per step with a caption
// saying what to notice. MyProjects remounts it per project (via `key`), so
// switching project always starts the tour from the first step.
const ProjectTour = ({ steps }) => {
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

  const scrollToHeader = () => {
    const header = document.querySelector("header");
    if (header) header.scrollIntoView({ behavior: "smooth" });
  };

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

      <div className={classes.tour__caption} aria-live="polite">
        <h3 className={classes.tour__heading}>{current.heading}</h3>
        <p className={classes.tour__body}>{current.body}</p>
        {current.tryIt && (
          <button className={classes.tour__tryIt} onClick={scrollToHeader}>
            Try it now ↑
          </button>
        )}
      </div>

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
      tryIt: PropTypes.bool,
    })
  ).isRequired,
};

export default ProjectTour;
