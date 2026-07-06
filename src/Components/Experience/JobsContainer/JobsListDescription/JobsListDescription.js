import React from "react";
import PropTypes from "prop-types";
import classes from "./JobsListDescription.module.scss";

import JobsListElement from "./JobsListElement/JobsListElement";

const JobsListDescription = (props) => {
  return (
    <ul className={classes.jobListDescription}>
      <JobsListElement description={props.description} />
    </ul>
  );
};

JobsListDescription.propTypes = {
  description: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default JobsListDescription;
