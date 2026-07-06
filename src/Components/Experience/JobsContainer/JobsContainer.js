import React from "react";
import PropTypes from "prop-types";
import classes from "./JobsContainer.module.scss";

import JobsListDescription from "./JobsListDescription/JobsListDescription";

const JobsContainer = (props) => {
  return (
    <div className={classes.jobContainer}>
      <h3 className={classes.jobContainer__title}>
        {props.title} at{" "}
        <a className={classes.jobContainer__link} href={props.link}>
          {props.company}
        </a>
      </h3>
      <h4 className={classes.jobContainer__time}>{props.time}</h4>
      <JobsListDescription description={props.description} />
    </div>
  );
};

JobsContainer.propTypes = {
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  description: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default JobsContainer;
