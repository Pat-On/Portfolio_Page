import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classes from "./Carousel.module.scss";
import GoldButton from "../../../UI/GoldButton/GoldButton";

const Carousel = (props) => {
  const [certData] = useState(props.dataCert);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;
    // Respect users who opt out of motion — no auto-advance for them
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % certData.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused, certData.length]);

  const toLeft = () =>
    setCurrentIndex((i) => (i - 1 + certData.length) % certData.length);

  const toRight = () => setCurrentIndex((i) => (i + 1) % certData.length);

  return (
    <>
      <div
        className={classes.carousel__container}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {certData.map((item) => {
          return (
            <div
              className={classes.carousel__item}
              style={{ transform: `translate(-${currentIndex * 100}%)` }}
              key={item.title}
            >
              <div className={classes.carousel__wrapper}>
                <img
                  className={classes.carousel__img}
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                />
                <h3 className={classes.carousel__certTitle}>{item.title}</h3>
              </div>
            </div>
          );
        })}
      </div>
      <ul className={classes.carousel__control}>
        <li>
          <GoldButton
            action={toLeft}
            company={"<"}
            ariaLabel="Previous certification"
          />
        </li>
        <li>
          <GoldButton
            action={toRight}
            company={">"}
            ariaLabel="Next certification"
          />
        </li>
      </ul>
    </>
  );
};

Carousel.propTypes = {
  dataCert: PropTypes.arrayOf(
    PropTypes.shape({
      img: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Carousel;
