import React from "react";
import classes from "./ProjectDescription.module.scss";

import linkIcon from "../../../assets/icons/linkIconBlack.svg";
import githubLogo from "../../../assets/icons/githubLogo.svg";

const ProjectDescription = (props) => {
  return (
    <>
      <h2>{props.chosenProject.title}</h2>
      <p>{props.chosenProject.description}</p>
      <ul className={classes.techList}>
        {props.chosenProject.technologies.map((tech, idx) => (
          <li key={idx}>{tech}</li>
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
            <img
              src={githubLogo}
              alt="Github logo by Alan https://freeicons.io/profile/1353"
            />
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
                alt="Link Icon by Raj Dev https://freeicons.io/profile/714"
              />
            </a>
          </li>
        )}
      </ul>
    </>
  );
};

export default ProjectDescription;
