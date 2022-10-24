import React from "react";
import classes from "./MyProjects.module.scss";

// Icon by <a href="https://freeicons.io/profile/714">Raj Dev</a> on <a href="https://freeicons.io">freeicons.io</a>
import linkIcon from "../../assets/icons/linkIcon.svg";
import githubLogo from "../../assets/icons/iconmonstr-github-2.svg";
import portfoliov2 from "../../assets/images/myProjects/portfolioV2.png";

// TODO: Think about a nice way of displaying here project in next version
const MyProjects = (props) => {
  return (
    <div className={classes.myProjects}>
      <h2 className={classes.myProjects__title}>My Projects</h2>

      <div className={classes.myProjects__imgContainer}>
        <img src={portfoliov2} />
      </div>

      <div className={classes.myProjects__descriptionContainer}>
        <h2>Portfolio Webpage</h2>
        <p>
          This is my the most current version of portfolio, that is fantastic.
        </p>
        <ul>
          <li>JavaScript</li>
          <li>React.js</li>
          <li>Three.js</li>
          <li>SCSS</li>
        </ul>

        <a
          rel="noreferrer"
          className={classes.links}
          href="https://github.com/Pat-On"
          target="_blank"
        >
          <img src={githubLogo} alt="Git Hub logo" />
        </a>
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
      </div>

      <div className={classes.myProjects__controllerContainer}>
        <ul>
          <li>Project 1</li>
          <li>Project 2</li>
          <li>Project 3</li>
          <li>Project 4</li>
        </ul>
      </div>
    </div>
  );
};

export default MyProjects;

{
  /* <p>
If You want to check what I am currently working on and what I have done
previously
</p>
<p>Check my GitHub:</p>
<a
rel="noreferrer"
className={classes.links}
href="https://github.com/Pat-On"
target="_blank"
>
<img src={githubLogo} alt="Git Hub logo" />
</a>
<a
rel="noreferrer"
className={classes.links}
href="https://github.com/Pat-On"
target="_blank"
>
<img src={linkIcon} alt="By Raj Dev https://freeicons.io/profile/714" />
</a> */
}
