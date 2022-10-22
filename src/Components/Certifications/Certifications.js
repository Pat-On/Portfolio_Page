import React from "react";
import classes from "./Certifications.module.scss";
import Carousel from "./carousel/Carousel";

import { certificationData } from "../../assets/JSON/certificationsData.js";
// TODO: Carousel
const Certifications = (props) => {
  return (
    <div className={classes.certifications}>
      <h2>Selected Certifications:</h2>
      <Carousel dataCert={certificationData} />
    </div>
  );
};

export default Certifications;
