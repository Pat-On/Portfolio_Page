import React from "react";
import classes from "./Header.module.scss";

import profilePhoto from "../../assets/ProfilePhoto.jpeg";

const About = (props) => {
  return (
    <div className={classes.about}>
      <div className={classes.sectionRight}>
        <h4>Hi, my name is</h4>
        <h3>Patryk Nowak</h3>
        <h3>
          I love coding, building complicated system and solving problems.
        </h3>
        <p>
          I'm software engineer that is not afraid to work on the back-end and
          front-end to solve business problems. Currently I'm focused on
          expanding my skills in coding and Azure
        </p>
        <a
          className={classes.buttonCV}
          href="https://drive.google.com/u/0/uc?id=1ZRNlv_CfjR3pqzYbbeKq_NMJCQ_TFA8N&export=download"
        >
          Find My CV HERE
        </a>
      </div>

      <div className={classes.sectionLeft}>
        <img src={profilePhoto} alt="profile" />
      </div>
    </div>
  );
};

export default About;
