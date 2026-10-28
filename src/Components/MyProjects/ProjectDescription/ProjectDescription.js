import React from "react";
import PropTypes from "prop-types";
import classes from "./ProjectDescription.module.scss";

import linkIcon from "../../../assets/icons/linkIconBlack.svg";
import githubLogo from "../../../assets/icons/githubLogo.svg";

const ProjectDescription = (props) => {
  return (
    <>
      <h2>{props.chosenProject.title}</h2>
      <p>{props.chosenProject.description}</p>
      <ul className={classes.techList}>
        {props.chosenProject.technologies.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <ul className={classes.projectLinks}>
        <li>
          {/* GitHub logo by Alan https://freeicons.io/profile/1353 */}
          <a
            rel="noreferrer"
            className={classes.links}
            href={props.chosenProject.linkGithub}
            target="_blank"
            aria-label={`${props.chosenProject.title} source code on GitHub`}
          >
            <img src={githubLogo} alt="" />
          </a>
        </li>
        {props.chosenProject.linkLive && (
          <li>
            {/* Link icon by Raj Dev https://freeicons.io/profile/714 */}
            <a
              rel="noreferrer"
              className={classes.links}
              href={props.chosenProject.linkLive}
              target="_blank"
              aria-label={`${props.chosenProject.title} live site`}
            >
              <img src={linkIcon} alt="" />
            </a>
          </li>
        )}
      </ul>
    </>
  );
};

ProjectDescription.propTypes = {
  chosenProject: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    technologies: PropTypes.arrayOf(PropTypes.string).isRequired,
    linkGithub: PropTypes.string.isRequired,
    linkLive: PropTypes.string,
  }).isRequired,
};

export default ProjectDescription;
