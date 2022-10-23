import React from "react";
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

export default JobsContainer;
