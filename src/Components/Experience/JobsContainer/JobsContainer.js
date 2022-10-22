import React from "react";
import classes from "./JobsContainer.module.scss";

import JobsListDescription from "./JobsListDescription/JobsListDescription";

const JobsContainer = (props) => {
  return (
    <div className={classes.jobContainer}>
      <h3>
        {props.title} at {props.company}
      </h3>
      <h4>{props.time}</h4>
      <JobsListDescription description={props.description} />
      {/* <ul>
        <li>{props.description[0]}</li>
        <li>{props.description[1]}</li>
        <li>{props.description[2]}</li>
      </ul> */}
    </div>
  );
};

export default JobsContainer;
