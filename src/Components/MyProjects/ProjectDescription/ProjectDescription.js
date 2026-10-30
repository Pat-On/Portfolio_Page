import React from "react";
import PropTypes from "prop-types";
import classes from "./ProjectDescription.module.scss";

import linkIcon from "../../../assets/icons/linkIconBlack.svg";
import githubLogo from "../../../assets/icons/githubLogo.svg";

const ProjectDescription = (props) => {
  const { title, description, technologies, linkGithub, linkLive } =
    props.chosenProject;

  return (
    <>
      <h2 className={classes.title}>{title}</h2>
      <p className={classes.description}>{description}</p>
      <ul className={classes.techList} aria-label="Technologies">
        {technologies.map((tech) => (
          <li key={tech} className={classes.chip}>
            {tech}
          </li>
        ))}
      </ul>
      <div className={classes.projectLinks}>
        {linkLive && (
          // Link icon by Raj Dev https://freeicons.io/profile/714
          <a
            rel="noreferrer"
            className={classes.link}
            href={linkLive}
            target="_blank"
            aria-label={`${title}: live site`}
          >
            <img src={linkIcon} alt="" />
            Live site
          </a>
        )}
        {/* GitHub logo by Alan https://freeicons.io/profile/1353 */}
        <a
          rel="noreferrer"
          className={`${classes.link} ${classes.link__outline}`}
          href={linkGithub}
          target="_blank"
          aria-label={`${title}: code on GitHub`}
        >
          <img src={githubLogo} alt="" />
          Code
        </a>
      </div>
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
