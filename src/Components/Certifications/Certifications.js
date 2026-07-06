import React from "react";
import classes from "./Certifications.module.scss";
import Carousel from "./carousel/Carousel";

import { certificationData } from "../../assets/JSON/certificationsData.js";

const Certifications = (props) => {
  return (
    <section className={classes.certifications} data-animate="true">
      <div className={classes.certifications__sectionHead}>
        <span className={classes.certifications__num}>04</span>
        <h2 className={classes.certifications__title}>Certifications</h2>
      </div>
      <Carousel dataCert={certificationData} />
    </section>
  );
};

export default Certifications;
