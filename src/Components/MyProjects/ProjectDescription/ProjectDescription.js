import React from "react";
import classes from "./ProjectDescription.module.scss";

import linkIcon from "../../../assets/icons/linkIcon.svg";
import githubLogo from "../../../assets/icons/iconmonstr-github-2.svg";

const ProjectDescription = (props) => {
  return (
    <>
      <h2>{props.chosenProject.title}</h2>
      <p>{props.chosenProject.description}</p>
      <ul className={classes.techList}>
        {props.chosenProject.technologies.map((tech) => (
          <li>{tech}</li>
        ))}
      </ul>
      <ul className={classes.projectLinks}>
        <li>
          <a
            rel="noreferrer"
            className={classes.links}
            href={props.chosenProject.linkGithub}
            target="_blank"
          >
            <img src={githubLogo} alt="Git Hub logo" />
          </a>
        </li>
        {props.chosenProject.linkLive && (
          <li>
            <a
              rel="noreferrer"
              className={classes.links}
              href={props.chosenProject.linkLive}
              target="_blank"
            >
              <img
                src={linkIcon}
                alt="By Raj Dev https://freeicons.io/profile/714"
              />
            </a>
          </li>
        )}
      </ul>
    </>
  );
};

export default ProjectDescription;
