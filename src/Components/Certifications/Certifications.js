import React from "react";
import classes from "./Certifications.module.scss";
import az305 from "../../assets/icons/az305.png";

// TODO: Carousel
const Certifications = (props) => {
  return (
    <div className={classes.certifications}>
      <h2>Selected Certifications:</h2>
      <div className={classes.certifications__image}>
        <p>←</p>
        <img src={az305} alt="az305 certification" />
        <p>→</p>
      </div>
    </div>
  );
};

export default Certifications;
