import React from "react";
import classes from "./MyProjects.module.scss";

import githubLogo from "../../assets/icons/iconmonstr-github-2.svg";

const MyProjects = (props) => {
  return (
    <div className={classes.myProjects}>
      <h2>My Projects</h2>
      <h3>
        If You want to check what I am currently working on and what I have done
        in past
      </h3>
      <h3>Check my:</h3>
      <a
        rel="noreferrer"
        className={classes.links}
        href="https://github.com/Pat-On"
        target="_blank"
      >
        <img src={githubLogo} alt="Git Hub logo" />
      </a>
    </div>
  );
};

export default MyProjects;
