import React from "react";
import classes from "./JobsListDescription.module.scss";

import JobsListElement from "./JobsListElement/JobsListElement";

const JobsListDescription = (props) => {
  return (
    <ul className={classes.jobListDescription}>
      <JobsListElement description={props.description} />
    </ul>
  );
};

export default JobsListDescription;
