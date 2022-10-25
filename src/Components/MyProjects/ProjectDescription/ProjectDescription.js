import React from "react";
import classes from "./ProjectDescription.module.scss";

import linkIcon from "../../../assets/icons/linkIcon.svg";
import githubLogo from "../../../assets/icons/iconmonstr-github-2.svg";

const ProjectDescription = (props) => {
  return (
    <>
      <h2>Portfolio Webpage</h2>
      <p>
        This is my the most current version of portfolio, that is fantastic.
      </p>
      <ul className={classes.techList}>
        <li>JavaScript</li>
        <li>React.js</li>
        <li>Three.js</li>
        <li>SCSS</li>
      </ul>
      <ul className={classes.projectLinks}>
        <li>
          <a
            rel="noreferrer"
            className={classes.links}
            href="https://github.com/Pat-On"
            target="_blank"
          >
            <img src={githubLogo} alt="Git Hub logo" />
          </a>
        </li>
        <li>
          <a
            rel="noreferrer"
            className={classes.links}
            href="https://github.com/Pat-On"
            target="_blank"
          >
            <img
              src={linkIcon}
              alt="By Raj Dev https://freeicons.io/profile/714"
            />
          </a>
        </li>
      </ul>
    </>
  );
};

export default ProjectDescription;
